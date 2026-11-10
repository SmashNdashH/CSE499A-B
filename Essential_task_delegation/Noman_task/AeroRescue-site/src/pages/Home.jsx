import { Link } from 'react-router-dom'
import { SITE } from '../config/site'
import { HEADLINE_STATS, GOALS } from '../data/results'
import { PIPELINE } from '../data/pipeline'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SectionHeading from '../components/ui/SectionHeading'
import Disclaimer from '../components/ui/Disclaimer'

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 pt-6">
        <Badge tone="accent">Post-disaster damage assessment</Badge>
        <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">{SITE.name}</h1>
        <p className="max-w-2xl text-lg text-muted">{SITE.tagline}</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/demo" className="rounded-lg bg-accent px-5 py-2.5 font-medium text-bg">Try the demo</Link>
          <Link to="/results" className="rounded-lg border border-line px-5 py-2.5">See the results</Link>
        </div>
        <Disclaimer />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {HEADLINE_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </section>

      <section>
        <SectionHeading eyebrow="How it works" title="From pixels to a plan" />
        <div className="grid gap-4 md:grid-cols-3">
          {PIPELINE.map((p) => (
            <Card key={p.step}>
              <div className="text-sm text-accent">{p.step}</div>
              <h3 className="mt-1 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Goals" title="Where the project stands" />
        <div className="grid gap-4 md:grid-cols-2">
          {GOALS.map((g) => (
            <Card key={g.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{g.id} · {g.title}</h3>
                <Badge>{g.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{g.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}