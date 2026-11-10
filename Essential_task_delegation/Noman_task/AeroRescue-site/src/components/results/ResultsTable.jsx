export default function ResultsTable({ columns, rows, note }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-panel text-muted">
          <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-line ${r.highlight ? 'bg-accent/10 text-accent' : ''}`}>
              {columns.map((c) => <td key={c.key} className="px-4 py-3">{r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="border-t border-line px-4 py-3 text-xs text-muted">{note}</p>}
    </div>
  )
}