<#
One-time setup for runner.ps1: stores the Kaggle API token of each account (acc1, acc2, acc3), encrypted with Windows
DPAPI so that only your Windows user on this PC can read it. The tokens never go into the project folder, the log or
the screen. They live in %LOCALAPPDATA%\cse499-kaggle-runner\acc1.token, acc2.token and acc3.token.
acc4 (added 20 Nov) is for runs started from the PC outside the runner, such as R16c step 7; the runner doesn't use it.

Run it in your own PowerShell window, because it asks you for the tokens:
  powershell -NoProfile -ExecutionPolicy Bypass -File "D:\CSE499AB_project\Essential_task_delegation\Champion_Task\kaggle-runner\setup-tokens.ps1"

Paste each token when asked (what you paste stays hidden). Press Enter alone to keep the token already stored.
Afterwards it prints the Kaggle username each token logs in as, and its GPU hours, so you can see they're the right
accounts.
#>
$ErrorActionPreference = "Stop"
$TokenDir  = Join-Path $env:LOCALAPPDATA "cse499-kaggle-runner"
$KaggleCfg = Join-Path $TokenDir "empty-config"   # no kaggle.json here, so a refused token can't fall back to another account
$Kaggle    = Join-Path $env:APPDATA "Python\Python313\Scripts\kaggle.exe"
New-Item -ItemType Directory -Force $TokenDir, $KaggleCfg | Out-Null

$Usernames = @{ acc1 = "abrarmohammedtanzim"; acc2 = "abrar2222864642"; acc3 = "redwannewaz" }
foreach ($acc in "acc1", "acc2", "acc3", "acc4") {
    $file = Join-Path $TokenDir "$acc.token"
    $secure = Read-Host "Kaggle API token for $acc (hidden; Enter alone keeps the stored one)" -AsSecureString
    if ($secure.Length -gt 0) { $secure | ConvertFrom-SecureString | Set-Content -Path $file -Encoding ASCII }
    if (-not (Test-Path $file)) { Write-Host "  ${acc}: no token stored"; continue }

    $env:KAGGLE_CONFIG_DIR = $KaggleCfg
    $env:KAGGLE_API_TOKEN = [Net.NetworkCredential]::new("", ((Get-Content $file -Raw).Trim() | ConvertTo-SecureString)).Password
    try {
        $ErrorActionPreference = "Continue"
        $who   = (& $Kaggle config view 2>&1 | Out-String)
        $quota = (& $Kaggle quota 2>&1 | Out-String)
    } finally {
        Remove-Item Env:KAGGLE_API_TOKEN -ErrorAction SilentlyContinue
        $ErrorActionPreference = "Stop"
    }
    $user = if ($who -match "username:\s*(\S+)") { $Matches[1] } else { "" }
    if (-not $user -or $user -eq "None" -or $who -notmatch "auth_method:.*ACCESS_TOKEN") {
        Write-Host "  ${acc}: Kaggle did NOT accept this token. Run this script again and paste it again." -ForegroundColor Red
        continue
    }
    if ($Usernames[$acc] -and $user -ne $Usernames[$acc]) {      # acc4's username isn't in the plan: shown below to check
        Write-Host "  ${acc}: this token logs in as '$user', but $acc is '$($Usernames[$acc])'. Run this script again and paste $acc's own token." -ForegroundColor Red
        continue
    }
    Write-Host "  ${acc}: logs in as Kaggle user '$user'" -ForegroundColor Green
    Write-Host (($quota.Trim() -split "`r?`n" | ForEach-Object { "      $_" }) -join "`n")
}
# The Hugging Face token the training runs write their checkpoints with. Runs started by runner.ps1 can't read
# Kaggle's secrets, so the runner keeps this token in a private dataset on each account. Make it fine-grained, with
# write access to this one repository only.
$HfRepo = "AbrarAlam/disasterm3-qwen25vl3b-l2"
$hfFile = Join-Path $TokenDir "hf.token"
$secure = Read-Host "Hugging Face token with write access to $HfRepo (hidden; Enter alone keeps the stored one)" -AsSecureString
if ($secure.Length -gt 0) { $secure | ConvertFrom-SecureString | Set-Content -Path $hfFile -Encoding ASCII }
if (Test-Path $hfFile) {
    $hf = [Net.NetworkCredential]::new("", ((Get-Content $hfFile -Raw).Trim() | ConvertTo-SecureString)).Password
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $me = Invoke-RestMethod -Uri "https://huggingface.co/api/whoami-v2" -Headers @{ Authorization = "Bearer $hf" }
        $role = $me.auth.accessToken.role
        $scoped = @($me.auth.accessToken.fineGrained.scoped | Where-Object { $_.entity.name -eq $HfRepo -and $_.permissions -contains "repo.write" })
        if ($me.name -ne "AbrarAlam") {
            Write-Host "  Hugging Face: this token belongs to '$($me.name)', not AbrarAlam. Run this again with AbrarAlam's token." -ForegroundColor Red
        } elseif ($role -eq "write") {
            Write-Host "  Hugging Face: AbrarAlam, a write token for ALL your repositories. It works, but a fine-grained one for $HfRepo only is safer." -ForegroundColor Yellow
        } elseif ($scoped.Count) {
            Write-Host "  Hugging Face: AbrarAlam, fine-grained, can write to $HfRepo" -ForegroundColor Green
        } else {
            Write-Host "  Hugging Face: AbrarAlam's token ($role) can't write to $HfRepo. Make a fine-grained token with write access to it, then run this again." -ForegroundColor Red
        }
    } catch {
        Write-Host "  Hugging Face didn't accept this token: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host "`nDone. Next: powershell -NoProfile -ExecutionPolicy Bypass -File runner.ps1 -Check"
