const API = import.meta.env.VITE_API_URL
export const demoIsLive = Boolean(API)

// Contract the Python API must follow:
// POST {API}/api/analyze  (multipart: before, after)
// -> { damage_map_url, heatmap_url, counts:{intact,damaged,destroyed}, hotspots:[{x,y,area}], report }
const MOCK = {
  sample: true,
  damage_map_url: null,
  heatmap_url: null,
  counts: { intact: 51, damaged: 3, destroyed: 0 },
  hotspots: [],
  report: 'SAMPLE OUTPUT (backend not connected). The real report from the local DisasTeller pipeline will appear here.',
}

export async function analyzePair(before, after) {
  if (!API) {
    await new Promise((r) => setTimeout(r, 1200))
    return MOCK
  }
  const form = new FormData()
  form.append('before', before)
  form.append('after', after)
  const res = await fetch(`${API}/api/analyze`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  return res.json()
}