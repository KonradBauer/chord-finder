import type { AudioFeaturesCallback } from './types';

// @ts-expect-error -- no TS declarations
import Essentia from 'essentia.js/dist/essentia.js-core.es.js';
// @ts-expect-error -- ES module with inline WASM
import { EssentiaWASM } from 'essentia.js/dist/essentia-wasm.es.js';

const FRAME_SIZE = 4096;
const HIGHPASS_FREQ = 80;
const LOWPASS_FREQ = 1200;

let essentiaInstance: any = null;

function getEssentia(): any {
  if (!essentiaInstance) {
    essentiaInstance = new Essentia(EssentiaWASM);
  }
  return essentiaInstance;
}

export class AudioCapture {
  private audioContext: AudioContext | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;

  async start(callback: AudioFeaturesCallback): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.audioContext = new AudioContext();
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const ess = getEssentia();
    const sampleRate = this.audioContext.sampleRate;

    const source = this.audioContext.createMediaStreamSource(this.stream);

    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = HIGHPASS_FREQ;
    highpass.Q.value = 0.7;

    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = LOWPASS_FREQ;
    lowpass.Q.value = 0.7;

    source.connect(highpass);
    highpass.connect(lowpass);

    this.scriptNode = this.audioContext.createScriptProcessor(FRAME_SIZE, 1, 1);

    this.scriptNode.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);

      // RMS
      let sumSq = 0;
      for (let i = 0; i < inputData.length; i++) {
        sumSq += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sumSq / inputData.length);

      try {
        const vectorSignal = ess.arrayToVector(inputData);

        // Windowing(frame, normalized?, size?, type?, zeroPadding?, zeroPhase?)
        const windowed = ess.Windowing(
          vectorSignal,
          true,
          FRAME_SIZE,
          'blackmanharris62',
          0,
          true,
        );

        // Spectrum(frame, size?)
        const spectrum = ess.Spectrum(windowed.frame, FRAME_SIZE);

        // SpectralPeaks(spectrum, magnitudeThreshold?, maxFrequency?, maxPeaks?, minFrequency?, orderBy?, sampleRate?)
        const peaks = ess.SpectralPeaks(
          spectrum.spectrum,
          0.00001,
          3500,
          60,
          20,
          'magnitude',
          sampleRate,
        );

        // HPCP(frequencies, magnitudes, bandPreset?, bandSplitFrequency?, harmonics?, maxFrequency?, maxShifted?, minFrequency?, nonLinear?, normalized?, referenceFrequency?, sampleRate?, size?, weightType?, windowSize?)
        const hpcp = ess.HPCP(
          peaks.frequencies,
          peaks.magnitudes,
          true,
          500,
          0,
          5000,
          false,
          40,
          false,
          'unitMax',
          440,
          sampleRate,
          12,
          'squaredCosine',
          1,
        );

        const hpcpArray = ess.vectorToArray(hpcp.hpcp) as Float32Array;

        // Key(pcp, numHarmonics?, pcpSize?, profileType?, slope?, useMajMin?, usePolyphony?, useThreeChords?)
        const keyResult = ess.Key(
          hpcp.hpcp,
          4,
          12,
          'edma',
          0.6,
          false,
          true,
          true,
        );

        // HPCP order: A, A#, B, C, ... → reorder to C, C#, D, ...
        const reordered = new Array<number>(12);
        for (let i = 0; i < 12; i++) {
          reordered[i] = hpcpArray[(i + 3) % 12];
        }

        callback({
          chroma: reordered,
          rms,
          key: keyResult.key as string,
          scale: keyResult.scale as string,
          strength: keyResult.strength as number,
        });

        // Cleanup WASM vectors
        vectorSignal.delete();
        windowed.frame.delete();
        spectrum.spectrum.delete();
        peaks.frequencies.delete();
        peaks.magnitudes.delete();
        hpcp.hpcp.delete();
      } catch {
        callback({
          chroma: new Array(12).fill(0),
          rms,
          key: '',
          scale: '',
          strength: 0,
        });
      }
    };

    lowpass.connect(this.scriptNode);
    this.scriptNode.connect(this.audioContext.destination);
  }

  stop(): void {
    if (this.scriptNode) {
      this.scriptNode.onaudioprocess = null;
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }

    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;

    void this.audioContext?.close();
    this.audioContext = null;
  }
}
