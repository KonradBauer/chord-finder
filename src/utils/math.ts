export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA * magB);
  return denom === 0 ? 0 : dot / denom;
}

/** Rotate a 12-element chroma template by `semitones` positions to the right. */
export function rotateTemplate(template: number[], semitones: number): number[] {
  const len = template.length;
  const result = new Array<number>(len);
  for (let i = 0; i < len; i++) {
    result[(i + semitones) % len] = template[i];
  }
  return result;
}
