const TONES = {
  default: 'border-line text-muted',
  accent: 'border-accent/40 text-accent',
  warn: 'border-amber-400/40 text-amber-300',
}
export default function Badge({ children, tone = 'default' }) {
  return <span className={`inline-block rounded-full border px-3 py-1 text-xs ${TONES[tone]}`}>{children}</span>
}