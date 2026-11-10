export const PIPELINE = [
  { step: '01', title: 'Segment', text: 'A U-Net (R11) reads the before and after images together and labels every pixel: background, intact, damaged or destroyed.' },
  { step: '02', title: 'Find and grade buildings', text: 'SAM 3 finds buildings in the before image; a grader network gives each one a damage grade.' },
  { step: '03', title: 'Count', text: 'Per-building facts go into a table and are counted with fixed queries, so counts come from data, not from the VLM guessing.' },
  { step: '04', title: 'Heatmap', text: 'Destroyed and damaged areas become a danger map and a survivability-search priority map.' },
  { step: '05', title: 'Explain', text: 'A fine-tuned Qwen2.5-VL answers questions and DisasTeller writes a report on local models.' },
  { step: '06', title: 'Edge', text: 'A distilled 3B model and an INT8 segmenter bring the system to laptop-class hardware.' },
]