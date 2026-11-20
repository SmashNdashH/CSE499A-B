<#
.SYNOPSIS
L2 run 3 without babysitting: chains the 3B training sessions of option A (decided 19 Nov) on Kaggle.
Mode (c) runs on account 1; mode (b) runs on accounts 2 and 3, taking turns.

.DESCRIPTION
Windows Task Scheduler runs this every 3 minutes (see -Install and $EveryMin). Each run looks at each lane, one lane per mode:
- a session still running is left alone;
- a session that ended has its log and small outputs saved to ..\L2-step2-results\train-<mode>-<smoke|sessionN>\,
  and is checked: it finished cleanly, its losses are finite, the learning rate left 0 (real updates), the step count
  went up, it continued from the right checkpoint, and that checkpoint (or the finished adapter) is on Hugging Face;
- a lane whose last session passed starts its next session at once, on the lane's account with the most GPU hours
  left, with the notebook's time limit cut to fit those hours (at most 10.5 h).
Each lane runs the smoke test first (16 examples, 2 steps), then full sessions until the notebook reports the epoch
complete. Anything unexpected stops that lane, says why in runner.log and shows a Windows notification. Nothing is
retried on its own.

The training notebook in Champion_Task is never edited. Each session pushes a copy with three settings changed
(MODE, SMOKE_TEST and time_limit_h), and the copy is checked to differ from the notebook in exactly those lines.

Kaggle tokens: setup-tokens.ps1 stores them, encrypted for your Windows user, in %LOCALAPPDATA%\cse499-kaggle-runner.
Hugging Face: your PC's login is used only to list the checkpoint repository.

.EXAMPLE
powershell -NoProfile -ExecutionPolicy Bypass -File runner.ps1 -Check     # accounts, GPU hours, lanes; starts nothing
powershell -NoProfile -ExecutionPolicy Bypass -File runner.ps1 -Lane c    # one run, lane c only
powershell -NoProfile -ExecutionPolicy Bypass -File runner.ps1            # one run, both lanes (what the task does)
powershell -NoProfile -ExecutionPolicy Bypass -File runner.ps1 -Retry b   # after you've fixed what stopped lane b
powershell -NoProfile -ExecutionPolicy Bypass -File runner.ps1 -Install   # every 3 minutes; -Uninstall removes it
powershell -NoProfile -ExecutionPolicy Bypass -File runner.ps1 -SelfTest  # checks the notebook copies; no Kaggle call
To pause the task, create an empty file named PAUSE in this folder; delete it to resume.
#>
param([switch]$Check, [string]$Lane = "", [string]$Retry = "", [switch]$Install, [switch]$Uninstall, [switch]$SelfTest,
      [switch]$NoStart)   # -NoStart: collect and check ended sessions, but start nothing new

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
try { [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false) } catch { }
$Inv = [Globalization.CultureInfo]::InvariantCulture

# ---- The plan ----
$Here      = $PSScriptRoot
$Champ     = Split-Path $Here -Parent
$Notebook  = Join-Path $Champ "l2-step2-train-3b.ipynb"
$Results   = Join-Path $Champ "L2-step2-results"
$Slug      = "l2-step2-train-3b"                                  # each account's training notebook on Kaggle
$Dataset   = "abrarmohammedtanzim/disasterm3-mirror"
$Lanes     = [ordered]@{
    c = @{ Accounts = @("acc1");         Inputs = @("l2-step1-new-teacher", "l2-step1c-options-rerun") }
    b = @{ Accounts = @("acc2", "acc3"); Inputs = @("l2-step1b-soft-labels") }
}
$AllAccounts = @("acc1", "acc2", "acc3")
$Usernames = @{ acc1 = "abrarmohammedtanzim"; acc2 = "abrar2222864642"; acc3 = "redwannewaz" }   # each token must log in as its own
$Busy      = @{ acc2 = @("l0b-vision-encoder-crop-test") }      # an account waits while these notebooks of its run
$MaxLimitH = 10.5    # the notebook's own time limit
$FirstLimitH = 1.0   # each mode's first full session is a 1-hour trial: about 5 full-size steps show the updates are real
$OverheadH = 0.75    # setup before training, the step that runs past the limit, the last push
$MinLimitH = 1.5     # a shorter session isn't worth its setup
$SmokeH    = 1.0     # GPU hours a smoke test needs
$HfRepo    = "AbrarAlam/disasterm3-qwen25vl3b-l2"
$TokenSet  = "l2-hf-write-token"   # each account's private dataset holding the Hugging Face write token
$TaskName  = "CSE499 Kaggle runner"
$EveryMin  = 3      # how often the timer runs; a finished session waits at most this long for its successor
# Runs started from the command line can't read Kaggle's secrets, so each pushed copy reads the token from that
# dataset; these two lines go into Cell 2, just before it asks for the secret
$TokenLines = @('for _f in glob.glob("/kaggle/input/**/hf_write_token.txt", recursive=True):   # runs started by the runner have no secrets',
                '    os.environ["HF_TOKEN"] = Path(_f).read_text(encoding="utf-8").strip()')
