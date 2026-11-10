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
  'We found 40 validation pairs that leaked from training. All headline scores are re-scored without them.',
  'The demo needs a before and after image of the same place.',
]

export const FAQ = [
  { q: 'Why does the demo need two images?', a: 'The best model compares the before and after images, so it can see where a building stood before it became rubble.' },
  { q: 'Does it work offline?', a: 'Yes. At the booth the same website calls a local API that runs every model on the laptop with the internet off.' },
  { q: 'Can I trust the numbers?', a: 'Scores are computed on 645 held-out images, and we removed pairs that leaked from training. See Results for caveats.' },
  { q: 'Is this for real rescue operations?', a: 'No. It is a research prototype and decision-support tool.' },
]