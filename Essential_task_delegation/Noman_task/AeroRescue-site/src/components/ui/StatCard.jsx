import Card from './Card'

export default function StatCard({ value, label }) {
  return (
    <Card className="text-center">
      <div className="text-3xl font-bold text-accent">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Card>
  )
}