$Live      = @("queued", "running", "cancel_requested")
$Ended     = @("complete", "error", "cancel_acknowledged")

$Kaggle    = Join-Path $env:APPDATA "Python\Python313\Scripts\kaggle.exe"
$TokenDir  = Join-Path $env:LOCALAPPDATA "cse499-kaggle-runner"
$KaggleCfg = Join-Path $TokenDir "empty-config"   # no kaggle.json here, so a refused token can't fall back to another account
$HfToken   = Join-Path $env:USERPROFILE ".cache\huggingface\token"   # your PC's login, used only to list the repository
$HfWrite   = Join-Path $TokenDir "hf.token"                             # the write token for the runs (setup-tokens.ps1)
$PushRoot  = Join-Path $env:TEMP "cse499-kaggle-runner"
$StateFile = Join-Path $Here "state.json"
$LogFile   = Join-Path $Here "runner.log"
$LockFile  = Join-Path $Here "runner.lock"

# ---- Log and notifications ----
function Write-Log([string]$Text) {
    $line = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm"), $Text
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

function Say($L, [string]$Text) {
    # A waiting message goes to the log once, not every 15 minutes
    if ($L.said -ne $Text) { Write-Log $Text; $L.said = $Text }
}

function Show-Note([string]$Title, [string]$Text) {
    try {
        $null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
        $xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $nodes = $xml.GetElementsByTagName("text")
        $null = $nodes.Item(0).AppendChild($xml.CreateTextNode($Title))
        $null = $nodes.Item(1).AppendChild($xml.CreateTextNode($Text))
        $app = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe"
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show([Windows.UI.Notifications.ToastNotification]::new($xml))
    } catch { Write-Log "  (the Windows notification couldn't be shown: $($_.Exception.Message))" }
}

function Stop-Lane([string]$Name, $L, [string]$Why) {
    $L.status = "stopped"; $L.why = $Why; $L.said = ""
    Write-Log "lane ${Name} STOPPED: $Why"
    Show-Note "L2 lane ($Name) stopped" $Why
}

# ---- Kaggle ----
function Get-Token([string]$Acc) {
    $file = Join-Path $TokenDir "$Acc.token"
    if (-not (Test-Path $file)) { throw "no token stored for ${Acc}: run setup-tokens.ps1" }
    [Net.NetworkCredential]::new("", ((Get-Content $file -Raw).Trim() | ConvertTo-SecureString)).Password
}

function Get-HfWrite {
    if (-not (Test-Path $HfWrite)) { throw "no Hugging Face write token stored: run setup-tokens.ps1" }
    [Net.NetworkCredential]::new("", ((Get-Content $HfWrite -Raw).Trim() | ConvertTo-SecureString)).Password
}

function Get-Fingerprint([string]$Text) {
    # A short fingerprint of the token, so the runner knows when a dataset holds an older one; never the token itself
    $sha = [Security.Cryptography.SHA256]::Create()
    (($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Text)) | ForEach-Object { $_.ToString("x2") }) -join "").Substring(0, 16)
}

function Confirm-TokenSet([string]$Acc) {
    # The account's private dataset with the Hugging Face write token, created or updated when needed, then ready
    $id = "$(Get-User $Acc)/$TokenSet"
    $token = Get-HfWrite
    $print = Get-Fingerprint $token
    $known = $State.datasets.PSObject.Properties[$Acc]
    $status = (Invoke-Kaggle $Acc @("datasets", "status", $id)).Out.Trim()
    if ($known -and $known.Value -eq $print -and $status -eq "ready") { return $id }
    $dir = Join-Path $PushRoot "token-$Acc"
    try {
        if (Test-Path $dir) { Remove-Item $dir -Recurse -Force }
        New-Item -ItemType Directory -Force $dir | Out-Null
        [IO.File]::WriteAllText((Join-Path $dir "hf_write_token.txt"), $token, [Text.UTF8Encoding]::new($false))
        $meta = [ordered]@{ title = $TokenSet; id = $id; licenses = @(@{ name = "other" }) }
        [IO.File]::WriteAllText((Join-Path $dir "dataset-metadata.json"), ($meta | ConvertTo-Json -Depth 4), [Text.UTF8Encoding]::new($false))
        $isNew = $status -notmatch "^(ready|pending|running)"
        $cmd = if ($isNew) { @("datasets", "create", "-p", $dir, "-q") } else { @("datasets", "version", "-p", $dir, "-m", "token update", "-d", "-q") }
        $r = Invoke-Kaggle $Acc $cmd
        if ($r.Code -ne 0 -or "$($r.Out) $($r.Err)" -match "(?i)error|failed") { throw "the token dataset $id couldn't be $(if ($isNew) { 'created' } else { 'updated' }): $($r.Out) $($r.Err)".Trim() }
    } finally { if (Test-Path $dir) { Remove-Item $dir -Recurse -Force } }      # the plain token never stays on disk
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 10
        if ((Invoke-Kaggle $Acc @("datasets", "status", $id)).Out.Trim() -eq "ready") {
            if ($known) { $known.Value = $print } else { $State.datasets | Add-Member $Acc $print }
            Save-State
            Write-Log "  the private token dataset $id is ready (token $print...)"
            return $id
        }
    }
    throw "the token dataset $id wasn't ready after 5 minutes"
}

