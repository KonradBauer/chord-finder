import type { ChordMatch } from '../analysis/types';

interface Props {
  chord: ChordMatch | null;
  history: ChordMatch[];
  isListening: boolean;
}

const VISIBLE_PAST = 4;

export function ChordDisplay({ chord, history, isListening }: Props) {
  if (!isListening) {
    return <div className="chord-main chord-empty" />;
  }

  const current = chord ?? history[0] ?? null;
  if (!current) {
    return (
      <div className="chord-main">
        <span className="chord-waiting">—</span>
      </div>
    );
  }

  const startIdx = history[0]?.name === current.name ? 1 : 0;
  const past = history.slice(startIdx, startIdx + VISIBLE_PAST);

  return (
    <div className="chord-main">
      <div className="chord-past-row">
        {past.map((ch, i) => (
          <span key={`${ch.name}-${i}`} className="chord-past-item">
            {ch.name}
          </span>
        ))}
      </div>
      <div className="chord-current" key={current.name}>
        {current.name}
      </div>
      <div className="chord-confidence-bar">
        <div
          className="chord-confidence-fill"
          style={{ width: `${Math.round(current.confidence * 100)}%` }}
        />
      </div>
    </div>
  );
}
