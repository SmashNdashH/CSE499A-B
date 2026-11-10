import { SITE } from '../config/site'
import { TEAM, LIMITATIONS, FAQ } from '../data/about'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'

export default function About() {
  return (
    <div className="space-y-12">
      <section>
        <SectionHeading eyebrow="About" title="Team">{SITE.course}</SectionHeading>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((n) => <Card key={n}>{n}</Card>)}
        </div>
      </section>

      <section>
        <SectionHeading title="Limitations" />
        <ul className="list-disc space-y-2 pl-5 text-muted">
          {LIMITATIONS.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </section>

      <section>
        <SectionHeading title="FAQ" />
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-xl border border-line bg-panel p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}