import { useEffect, useState } from 'react';
import type { GalleryIndex } from '../types/disaster.ts';
import { loadIndex, loadMethod, type MethodData } from './gallery.ts';

/** The gallery index; null while it loads. An empty list of pairs is a normal state. */
export function useGalleryIndex(): GalleryIndex | null {
  const [index, setIndex] = useState<GalleryIndex | null>(null);
  useEffect(() => { loadIndex().then(setIndex); }, []);
  return index;
}

export type MethodState =
  | { status: 'loading' }
  | { status: 'ready'; data: MethodData }
  /** The files could not be read. Shown as missing data, never as zero buildings. */
  | { status: 'missing' };

export function useMethodData(pairId: string | null, methodId: string | null): MethodState {
  const key = pairId && methodId ? `${pairId}/${methodId}` : null;
  const [state, setState] = useState<{ key: string; value: MethodState } | null>(null);
  useEffect(() => {
    if (!pairId || !methodId || !key) return;
    let current = true;
    loadMethod(pairId, methodId)
      .then((data) => { if (current) setState({ key, value: { status: 'ready', data } }); })
      .catch(() => { if (current) setState({ key, value: { status: 'missing' } }); });
    return () => { current = false; };
  }, [key, pairId, methodId]);
  return state && state.key === key ? state.value : { status: 'loading' };
}

export const METHOD_LABELS: Record<string, string> = {
  'before-after-unet': 'Before-and-after model',
  'find-then-grade': 'Find-then-grade',
  'after-only-unet': 'After-image-only model',
  'field-model': 'Field model',
};

export const prettyEvent = (event: string) => {
  const s = event.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};
