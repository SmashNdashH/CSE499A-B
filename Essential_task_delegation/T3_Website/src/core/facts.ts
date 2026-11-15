// Every number on the site is read from here. `virtual:facts` is src/data/facts.json with the
// facts dated after the build date already removed (see vite.config.ts), so a page must work
// when fact() returns undefined.
import { facts } from 'virtual:facts';

export interface Fact {
  id: string;
  value: unknown;
  /** The value as the site shows it. */
  display: string;
  /** What it measures, in plain words. */
  measures: string;
  image_set: string;
  model: string;
  /**
   * Optional wording that belongs to this fact, with {value} where the number goes. It lives here,
   * not in a component, so it is left out of the build together with a fact that isn't public yet.
   */
  note?: string;
  /** Path in the repository. */
  source: string;
  public_from: string;
}

// The repository's address since its rename (the old one, CSE499A.15-Msrb-, still redirects).
const REPO_URL = 'https://github.com/SmashNdashH/CSE499A-B/blob/main/';
const byId = new Map(facts.map((f) => [f.id, f]));

export const fact = (id: string): Fact | undefined => byId.get(id);
export const sourceUrl = (repoPath: string) => REPO_URL + repoPath.split('/').map(encodeURIComponent).join('/');
