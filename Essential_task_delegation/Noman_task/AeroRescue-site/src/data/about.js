export const TEAM = [
  'Abdullah Al Noman',
  'Tamanna Akter Mou',
  'Aryan Sami',
  'Ridita Afrin Riya',
  'Abrar Mohammed Tanzim Alam',
]

export const LIMITATIONS = [
  'Decision-support only. Outputs need expert human validation and are not rescue directives.',
  'Counting from segmentation is still weak: touching buildings merge and damaged ones split.',
  'Strong on some events and weak on others (for example, Turkey earthquake scenes).',
  'We found 40 validation pairs that leaked from training. Segmentation scores are reported without them.',
  'The demo needs a before and after image of the same place.',
]

export const FAQ = [
  { q: 'Why does the demo need two images?', a: 'Our models compare the before and after images, so they can see where a building stood before it became rubble.' },
  { q: 'Does it work offline?', a: 'Planned: at the booth, the site calls a local API on the laptop with the internet off. The offline run is already proven on two T4 GPUs.' },
  { q: 'Can I trust the numbers?', a: 'Segmentation scores are computed on 605 validation pairs, after removing 40 that leaked from training. See Results for caveats.' },
  { q: 'Is this for real rescue operations?', a: 'No. It is a research prototype and decision-support tool.' },
]
