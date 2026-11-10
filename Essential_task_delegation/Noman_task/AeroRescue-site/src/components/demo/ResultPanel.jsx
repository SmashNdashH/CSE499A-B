import { useState } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

const TABS = ['Report', 'Counts', 'Maps']

export default function ResultPanel({ result }) {
  const [tab, setTab] = useState('Report')
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm ${tab === t ? 'bg-accent/15 text-accent' : 'text-muted'}`}
          >{t}</button>
        ))}
        {result.sample && <Badge tone="warn">sample output</Badge>}
      </div>

      {tab === 'Report' && <p className="whitespace-pre-line text-sm leading-relaxed">{result.report}</p>}

      {tab === 'Counts' && (
        <div className="grid grid-cols-3 gap-3 text-center">
          {Object.entries(result.counts).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line p-4">
              <div className="text-2xl font-bold text-accent">{v}</div>
              <div className="text-sm capitalize text-muted">{k}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Maps' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[['Damage map', result.damage_map_url], ['Survivability heatmap', result.heatmap_url]].map(([name, url]) => (
            <div key={name}>
              <p className="mb-1 text-sm text-muted">{name}</p>
              {url ? <img src={url} alt={name} className="rounded-xl border border-line" />
                   : <div className="flex aspect-square items-center justify-center rounded-xl border border-line text-sm text-muted">Not available yet</div>}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}