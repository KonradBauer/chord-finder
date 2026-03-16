import type { ChordMatch } from './types';

const BUFFER_SIZE = 4;
const AGREEMENT_THRESHOLD = 0.6; // 60% of frames must agree

export class ChordSmoother {
  private buffer: (ChordMatch | null)[] = [];

  push(match: ChordMatch | null): ChordMatch | null {
    this.buffer.push(match);
    if (this.buffer.length > BUFFER_SIZE) {
      this.buffer.shift();
    }

    // Count occurrences of each chord name in the buffer
    const counts = new Map<string | null, number>();
    for (const entry of this.buffer) {
      counts.set(entry?.name ?? null, (counts.get(entry?.name ?? null) ?? 0) + 1);
    }

    // Find the most common chord
    let bestName: string | null = null;
    let bestCount = 0;
    for (const [chordName, count] of counts) {
      if (count > bestCount) {
        bestCount = count;
        bestName = chordName;
      }
    }

    // Require agreement threshold
    if (bestCount / this.buffer.length < AGREEMENT_THRESHOLD) return null;

    if (bestName === null) return null;

    // Return the most recent matching frame (preserves full ChordMatch data)
    for (let i = this.buffer.length - 1; i >= 0; i--) {
      if (this.buffer[i]?.name === bestName) {
        return this.buffer[i];
      }
    }

    return null;
  }

  reset(): void {
    this.buffer = [];
  }
}
