// The damage colours, in one place. The page sets them as CSS variables, the mask painter reads
// them from here, and scripts/check-palette.ts tests every set under simulated colour-vision
// deficiencies. A colour never stands alone: every coloured mark also carries a text label, and
// destroyed buildings are cross-hatched on the map.
import type { ClassId } from '../types/disaster.ts';

export type PaletteId = 'light' | 'dark';

/** Started from the wireframes' colours (intact #13705d, damaged #8a5a00, destroyed #b3261e). */
export const DAMAGE_COLOURS: Record<PaletteId, Record<ClassId, string>> = {
  // For light surfaces: the wireframes' hues, with damaged lifted and destroyed deepened so the
  // two stay apart in lightness when red and green can't be told apart.
  light: { 1: '#13705d', 2: '#c07f00', 3: '#a3141f' },
  // For dark surfaces and over photos: the same three hues, brightened.
  dark: { 1: '#35c9a5', 2: '#ffc233', 3: '#ff5d52' },
};

/** The danger heatmap's colour: a violet, so it can't be read as a damage class. */
export const HEAT_COLOUR: Record<PaletteId, string> = { light: '#6b2fb3', dark: '#c58cff' };

/** CSS variables for one palette, to spread into a `style` prop. */
export function damageVars(palette: PaletteId): Record<string, string> {
  const c = DAMAGE_COLOURS[palette];
  return { '--intact': c[1], '--damaged': c[2], '--destroyed': c[3], '--heat': HEAT_COLOUR[palette] };
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
