export default function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="mb-1 text-xs uppercase tracking-widest text-accent">{eyebrow}</p>}
      <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
      {children && <p className="mt-2 max-w-2xl text-muted">{children}</p>}
    </div>
  )
}