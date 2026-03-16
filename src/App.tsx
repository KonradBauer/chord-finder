import { useChordDetection } from './hooks/useChordDetection';
import { ChordDisplay } from './components/ChordDisplay';
import { ChromaVisualizer } from './components/ChromaVisualizer';
import { ChordHistory } from './components/ChordHistory';
import './App.css';

function App() {
  const { isListening, currentChord, chroma, rms, history, toggle, error } = useChordDetection();

  return (
    <div className="app">
      {error && <div className="error-toast">{error}</div>}

      <div className="top-bar">
        <span className={`status-dot ${isListening ? 'active' : ''}`} />
        <span className="status-label">
          {isListening ? 'Listening' : 'Chord Finder'}
        </span>
        {isListening && (
          <span className="rms-indicator">
            <span className="rms-bar" style={{ width: `${Math.min(rms * 400, 100)}%` }} />
          </span>
        )}
      </div>

      <div className="chord-area" onClick={toggle}>
        <ChordDisplay chord={currentChord} history={history} isListening={isListening} />
        {!isListening && (
          <div className="tap-hint">Tap to start</div>
        )}
      </div>

      <ChromaVisualizer chroma={chroma} />

      <ChordHistory history={history} />

      {isListening && (
        <button className="stop-btn" onClick={toggle}>
          Stop
        </button>
      )}
    </div>
  );
}

export default App;
