import { useState } from 'react';
import FluentEditor from './FluentEditor';
import Docs from './Docs';
import './App.css';

type View = 'editor' | 'docs';

export default function App() {
  const [view, setView] = useState<View>('editor');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fluent Diagram Grammar</h1>
        <div className="app-nav">
          <button className={view === 'editor' ? 'active' : ''} onClick={() => setView('editor')}>
            Editor
          </button>
          <button className={view === 'docs' ? 'active' : ''} onClick={() => setView('docs')}>
            Docs
          </button>
        </div>
      </header>
      {view === 'editor' ? <FluentEditor /> : <Docs />}
    </div>
  );
}
