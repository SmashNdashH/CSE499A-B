// Checks that intact, damaged and destroyed stay distinguishable in every palette, for normal
// vision and for simulated protanopia, deuteranopia and tritanopia.
// Simulation: Machado, Oliveira and Fernandes (2009), severity 1.0, on linear RGB.
// Distance: CIE76 (Euclidean distance in CIELAB). Pass: every pair at least MIN_DELTA_E apart.
import { DAMAGE_COLOURS, hexToRgb } from '../src/core/palette.ts';

const MIN_DELTA_E = 20;
const SIM: Record<string, number[][]> = {
  normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
const toLinear = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
function lab(hex: string, m: number[][]): number[] {
  const lin = hexToRgb(hex).map(toLinear);
  const [r, g, b] = m.map((row) => Math.min(1, Math.max(0, row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2])));
  const xyz = [0.4124 * r + 0.3576 * g + 0.1805 * b, 0.2126 * r + 0.7152 * g + 0.0722 * b, 0.0193 * r + 0.1192 * g + 0.9505 * b];
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(xyz[0] / 0.95047), f(xyz[1]), f(xyz[2] / 1.08883)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

let failed = false;
for (const [name, set] of Object.entries(DAMAGE_COLOURS)) {
  for (const [vision, m] of Object.entries(SIM)) {
    const labs = [1, 2, 3].map((c) => lab(set[c as 1 | 2 | 3], m));
    const d = (a: number, b: number) => Math.hypot(...labs[a].map((v, i) => v - labs[b][i]));
    const pairs = { 'intact/damaged': d(0, 1), 'intact/destroyed': d(0, 2), 'damaged/destroyed': d(1, 2) };
    const worst = Math.min(...Object.values(pairs));
    if (worst < MIN_DELTA_E) failed = true;
    console.log(`${name.padEnd(6)} ${vision.padEnd(13)} ${Object.entries(pairs).map(([k, v]) => `${k} ${v.toFixed(0)}`).join('  ')}  ${worst < MIN_DELTA_E ? 'FAIL' : 'ok'}`);
  }
}
if (failed) { console.error(`A pair is under ${MIN_DELTA_E} apart (CIE76).`); process.exit(1); }
console.log(`Every pair is at least ${MIN_DELTA_E} apart (CIE76) in every palette and every simulation.`);
