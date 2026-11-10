import { SITE } from '../../config/site'

export default function Footer() {
  return (
    <footer className="border-t border-line py-6 text-center text-sm text-muted">
      {SITE.name} · {SITE.course} · Decision-support only; requires expert human review.
    </footer>
  )
}