import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioCapture } from '../audio/AudioCapture';
import { ChordEngine } from '../analysis/ChordEngine';
import { ChordSmoother } from '../analysis/smoother';
import type { ChordMatch } from '../analysis/types';
import type { AudioFeatures } from '../audio/types';

export interface ChordDetectionState {
  isListening: boolean;
  currentChord: ChordMatch | null;
  chroma: number[];
  rms: number;
  history: ChordMatch[];
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => void;
  error: string | null;
}

const MAX_HISTORY = 20;
const DISPLAY_CONFIDENCE = 0.7;

export function useChordDetection(): ChordDetectionState {
  const [isListening, setIsListening] = useState(false);
  const [currentChord, setCurrentChord] = useState<ChordMatch | null>(null);
  const [chroma, setChroma] = useState<number[]>(new Array(12).fill(0));
  const [rms, setRms] = useState(0);
  const [history, setHistory] = useState<ChordMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const captureRef = useRef<AudioCapture | null>(null);
  const engineRef = useRef(new ChordEngine());
  const smootherRef = useRef(new ChordSmoother());
  const lastChordNameRef = useRef<string | null>(null);
  const stickyChordRef = useRef<ChordMatch | null>(null);
  const rafRef = useRef<number>(0);

  const pendingRef = useRef<AudioFeatures | null>(null);

  const start = useCallback(async () => {
    if (captureRef.current) return;
    cancelAnimationFrame(rafRef.current);
    try {
      setError(null);
      const capture = new AudioCapture();
      captureRef.current = capture;
      smootherRef.current.reset();

      await capture.start((features) => {
        pendingRef.current = features;
      });

      const tick = () => {
        const pending = pendingRef.current;
        if (pending) {
          pendingRef.current = null;
          setChroma(pending.chroma);
          setRms(pending.rms);

          const raw = engineRef.current.detect(pending);
          const smoothed = smootherRef.current.push(raw);

          if (smoothed && smoothed.confidence >= DISPLAY_CONFIDENCE) {
            stickyChordRef.current = smoothed;
            setCurrentChord(smoothed);

            if (smoothed.name !== lastChordNameRef.current) {
              lastChordNameRef.current = smoothed.name;
              setHistory((prev) => {
                const next = [smoothed, ...prev];
                return next.length > MAX_HISTORY ? next.slice(0, MAX_HISTORY) : next;
              });
            }
          } else if (stickyChordRef.current) {
            setCurrentChord(stickyChordRef.current);
          } else {
            setCurrentChord(null);
            lastChordNameRef.current = null;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      setIsListening(true);
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access and try again.'
          : 'Failed to start audio capture.',
      );
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    captureRef.current?.stop();
    captureRef.current = null;
    smootherRef.current.reset();
    lastChordNameRef.current = null;
    stickyChordRef.current = null;
    pendingRef.current = null;
    setIsListening(false);
    setCurrentChord(null);
    setChroma(new Array(12).fill(0));
    setRms(0);
  }, []);

  const toggle = useCallback(() => {
    if (captureRef.current) {
      stop();
    } else {
      void start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      captureRef.current?.stop();
    };
  }, []);

  return { isListening, currentChord, chroma, rms, history, start, stop, toggle, error };
}