function Invoke-Kaggle([string]$Acc, [string[]]$KArgs) {
    # One Kaggle command as $Acc. Returns the exit code, stdout and stderr; a Kaggle error never throws here.
    $ErrorActionPreference = "Continue"
    New-Item -ItemType Directory -Force $KaggleCfg | Out-Null
    $env:KAGGLE_CONFIG_DIR = $KaggleCfg
    $env:PYTHONIOENCODING = "utf-8"
    $env:KAGGLE_API_TOKEN = Get-Token $Acc
    try {
        $all = & $Kaggle @KArgs 2>&1
        $code = $LASTEXITCODE
    } finally { Remove-Item Env:KAGGLE_API_TOKEN -ErrorAction SilentlyContinue }
    $out = @($all | Where-Object { $_ -isnot [Management.Automation.ErrorRecord] } | ForEach-Object { "$_" }) -join "`n"
    $err = @($all | Where-Object { $_ -is [Management.Automation.ErrorRecord] } | ForEach-Object { "$_" }) -join "`n"
    [pscustomobject]@{ Code = $code; Out = $out; Err = $err }
}

$Users = @{}
function Get-User([string]$Acc) {
    # The Kaggle username the account's token logs in as; refuses anything but a valid access token
    if (-not $Users.ContainsKey($Acc)) {
        $r = Invoke-Kaggle $Acc @("config", "view")
        $user = if ($r.Out -match "username:\s*(\S+)") { $Matches[1] } else { "" }
        if (-not $user -or $user -eq "None" -or $r.Out -notmatch "auth_method:.*ACCESS_TOKEN") {
            throw "Kaggle didn't accept ${Acc}'s token (expired or revoked?): run setup-tokens.ps1 again. $($r.Err)"
        }
        if ($user -ne $Usernames[$Acc]) {
            throw "${Acc}'s token logs in as $user, not $($Usernames[$Acc]): run setup-tokens.ps1 again with the right token"
        }
        $Users[$Acc] = $user
    }
    $Users[$Acc]
}

function Get-Status([string]$Acc, [string]$Kernel) {
    $r = Invoke-Kaggle $Acc @("kernels", "status", $Kernel)
    $all = "$($r.Out)`n$($r.Err)"
    $status = "unknown"
    if ($r.Out -match 'has status "(?:KernelWorkerStatus\.)?([A-Za-z_]+)"') { $status = $Matches[1].ToLower() }
    elseif ($all -match "404|Not Found|not found|Permission 'kernels.get' was denied") { $status = "missing" }
    $message = if ($r.Out -match 'Failure message: "(.*)"') { $Matches[1] } else { "" }
    [pscustomobject]@{ Status = $status; Message = $message; Raw = $all.Trim() }
}

function Get-Hours([string]$Acc) {
    $r = Invoke-Kaggle $Acc @("quota", "-v")
    $gpu = @($r.Out -split "`r?`n" | Where-Object { $_ -match "^(resource|GPU|TPU)," } | ConvertFrom-Csv |
             Where-Object { $_.resource -eq "GPU" })[0]
    if (-not $gpu) { throw "Kaggle gave no GPU quota for ${Acc}: $($r.Out) $($r.Err)" }
    [pscustomobject]@{ Left = [double]::Parse(($gpu.remaining -replace "h$", ""), $Inv); Refresh = $gpu.refreshAt }
}

function Resolve-Input([string]$Acc, [string]$InputSlug) {
    # The input notebook's full id, found among the three accounts, as $Acc sees it (shared, or its own)
    foreach ($owner in $AllAccounts) {
        $id = "$($Usernames[$owner])/$InputSlug"
        if ((Get-Status $Acc $id).Status -in ($Live + $Ended)) { return $id }
    }
    return $null
}

