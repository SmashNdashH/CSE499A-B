// The one place that says what the in-browser model reads. The page, the worker and the parity
// check all take it from here.
//
// A before-and-after export would read both photos as 6 channels. For R11's (L1c), change `images` to
// ['after', 'before'], R11's channel order (the after-photo first, as it was trained), and point `file`
// (and `bytes`) at the new model: the page then asks for two photos and the worker stacks them in that order.
export const FIELD_MODEL = {
  /** Shown wherever the result is labelled. */
  label: 'Field model',
  file: '/model/r9_int8_static_keep1_3.onnx',
  /** Exact size of the file; a download of any other size is refused. */
  bytes: 33_125_992,
  inputName: 'image',
  outputName: 'logits',
  /** The model reads a square of this many pixels a side. */
  size: 1024,
  /** Which photos the model reads, in channel order: 3 channels (red, green, blue) each. */
  images: ['after'] as ('before' | 'after')[],
  /** Each channel: (value - mean x 255) / (std x 255), on 0 to 255 values. The ImageNet constants. */
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
  /** Output channels: background, intact, damaged, destroyed. */
  classes: 4,
  /** Where the export and its measurements are recorded. */
  notebook: 'Essential_task_delegation/Champion_Task/L1B-results/L1b/README.md',
};

/** Where the runtime's own WebAssembly files are served from (our origin, never a CDN). */
export const RUNTIME_PATH = '/ort/';

/**
 * RGBA pixels (one size x size picture per entry of `images`) to the model's input:
 * channels first, float32, normalised. The same arithmetic as the browser test kit's prep.py,
 * rounded to 32-bit floats at each step as numpy does there. Without that rounding the input
 * differs in its last bit, and on the test image the 8-bit model's class counts moved by 25 pixels.
 */
export function toInput(pictures: Uint8ClampedArray[], size = FIELD_MODEL.size): Float32Array {
  const f = Math.fround;
  const n = size * size;
  const out = new Float32Array(pictures.length * 3 * n);
  pictures.forEach((rgba, p) => {
    for (let c = 0; c < 3; c++) {
      const mean = f(f(FIELD_MODEL.mean[c]) * 255), std = f(f(FIELD_MODEL.std[c]) * 255);
      const at = (p * 3 + c) * n;
      for (let i = 0; i < n; i++) out[at + i] = f(rgba[i * 4 + c] - mean) / std;
    }
  });
  return out;
}

/** The class with the highest score at each pixel; the lower class id wins a tie, as in the test kit. */
export function toMask(logits: Float32Array, n: number, classes = FIELD_MODEL.classes): Uint8Array {
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    let best = 0, v = logits[i];
    for (let k = 1; k < classes; k++) { const u = logits[k * n + i]; if (u > v) { v = u; best = k; } }
    mask[i] = best;
  }
  return mask;
}
