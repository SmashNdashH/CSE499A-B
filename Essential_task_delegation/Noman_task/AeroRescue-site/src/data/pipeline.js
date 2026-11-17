export const PIPELINE = [
  { step: '01', title: 'Find and grade the buildings', text: 'Two candidate routes give the damage map: R11, a U-Net that reads the before and after images together and labels every pixel, or SAM 3, which outlines buildings in the before image, with a grader network that gives each one a damage grade. The project is still choosing between them.' },
  { step: '02', title: 'Count', text: 'Per-building facts go into a table and are counted with fixed queries, so counts come from data, not from the VLM guessing.' },
  { step: '03', title: 'Heatmap', text: 'Destroyed and damaged areas become a danger map and a survivability-search priority map.' },
  { step: '04', title: 'Explain', text: 'A fine-tuned Qwen2.5-VL answers questions and DisasTeller writes a report on local models.' },
  { step: '05', title: 'Edge', text: 'An INT8 segmenter for laptop-class hardware is done. A distilled 3B model is planned: its training notebooks are built but not run yet.' },
]
