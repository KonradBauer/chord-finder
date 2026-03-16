import type { ChordMatch } from './types';
import type { AudioFeatures } from '../audio/types';

const SILENCE_THRESHOLD = 0.002;
const MIN_STRENGTH = 0.3;

export class ChordEngine {
  detect(features: AudioFeatures): ChordMatch | null {
    if (features.rms < SILENCE_THRESHOLD) return null;
    if (features.strength < MIN_STRENGTH) return null;
    if (!features.key || features.key === '') return null;

    const isMinor = features.scale === 'minor';
    const root = features.key;
    const displayRoot = isMinor ? root.toLowerCase() : root;
    const name = displayRoot;

    return {
      name,
      root,
      type: isMinor ? 'min' : 'maj',
      confidence: features.strength,
    };
  }
}
