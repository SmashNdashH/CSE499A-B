import { useState } from 'react'

export default function BeforeAfterSlider({ before, after, alt }) {
  const [pos, setPos] = useState(50)
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-black">
        <img src={after} alt={`${alt} after`} className="absolute inset-0 h-full w-full object-cover" />
        <img
          src={before}
          alt={`${alt} before`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-accent" style={{ left: `${pos}%` }} />
        <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs">Before</span>
        <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs">After</span>
      </div>
      <input
        type="range" min="0" max="100" value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="mt-3 w-full accent-accent" aria-label="Before and after slider"
      />
    </div>
  )
}