import { SEG_COLUMNS, SEG_ROWS, SEG_NOTE, VLM_COLUMNS, VLM_ROWS, VLM_NOTE } from '../data/results'
import ResultsTable from '../components/results/ResultsTable'
import SectionHeading from '../components/ui/SectionHeading'

export default function Results() {
  return (
    <div className="space-y-12">
      <section>
        <SectionHeading eyebrow="Results" title="Segmentation" />
        <ResultsTable columns={SEG_COLUMNS} rows={SEG_ROWS} note={SEG_NOTE} />
      </section>
      <section>
        <SectionHeading title="Vision-language model, six tasks" />
        <ResultsTable columns={VLM_COLUMNS} rows={VLM_ROWS} note={VLM_NOTE} />
      </section>
    </div>
  )
}