function Save-Outputs([string]$Acc, [string]$Kernel, [string]$Dest) {
    # The session's small files and its log; never the checkpoints
    New-Item -ItemType Directory -Force $Dest | Out-Null
    $pattern = '^L2S2-[bc]/(config\.json|train_summary(_smoke)?\.json|README\.md|loss_curve\.png)$'
    $r = Invoke-Kaggle $Acc @("kernels", "output", $Kernel, "-p", $Dest, "-o", "-q", "--file-pattern", $pattern)
    if ($r.Code -ne 0) { Write-Log "  downloading the outputs of ${Kernel}: exit $($r.Code) $($r.Err)" }
}

# ---- Hugging Face (read only) ----
function Get-Hf([string]$Mode) {
    # Steps of the checkpoints under <mode>/checkpoints, and whether <mode>/final exists
    $headers = @{ Authorization = "Bearer " + (Get-Content $HfToken -Raw).Trim() }
    $list = {
        param($Path)
        try { @(Invoke-RestMethod -Uri "https://huggingface.co/api/models/$HfRepo/tree/main/$Path" -Headers $headers) }
        catch {
            if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) { @() } else { throw }
        }
    }
    $steps = @(& $list "$Mode/checkpoints" | ForEach-Object { if ($_.path -match "checkpoint-(\d+)$") { [int]$Matches[1] } } |
               Sort-Object)
    [pscustomobject]@{ Steps = $steps; Final = (@(& $list "$Mode/final").Count -gt 0) }
}

# ---- The notebook copy each session pushes ----
function Set-Once([string]$Text, [string]$Pattern, [string]$Replacement) {
    $n = [regex]::Matches($Text, $Pattern).Count
    if ($n -ne 1) { throw "the notebook changed: '$Pattern' is found $n times, not once" }
    [regex]::Replace($Text, $Pattern, $Replacement)
}

function Get-SourceLines([string]$Json) {
    foreach ($cell in ($Json | ConvertFrom-Json).cells) { (@($cell.source) -join "") -split "`n" }
}

