export interface ChordMatch {
  name: string;
  root: string;
  type: string;
  confidence: number;
}

export interface ChordTemplate {
  name: string;
  type: string;
  chroma: number[];
}
