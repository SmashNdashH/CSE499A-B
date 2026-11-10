import { PIPELINE } from '../data/pipeline'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'

export default function Method() {
  return (
    <div>
      <SectionHeading eyebrow="Method" title="The pipeline, step by step" />
      <div className="space-y-4">
        {PIPELINE.map((p) => (
          <Card key={p.step} className="flex gap-4">
            <div className="text-2xl font-bold text-accent">{p.step}</div>
            <div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}