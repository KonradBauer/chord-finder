import { NOTE_NAMES } from '../utils/noteNames';

interface Props {
  chroma: number[];
}

export function ChromaVisualizer({ chroma }: Props) {
  let max = 0.001;
  for (let i = 0; i < chroma.length; i++) {
    if (chroma[i] > max) max = chroma[i];
  }

  return (
    <div className="chroma">
      {chroma.map((value, i) => {
        const pct = (value / max) * 100;
        return (
          <div className="chroma-col" key={NOTE_NAMES[i]}>
            <div className="chroma-track">
              <div
                className="chroma-fill"
                style={{ height: `${pct}%`, opacity: 0.4 + (pct / 100) * 0.6 }}
              />
            </div>
            <span className="chroma-note">{NOTE_NAMES[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
