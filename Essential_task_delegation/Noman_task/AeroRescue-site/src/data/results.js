export const HEADLINE_STATS = [
  { value: '6,443', label: 'before/after image pairs' },
  { value: '605', label: 'clean validation pairs (645 minus 40 leaked)' },
  { value: '6', label: 'VLM question tasks' },
  { value: '4', label: 'damage classes' },
]

export const GOALS = [
  {
    id: 'O1',
    title: 'Spatial stage',
    status: 'Met narrowly, on validation',
    text: 'A segmentation model that finds destroyed buildings (target: Destroyed IoU > 0.30). Met on the 605 clean validation pairs by the SAM 3 + grader map: three-seed mean 0.3065. A result on test pairs now exists, and the choice of final model is still being decided.',
  },
  {
    id: 'O2',
    title: 'Grounded VLM',
    status: 'In progress',
    text: 'Building counts come from a per-building table answered with fixed queries, not through the VLM (since H2b). Counting score on clean questions: 32.47%, against the base 7B’s 34.2%. See the counting caveat under the Results table.',
  },
  {
    id: 'O3',
    title: 'Offline system',
    status: 'Offline proof passed',
    text: 'Report, damage map, counts and survivability heatmap with no cloud API. On 11 Nov DisasTeller wrote all six reports with our 7B, with the internet off, on Kaggle’s two T4 GPUs. Report quality and a single chain of models are still open.',
  },
  {
    id: 'O4',
    title: 'Edge model',
    status: 'Partly done',
    text: 'A distilled Qwen2.5-VL-3B that fits in about 6 GB. The better 7B teacher (L0) is done, L2’s notebooks are built but not run yet, and the INT8 edge segmenter is done.',
  },
]

export const SEG_COLUMNS = [
  { key: 'model', label: 'Model' },
  { key: 'miou', label: 'mIoU' },
  { key: 'dest', label: 'Destroyed IoU' },
  { key: 'miouTta', label: 'mIoU (TTA)' },
  { key: 'destTta', label: 'Destroyed IoU (TTA)' },
]
export const SEG_ROWS = [
  { model: 'R9 (sampler + copy-paste, after-image only)', miou: '0.5338', dest: '0.2800', miouTta: '0.5402', destTta: '0.2874' },
  { model: 'R11 (before + after images, 6 channels)', miou: '0.5742', dest: '0.2641', miouTta: '0.5805', destTta: '0.2692' },
  { model: 'SAM 3 + grader (mean of 3 grader seeds)', miou: '0.547', dest: '0.3065', miouTta: '—', destTta: '—' },
]
export const SEG_NOTE =
  'All rows are scored on the same 605 clean validation pairs (645 minus 40 that leaked from training), at full image size. TTA = 8-view test-time augmentation.'

export const VLM_COLUMNS = [
  { key: 'task', label: 'Task' },
  { key: 'base', label: 'Base 7B (paper)' },
  { key: 'ours', label: 'Our 7B (L0, full size)' },
  { key: 'paper', label: "Paper's fine-tune" },
]
export const VLM_ROWS = [
  { task: 'Disaster Type Recognition', base: '66.6', ours: '76.77', paper: '83.6' },
  { task: 'Bearing Bodies Recognition', base: '4.7', ours: '19.99', paper: '21.5' },
  { task: 'Building Damage Counting', base: '34.2', ours: '30.31', paper: '34.3' },
  { task: 'Road Damage Counting', base: '29.3', ours: '33.03', paper: '29.4' },
  { task: 'Disaster Scene Recognition', base: '28.3', ours: '40.46', paper: '37.7' },
  { task: 'Relational Reasoning', base: '23.9', ours: '34.62', paper: '36.2' },
]
export const VLM_NOTE =
  'Optical questions only (10,675), full image size (1036 px). Base and paper columns are from the DisasterM3 paper, Table 2. Caveat on Building Damage Counting: a rule that never looks at the image scores 66.98%. When a question’s largest option is above 20, the five options are 0.6, 0.8, 1, 1.2 and 1.4 times the correct count, so the middle value is always right. Accuracy on this task cannot show counting ability.'
