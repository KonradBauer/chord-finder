import type { ChordMatch } from '../analysis/types';

interface Props {
  history: ChordMatch[];
}

export function ChordHistory({ history }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="history">
      {history.map((chord, i) => (
        <span key={`${chord.name}-${i}`} className="history-item">
          {chord.name}
        </span>
      ))}
    </div>
  );
}
