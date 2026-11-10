import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'

const FACTS = [
  ['Image pairs', '6,443 before/after pairs, 4-class damage masks'],
  ['Split', '90/10 with seed 42; 645 validation images, never trained on'],
  ['Benchmark', '30,042 entries; 12,968 questions across six scored tasks'],
  ['Radar images', 'Not used for segmentation; scored separately for counting'],
  ['Leak check', '40 validation pairs shared images with training; all scores re-scored without them'],
]

export default function Data() {
  return (
    <div>
      <SectionHeading eyebrow="Data" title="DisasterM3">
        Multi-disaster before/after imagery with damage masks and instruction data for vision-language models.
      </SectionHeading>
      <div className="grid gap-4 md:grid-cols-2">
        {FACTS.map(([k, v]) => (
          <Card key={k}>
            <h3 className="font-semibold">{k}</h3>
            <p className="mt-1 text-sm text-muted">{v}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}