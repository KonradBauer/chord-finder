export interface AudioFeatures {
  chroma: number[];
  rms: number;
  key: string;
  scale: string;
  strength: number;
}

export type AudioFeaturesCallback = (features: AudioFeatures) => void;
