/**
 * Binary chroma vectors for each chord type, rooted at C (index 0).
 * Indices: C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
 */

export const CHORD_TYPES: Record<string, number[]> = {
  //                    C  C# D  D# E  F  F# G  G# A  A# B
  'maj':     /* 1 3 5 */[1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  'min':     /* 1 b3 5*/[1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  '7':       /* 1 3 5 b7*/[1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  'm7':      /* 1 b3 5 b7*/[1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  'maj7':    /* 1 3 5 7*/[1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  'dim':     /* 1 b3 b5*/[1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
  'aug':     /* 1 3 #5*/[1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  'sus2':    /* 1 2 5 */[1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  'sus4':    /* 1 4 5 */[1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  'add9':    /* 1 2 3 5*/[1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
};

/**
 * Display config per chord type.
 * minor=true → root in lowercase (e.g. "c" instead of "C")
 * suffix → appended after root (e.g. "7", "sus2")
 */
export const CHORD_DISPLAY: Record<string, { minor: boolean; suffix: string }> = {
  'maj':  { minor: false, suffix: '' },
  'min':  { minor: true,  suffix: '' },
  '7':    { minor: false, suffix: '7' },
  'm7':   { minor: true,  suffix: '7' },
  'maj7': { minor: false, suffix: '7' },
  'dim':  { minor: true,  suffix: 'dim' },
  'aug':  { minor: false, suffix: 'aug' },
  'sus2': { minor: false, suffix: 'sus2' },
  'sus4': { minor: false, suffix: 'sus4' },
  'add9': { minor: false, suffix: 'add9' },
};
