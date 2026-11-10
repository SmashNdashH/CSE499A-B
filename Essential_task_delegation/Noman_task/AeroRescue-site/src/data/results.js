export const HEADLINE_STATS = [
  { value: '6,443', label: 'before/after image pairs' },
  { value: '645', label: 'held-out validation pairs' },
  { value: '6', label: 'VLM question tasks' },
  { value: '4', label: 'damage classes' },
]

export const GOALS = [
  { id: 'O1', title: 'Spatial stage', text: 'A segmentation model that finds destroyed buildings (target: Destroyed IoU > 0.30).', status: 'Met narrowly on leak-free data (three-seed mean 0.3065)' },
  { id: 'O2', title: 'Grounded VLM', text: 'U-Net/SAM 3 counts fed to the VLM, to beat the base model on building counting.', status: 'In progress' },
  { id: 'O3', title: 'Offline system', text: 'Report, damage map, counts and survivability heatmap with no cloud API.', status: 'In progress' },
  { id: 'O4', title: 'Edge model', text: 'A distilled Qwen2.5-VL-3B that fits in about 6 GB.', status: 'Next (after L0/L2)' },
]

export const SEG_COLUMNS = [
  { key: 'model', label: 'Model' },
  { key: 'miou', label: 'mIoU' },
  { key: 'dest', label: 'Destroyed IoU' },
  { key: 'miouTta', label: 'mIoU (TTA)' },
  { key: 'destTta', label: 'Destroyed IoU (TTA)' },
]
export const SEG_ROWS = [
  { model: 'R9 (sampler + copy-paste)', miou: '0.5373', dest: '0.2921', miouTta: '0.5440', destTta: '0.3001' },
  { model: 'R11 (before + after, 6 channels)', miou: '0.5811', dest: '0.2911', miouTta: '0.5875', destTta: '0.2965', highlight: true },
  { model: 'R16c step 5 (SAM 3 + grader), clean', miou: '0.547', dest: '0.3065*', miouTta: '—', destTta: '—' },
]
export const SEG_NOTE = '*Three-seed mean on validation pairs with the 40 leaked pairs removed. Scores are on 645 full-size images.'

export const VLM_COLUMNS = [
  { key: 'task', label: 'Task' },
  { key: 'base', label: 'Base Qwen2.5-VL-7B' },
  { key: 'ours', label: 'Our fine-tuned 7B' },
  { key: 'paper', label: "DisasterM3 paper's fine-tune" },
]
export const VLM_ROWS = [
  { task: 'Disaster-type reasoning (DTR)', base: '66.6', ours: '71.1', paper: '83.6' },
  { task: 'Relational reasoning (ORR)', base: '23.9', ours: '23.3', paper: '36.2' },
  { task: 'Building counting (BDC)', base: '34.2', ours: '32.0', paper: '34.3' },
  { task: 'Bounding-box reasoning (BBR)', base: '4.7', ours: '19.5', paper: '21.5' },
  { task: 'Damage reasoning (DRE)', base: '32.9', ours: '29.3', paper: '29.4' },
  { task: 'Disaster scene reasoning (DSR)', base: '28.3', ours: '37.9', paper: '37.7' },
]
export const VLM_NOTE = 'Optical questions only, greedy decoding, 512 px input. At full size, and for the improved 7B from L0, update these rows from Task_Ledger.md.'