function New-RunCopy([string]$Mode, [bool]$Smoke, [double]$LimitH, [string]$Dir) {
    # Writes <Dir>\l2-step2-train-3b.ipynb with MODE, SMOKE_TEST and time_limit_h set and the two token lines added;
    # returns the lines that changed
    $orig = [IO.File]::ReadAllText($Notebook)
    $text = Set-Once $orig '(MODE = \\")[bc](\\"\s+#)' ('${1}' + $Mode + '${2}')
    $text = Set-Once $text '(SMOKE_TEST = )(?:True|False)(\s+# True = 16)' ('${1}' + $(if ($Smoke) { "True" } else { "False" }) + '${2}')
    $text = Set-Once $text '(\\"time_limit_h\\": )[0-9.]+' ('${1}' + $LimitH.ToString($Inv))
    $esc = @($TokenLines | ForEach-Object { $_ -replace '\\', '\\' -replace '"', '\"' })    # as text inside a JSON string
    $whole = '\\n(try:\\n    from kaggle_secrets import UserSecretsClient\\n)'                # a cell kept as one string
    if ([regex]::Matches($text, $whole).Count -eq 1) {
        $text = Set-Once $text $whole ('\n' + $esc[0] + '\n' + $esc[1] + '\n${1}')
    } else {                                                                                  # a cell kept as a list of lines
        $text = Set-Once $text '(\s*)("try:\\n",\s*"    from kaggle_secrets import UserSecretsClient\\n",)' `
                         ('${1}"' + $esc[0] + '\n",${1}"' + $esc[1] + '\n",${1}${2}')
    }
    $a = @(Get-SourceLines $orig)
    $b = @(Get-SourceLines $text)
    $added = @($b | Where-Object { $TokenLines -ccontains $_ })
    if ($added.Count -ne $TokenLines.Count) { throw "the token lines went in $($added.Count) times, not once each" }
    $b = @($b | Where-Object { $TokenLines -cnotcontains $_ })
    if ($a.Count -ne $b.Count) { throw "the copy has $($b.Count) lines besides the token lines, the notebook $($a.Count)" }
    $changed = @(for ($i = 0; $i -lt $a.Count; $i++) { if ($a[$i] -cne $b[$i]) { $b[$i].Trim() } })
    $other = @($changed | Where-Object { $_ -notmatch '^(MODE = "[bc]"|SMOKE_TEST = (True|False)|"time_limit_h": [0-9.]+,)' })
    if ($other.Count) { throw "the copy differs from the notebook in other lines: $($other -join ' | ')" }
    New-Item -ItemType Directory -Force $Dir | Out-Null
    [IO.File]::WriteAllText((Join-Path $Dir "$Slug.ipynb"), $text, [Text.UTF8Encoding]::new($false))
    $changed
}

function Write-Meta([string]$Dir, [string]$Id, [string[]]$Sources, [bool]$WithTitle, [string]$TokenData = "") {
    $meta = [ordered]@{
        id = $Id; code_file = "$Slug.ipynb"; language = "python"; kernel_type = "notebook"; is_private = $true
        enable_gpu = $true; enable_tpu = $false; enable_internet = $true; machine_shape = "NvidiaTeslaT4"
        dataset_sources = @(@($Dataset) + @($TokenData | Where-Object { $_ })); kernel_sources = @($Sources)
        competition_sources = @(); model_sources = @()
    }
    if ($WithTitle) { $meta["title"] = $Slug }     # only for a new notebook, so an existing one keeps its title
    [IO.File]::WriteAllText((Join-Path $Dir "kernel-metadata.json"), ($meta | ConvertTo-Json -Depth 4), [Text.UTF8Encoding]::new($false))
}

function Push-Copy([string]$Name, [string]$Acc, [bool]$Smoke, [double]$LimitH, [bool]$NoRun, [bool]$IsNew) {
    # Pushes this lane's notebook copy as a new version of the account's notebook; returns the version number
    $sources = @(foreach ($i in $Lanes[$Name].Inputs) {
        $id = Resolve-Input $Acc $i
        if (-not $id) { throw "$Acc can't see the input notebook '$i': share it with that account first" }
        $id
    })
    $tokenData = Confirm-TokenSet $Acc
    $dir = Join-Path $PushRoot "$Name-$Acc"
    if (Test-Path $dir) { Remove-Item $dir -Recurse -Force }
    $changed = New-RunCopy $Name $Smoke $LimitH $dir
    $kernel = "$(Get-User $Acc)/$Slug"
    Write-Meta $dir $kernel $sources $IsNew $tokenData
    $push = @("kernels", "push", "-p", $dir, "--accelerator", "NvidiaTeslaT4")
    if ($NoRun) { $push += "--no-run" }
    $r = Invoke-Kaggle $Acc $push
    if ($r.Out -notmatch "Kernel version (\d+) successfully") { throw "the push to $kernel failed: $($r.Out) $($r.Err)".Trim() }
    $version = [int]$Matches[1]
    if ($r.Out -match "not valid") { Write-Log "  Kaggle warned about $kernel's inputs: $($r.Out)" }
    Write-Log ("  pushed {0} version {1} ({2}); inputs {3}, {4}" -f $kernel, $version, ($changed -join "; "), ($sources -join ", "), $tokenData)
    $version
}

# ---- One lane ----
function Test-Busy([string]$Acc, [string]$Name) {
    foreach ($other in $Lanes.Keys) {
        if ($other -ne $Name -and $State.$other.status -eq "running" -and $State.$other.account -eq $Acc) { return "lane $other runs there" }
    }
    foreach ($b in @($Busy[$Acc])) {
        if (-not $b) { continue }
        $s = (Get-Status $Acc "$(Get-User $Acc)/$b").Status
        if ($s -in $Live) { return "$b is running" }
        if ($s -eq "unknown") { return "the status of $b couldn't be read" }
    }
    return ""
}

function Start-Next([string]$Name, $L) {
    $plan = $Lanes[$Name]
    $smoke = $L.phase -eq "smoke"
    # 1. No session of this mode may run anywhere already (one started by hand, say), and every account needs its notebook
    $missing = @()
    foreach ($acc in $plan.Accounts) {
        $kernel = "$(Get-User $acc)/$Slug"
        $s = (Get-Status $acc $kernel).Status
        if ($s -in $Live) { Say $L "lane ${Name} waits: $kernel is running, and the runner didn't start it"; return }
        if ($s -eq "unknown") { Say $L "lane ${Name} waits: the status of $kernel couldn't be read"; return }
        if ($s -eq "missing") { $missing += $acc }
    }
    # 2. The account with the most GPU hours left that isn't busy
    $best = $null; $notes = @()
    foreach ($acc in $plan.Accounts) {
        $blocked = Test-Busy $acc $Name             # not $busy: that name (any case) is the plan's $Busy list
        if ($blocked) { $notes += "${acc}: $blocked"; continue }
        $q = Get-Hours $acc
        $limit = [math]::Min($MaxLimitH, [math]::Floor(($q.Left - $OverheadH) * 4) / 4)
        $notes += ("{0}: {1:N1} h left, refresh {2}" -f $acc, $q.Left, $q.Refresh)
        $fits = if ($smoke) { $q.Left -ge $SmokeH } else { $limit -ge $MinLimitH }
        if ($fits -and (-not $best -or $q.Left -gt $best.Left)) { $best = [pscustomobject]@{ Acc = $acc; Left = $q.Left; Limit = $limit } }
    }
    if (-not $best) { Say $L "lane ${Name} waits for a free account with GPU hours ($($notes -join '; '))"; return }
    # 3. The first full session must start fresh: nothing under <mode>/checkpoints on Hugging Face
    if (-not $smoke -and $L.session -eq 0) {
        $hf = Get-Hf $Name
        if ($hf.Steps.Count -or $hf.Final) {
            Stop-Lane $Name $L ("Hugging Face already holds $Name/checkpoints (steps $($hf.Steps -join ', ')) before the first " +
                                "full session: delete that folder, or the repository, then run: runner.ps1 -Retry $Name")
            return
        }
    }
    # 4. Push and record at once, so a later error can't start the same session twice
    $limitH = if ($smoke) { $MaxLimitH } elseif ([int]$L.session -eq 0) { [math]::Min($FirstLimitH, $best.Limit) } else { $best.Limit }
    $version = Push-Copy $Name $best.Acc $smoke $limitH $false ($missing -contains $best.Acc)   # a new notebook gets its title
    $L.status = "running"; $L.account = $best.Acc; $L.kernel = "$(Get-User $best.Acc)/$Slug"; $L.version = $version
    $L.pushed = (Get-Date).ToString("s"); $L.limit_h = $limitH; $L.why = ""; $L.said = ""
    if (-not $smoke) { $L.session = [int]$L.session + 1 }
    Save-State
    $what = if ($smoke) { "the smoke test" } else { "session $($L.session) (time limit $limitH h)" }
    Write-Log ("lane {0}: started {1} on {2}, {3:N1} GPU h left there. {4}" -f $Name, $what, $best.Acc, $best.Left, ($notes -join "; "))
}

function Test-Ended([string]$Name, $L) {
    # Checks a session that ended; returns $true when the lane may start its next session now
    $st = Get-Status $L.account $L.kernel
    if ($st.Status -in $Live) { return $false }
    if ($st.Status -notin $Ended) { Say $L "lane ${Name}: the status of $($L.kernel) couldn't be read ($($st.Raw))"; return $false }
    $label = if ($L.phase -eq "smoke") { "smoke" } else { "session$($L.session)" }
    $dest = Join-Path $Results "train-$Name-$label"
    Save-Outputs $L.account $L.kernel $dest
    if ($st.Status -ne "complete") { Stop-Lane $Name $L "$label on $($L.account) ended as '$($st.Status)'. $($st.Message) Log and outputs: $dest"; return $false }
    $summary = Join-Path $dest ("L2S2-$Name\train_summary" + $(if ($L.phase -eq "smoke") { "_smoke" } else { "" }) + ".json")
    if (-not (Test-Path $summary)) { Stop-Lane $Name $L "$label finished but wrote no summary; see $dest"; return $false }
    # Python writes NaN and Infinity as bare words, which aren't JSON: read them as the strings "NaN" and "Infinity"
    $raw = Get-Content $summary -Raw -Encoding UTF8
    $S = ($raw -replace '(?<![\w"])-?Infinity\b', '"Infinity"' -replace '(?<![\w"])NaN\b', '"NaN"') | ConvertFrom-Json
    # This session's logged steps. A loss must always be a number. A NaN gradient size means half precision skipped
    # that step, which is normal now and then; every step skipped is the failure of 18 Nov.
    $steps = @($S.log_history | Where-Object { $_.PSObject.Properties["loss"] -and $_.PSObject.Properties["step"] -and
                                               [int]$_.step -gt [int]$L.last_step })
    $badLoss = @($steps | Where-Object { $e = $_; @("loss", "label_loss", "soft_loss") | Where-Object { $e.PSObject.Properties[$_] -and $e.$_ -is [string] } })
    $skipped = @($steps | Where-Object { -not $_.PSObject.Properties["grad_norm"] -or $_.grad_norm -is [string] }).Count
    $real = $steps.Count - $skipped
    $sessionLog = Join-Path $dest "$Slug.log"      # not $logFile: PowerShell names ignore case, and that one is the runner's log
    $logText = if (Test-Path $sessionLog) { Get-Content $sessionLog -Raw -Encoding UTF8 } else { "" }
    $problems = @()
    if ($steps.Count -lt 1) { $problems += "no training step was logged" }
    if ($badLoss.Count) { $problems += "a loss is NaN or infinite at step(s) $(($badLoss | ForEach-Object { $_.step }) -join ', ')" }
    if ($steps.Count -and $real -lt 1) { $problems += "every step was skipped (NaN gradients), as in the run of 18 Nov" }
    if ($L.phase -ne "smoke" -and $skipped -gt [math]::Max(2, [math]::Floor(0.1 * $steps.Count))) {
        $problems += "$skipped of $($steps.Count) steps were skipped (NaN gradients), more than 10%"
    }
    if ($L.phase -eq "smoke") {
        if ($logText -notmatch "Step 2b's fix") { $problems += "the log has no 'Step 2b's fix' line" }
        if ([int]$S.global_step -lt 1 -or [int]$S.global_step -ne [int]$S.max_steps) { $problems += "steps $($S.global_step) of $($S.max_steps)" }
        if ($problems.Count) { Stop-Lane $Name $L "smoke test: $($problems -join '; '). See $dest"; return $false }
        Write-Log ("lane {0}: smoke test passed on {1}: {2} of {3} steps ({4} skipped in half precision), losses {5}, peak memory {6} GB, about {7} h for the epoch. {8}" -f
                   $Name, $L.account, $S.global_step, $S.max_steps, $skipped, (($steps | ForEach-Object { [math]::Round([double]$_.loss, 3) }) -join " "),
                   $S.peak_gpu_memory_gb_process0, $S.projected_full_hours, $dest)
        Show-Note "L2 lane ($Name): smoke test passed" "The full sessions start now."
        $L.phase = "full"; $L.session = 0; $L.last_step = 0; $L.status = "idle"; $L.said = ""
        return $true
    }
    $from = if ("$($S.resumed_from)" -match "checkpoint-(\d+)") { [int]$Matches[1] } else { 0 }
    if ($from -ne [int]$L.last_step) { $problems += "it continued from step $from, not from step $($L.last_step)" }
    if ([int]$S.global_step -le [int]$L.last_step) { $problems += "no progress (step $($S.global_step))" }
    $hf = Get-Hf $Name
    if ($S.complete) { if (-not $hf.Final) { $problems += "it's complete, but $Name/final isn't on Hugging Face" } }
    elseif ($hf.Steps -notcontains [int]$S.global_step) { $problems += "checkpoint-$($S.global_step) isn't on Hugging Face" }
    if ($problems.Count) { Stop-Lane $Name $L "$label on $($L.account): $($problems -join '; '). See $dest"; return $false }
    Write-Log ("lane {0}: {1} passed on {2}: steps {3} to {4} of {5} ({6} skipped in half precision), last loss {7}. {8}" -f
               $Name, $label, $L.account, $L.last_step, $S.global_step, $S.max_steps, $skipped, [math]::Round([double]$steps[-1].loss, 3), $dest)
    $L.last_step = [int]$S.global_step; $L.said = ""
    if ($S.complete) {
        $L.status = "done"; $L.phase = "done"
        Write-Log "lane ${Name}: DONE, the finished adapter is at $HfRepo/$Name/final"
        Show-Note "L2 lane ($Name) finished" "The finished adapter is on Hugging Face at $Name/final."
        return $false
    }
    $L.status = "idle"
    return $true
}

# ---- State ----
function New-LaneState {
    [pscustomobject][ordered]@{ phase = "smoke"; status = "idle"; session = 0; account = ""; kernel = ""; version = 0
                                pushed = ""; limit_h = 0; last_step = 0; why = ""; said = "" }
}

function Read-State {
    $s = if (Test-Path $StateFile) { Get-Content $StateFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { [pscustomobject]@{} }
    if (-not $s.PSObject.Properties["datasets"]) { $s | Add-Member "datasets" ([pscustomobject]@{}) }   # token fingerprints per account
    foreach ($name in $Lanes.Keys) {
        if (-not $s.PSObject.Properties[$name]) { $s | Add-Member $name (New-LaneState) }
        foreach ($p in (New-LaneState).PSObject.Properties) {
            if (-not $s.$name.PSObject.Properties[$p.Name]) { $s.$name | Add-Member $p.Name $p.Value }
        }
    }
    $s
}

function Save-State {
    $tmp = "$StateFile.tmp"
    [IO.File]::WriteAllText($tmp, ($State | ConvertTo-Json -Depth 5), [Text.UTF8Encoding]::new($false))
    Move-Item -Force $tmp $StateFile
}

# ---- Commands ----
if ($SelfTest) {
    $root = Join-Path $PushRoot "selftest"
    foreach ($case in @(@("c", $true, 10.5), @("c", $false, 10.5), @("b", $false, 3.25))) {
        $changed = New-RunCopy $case[0] $case[1] $case[2] (Join-Path $root ("{0}-{1}-{2}" -f $case[0], $case[1], $case[2]))
        Write-Host ("OK  mode {0}, smoke {1}, limit {2} h: differs in {3} line(s), plus the 2 token lines: {4}" -f $case[0], $case[1], $case[2], $changed.Count, ($changed -join " | "))
    }
    $caught = $false
    try { $null = Set-Once "MODE = 1; MODE = 2" "MODE" "x" } catch { $caught = $true }
    if (-not $caught) { throw "Set-Once accepted a setting found twice" }
    Write-Host "OK  a setting found twice stops the push"
    Write-Meta $root "someone/$Slug" @("owner/one-input") $false "someone/$TokenSet"
    $m = Get-Content (Join-Path $root "kernel-metadata.json") -Raw | ConvertFrom-Json
    if ($m.kernel_sources -isnot [array] -or $m.dataset_sources -isnot [array] -or $m.PSObject.Properties["title"] -or
        $m.dataset_sources[1] -ne "someone/$TokenSet") {
        throw "kernel-metadata.json is wrong: $($m | ConvertTo-Json -Compress)"
    }
    Write-Host "OK  kernel-metadata.json: inputs as lists, no title for an existing notebook: $($m | ConvertTo-Json -Compress)"
    exit 0
}

if ($Install) {
    $ps = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"
    $action = New-ScheduledTaskAction -Execute (Join-Path $env:WINDIR "System32\conhost.exe") -WorkingDirectory $Here `
        -Argument "--headless `"$ps`" -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes $EveryMin) `
        -RepetitionDuration (New-TimeSpan -Days 60)
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 20)   # a run that overlaps the next is skipped (IgnoreNew)
    $null = Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force `
        -Description "Chains the L2 3B training sessions on Kaggle. Log: $LogFile"
    Write-Host "Installed '$TaskName': every $EveryMin minutes while you're logged on, from one minute from now. Log: $LogFile"
    exit 0
}

if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed '$TaskName'. Sessions already running on Kaggle go on; nothing new starts."
    exit 0
}

if ((Test-Path (Join-Path $Here "PAUSE")) -and -not $Check) { exit 0 }
if ((Test-Path $LockFile) -and (Get-Item $LockFile).LastWriteTime -gt (Get-Date).AddMinutes(-30)) { exit 0 }
Set-Content -Path $LockFile -Value $PID
try {
    $State = Read-State

    if ($Check) {
        foreach ($acc in $AllAccounts) {
            try {
                $user = Get-User $acc
                $q = Get-Hours $acc
                Write-Host ("{0}: Kaggle user {1}, {2:N2} GPU h left, refresh {3}" -f $acc, $user, $q.Left, $q.Refresh)
                Write-Host ("    {0}: {1}" -f $Slug, (Get-Status $acc "$user/$Slug").Status)
                foreach ($b in @($Busy[$acc])) { if ($b) { Write-Host ("    {0}: {1}" -f $b, (Get-Status $acc "$user/$b").Status) } }
            } catch { Write-Host "${acc}: $($_.Exception.Message)" }
        }
        foreach ($name in $Lanes.Keys) {
            $L = $State.$name
            Write-Host ("lane {0}: phase {1}, {2}, session {3}, step {4}. {5}" -f $name, $L.phase, $L.status, $L.session, $L.last_step, $L.why)
            foreach ($acc in $Lanes[$name].Accounts) {
                foreach ($i in $Lanes[$name].Inputs) {
                    $id = $null
                    try { $id = Resolve-Input $acc $i } catch { }
                    Write-Host ("    input {0}, seen from {1}: {2}" -f $i, $acc, $(if ($id) { $id } else { "NOT VISIBLE" }))
                }
            }
            try {
                $hf = Get-Hf $name
                Write-Host ("    Hugging Face {0}/checkpoints: {1}; {0}/final: {2}" -f $name, $(if ($hf.Steps.Count) { $hf.Steps -join ", " } else { "none" }), $hf.Final)
            } catch { Write-Host "    Hugging Face: $($_.Exception.Message)" }
        }
        return
    }

    if ($Retry) {
        $L = $State.$Retry
        if (-not $L) { throw "no lane '$Retry'" }
        if ($L.status -eq "stopped") { $L.status = "idle"; $L.said = ""; Write-Log "lane ${Retry}: retry asked for; was stopped because: $($L.why)"; $L.why = "" }
        Save-State
    }

    foreach ($name in $Lanes.Keys) {
        if ($Lane -and $name -ne $Lane) { continue }
        $L = $State.$name
        try {
            if ($L.status -eq "running") { if ((Test-Ended $name $L) -and -not $NoStart) { Start-Next $name $L } }
            elseif ($L.status -eq "idle" -and -not $NoStart) { Start-Next $name $L }
        } catch { Say $L "lane ${name}: error, tried again on the next run: $($_.Exception.Message)" }
        Save-State
    }
} finally { Remove-Item $LockFile -ErrorAction SilentlyContinue }
