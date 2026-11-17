// What is known to be wrong in the six reports of the offline proof run (11 Nov). The list follows
// the report system's own README ("Practice run 5", "Quality problems"); the proof run's reports
// are the same as that run's, word for word. One entry is not in that README, the hall as a
// "temporary command center": the run's call log (llm_calls.jsonl) shows the phrase first in the
// model's own answer and in none of its inputs. Each entry was checked against the report text.
// `npm run selfcheck` fails if a phrase is no longer in any report.
export const REPORTS = [
  ['Expert_team_report.txt', 'Expert team'],
  ['Alerts_team_report_for_social_media.txt', 'Alerts team'],
  ['Emergency_team_report.txt', 'Emergency team'],
  ['Emergency_service_human_resource_allocation.txt', 'Resource allocation'],
  ['Public_community_report.txt', 'Public community'],
  ['Reconstruction_plan.txt', 'Reconstruction plan'],
] as const;

const MAP_READING = 'A wrong reading of the map, repeated across reports: the same run grades four streets G4 or G5, with heavy damage or collapse.';
const OWN_NUMBERS = 'These staff, team and vehicle numbers are the model\'s own plan. No input gives them.';

/** Wrong words, marked wherever they occur in a report. */
export const KNOWN_ERRORS = [
  { phrase: '123456789', note: 'The model made this hotline number up. No contact detail was in its inputs, and the report system\'s own rule is to write "not available offline" for contact details.' },
  { phrase: 'temporary command center', note: 'The model made up the hall\'s role as a command centre. No input says so.' },
  { phrase: 'No high-risk zones were detected', note: MAP_READING },
  { phrase: 'no high-risk zones were identified', note: MAP_READING },
  { phrase: 'no dangerous zones', note: MAP_READING },
  { phrase: 'no additional medical points are required', note: MAP_READING },
  { phrase: 'The hurricane in Picture5.png', note: 'The disaster was an earthquake. The model calls this photo a hurricane.' },
  { phrase: 'water inundation', note: 'Given as a reason for the grade; it comes from the photo the model called a hurricane.' },
  { phrase: 'the collapsed bridge on South Central Asaichi Street', note: 'No input places the bridge on this street.' },
  { phrase: 'In South Central Asaichi Street, deploy', note: 'A mix-up: this sentence sends the medical staff to South Central Asaichi Street and, in the same breath, to unaffected areas like the hall.' },
  { phrase: '10 medical professionals', note: OWN_NUMBERS },
  { phrase: '3 Light, 2 Medium, and 1 Heavy', note: OWN_NUMBERS },
  { phrase: '10 vehicles', note: OWN_NUMBERS },
  { phrase: '[EMS98-rc-grade-5]', note: 'A real guideline passage, but one the model was never shown: no search of the run returned it.' },
];

const SAME_TWICE = 'The Introduction and the Current Situation say almost the same thing.';
const CITES_NONE = 'This report was given guideline passages and cites none of them.';

/** Known problems with no single wrong phrase to mark: something left out, a whole section, or the run's labelled map. */
export const REPORT_NOTES: Record<string, string[]> = {
  'Expert_team_report.txt': [
    'The concrete bridge of Picture3.png has no line under "Disaster grade of each location" and no label on the map. Only its description gives it a grade (G5).',
    'This report\'s grades were also drawn as labels on a map, which this site doesn\'t show. Only the hall\'s and Hama Street\'s labels are in the right place; the labels of the other streets are not on their streets.',
  ],
  'Emergency_team_report.txt': ['This report was given guideline passages. It mentions the Sphere Handbook and INSARAG by title, but cites no passage.'],
  'Emergency_service_human_resource_allocation.txt': [SAME_TWICE, CITES_NONE],
  'Public_community_report.txt': [SAME_TWICE, CITES_NONE],
  'Reconstruction_plan.txt': [
    'Not an error in the text: the appendix names the guideline passages this report used. They are real, and each came from this report\'s own searches, but they are written without square brackets, so the run\'s own check doesn\'t count them as citations.',
  ],
};
