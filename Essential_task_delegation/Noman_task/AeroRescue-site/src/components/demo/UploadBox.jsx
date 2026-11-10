import { useEffect, useState } from 'react'

export default function UploadBox({ label, file, onFile }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-panel text-center text-muted hover:border-accent">
      {preview ? (
        <img src={preview} alt={label} className="h-full w-full object-cover" />
      ) : (
        <>
          <span className="text-lg text-white">{label}</span>
          <span className="text-sm">Click to choose a PNG/JPG</span>
        </>
      )}
      <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onFile(e.target.files[0] || null)} />
    </label>
  )
}