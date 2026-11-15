/// <reference types="vite/client" />

declare module 'virtual:facts' {
  import type { Fact } from './core/facts.ts';
  /** The date this build was made; facts with a later public_from are left out of the bundle. */
  export const buildDate: string;
  export const facts: Fact[];
}
