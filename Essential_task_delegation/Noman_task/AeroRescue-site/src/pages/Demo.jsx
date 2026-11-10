import { useState } from 'react'
import { analyzePair, demoIsLive } from '../services/api'
import UploadBox from '../components/demo/UploadBox'
import ResultPanel from '../components/demo/ResultPanel'
import Disclaimer from '../components/ui/Disclaimer'
import Badge from '../components/ui/Badge'
import SectionHeading from '../components/ui/SectionHeading'

export default function Demo() {
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    setLoading(true); setError(''); setResult(null)
    try {
      setResult(await analyzePair(before, after))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Demo" title="Test a disaster image pair">
        Upload a before and an after image of the same place.
      </SectionHeading>
      <div className="flex items-center gap-3">
        <Badge tone={demoIsLive ? 'accent' : 'warn'}>{demoIsLive ? 'Backend connected' : 'Backend not connected: sample output'}</Badge>
      </div>
      <Disclaimer />

      <div className="grid gap-6 md:grid-cols-2">
        <UploadBox label="Before image" file={before} onFile={setBefore} />
        <UploadBox label="After image" file={after} onFile={setAfter} />
      </div>

      <button
        onClick={run} disabled={!before || !after || loading}
        className="rounded-lg bg-accent px-6 py-3 font-medium text-bg disabled:opacity-40"
      >
        {loading ? 'Analysing…' : 'Run analysis'}
      </button>
      {error && <p className="text-red-400">Error: {error}</p>}
      {result && <ResultPanel result={result} />}
    </div>
  )
}