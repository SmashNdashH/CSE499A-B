import { GALLERY } from '../data/gallery'
import BeforeAfterSlider from '../components/gallery/BeforeAfterSlider'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'

export default function Gallery() {
  return (
    <div>
      <SectionHeading eyebrow="Gallery" title="Before and after">
        Drag the slider to compare. Damage maps and heatmaps will be added from the gallery export.
      </SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {GALLERY.map((g) => (
          <Card key={g.id}>
            <BeforeAfterSlider before={g.before} after={g.after} alt={g.title} />
            <h3 className="mt-3 font-semibold">{g.title}</h3>
            <p className="text-sm text-muted">{g.event}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}