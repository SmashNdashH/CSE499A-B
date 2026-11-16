/// <reference types="vite/client" />

// The native runtime (used only by scripts/check-browser-model.ts) ships without its type file;
// it has the same interface as the browser runtime's shared core.
declare module 'onnxruntime-node' {
  export * from 'onnxruntime-common';
}

declare module 'virtual:facts' {
  import type { Fact } from './core/facts.ts';
  /** The date this build was made; facts with a later public_from are left out of the bundle. */
  export const buildDate: string;
  export const facts: Fact[];
}
