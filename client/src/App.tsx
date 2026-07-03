import { useMemo, useRef, useState } from 'react';
import DiagramEditor, { type DiagramEditorHandle } from './DiagramEditor';
import { parsePlantUML, type DiagramModel } from './plantuml/parser';
import { generatePlantUML } from './plantuml/generator';
import './App.css';

const DEFAULT_CODE = `@startuml
class Order {
  +int id
  +Date createdAt
  +total(): float
}
class Customer {
  +String name
  +String email
}
interface Payable {
  +pay()
}
Order --> Customer : placed by
Order ..|> Payable
Customer <|-- VipCustomer
@enduml`;

type RightTab = 'edit' | 'preview';

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [model, setModel] = useState<DiagramModel>(() => parsePlantUML(DEFAULT_CODE));
  const [resetToken, setResetToken] = useState(0);
  const [tab, setTab] = useState<RightTab>('edit');
  const [svg, setSvg] = useState<string>('');
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<DiagramEditorHandle>(null);

  const imgSrc = useMemo(() => {
    if (!svg) return '';
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  }, [svg]);

  const handleGenerate = () => {
    try {
      const parsed = parsePlantUML(code);
      setModel(parsed);
      setResetToken((t) => t + 1);
      setError(null);
      setTab('edit');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleSync = () => {
    if (!editorRef.current) return;
    const exported = editorRef.current.exportModel();
    setCode(generatePlantUML(exported));
  };

  const handleRender = async () => {
    setRendering(true);
    setError(null);
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: code, format: 'svg' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Render failed (${res.status})`);
      }
      const data = await res.json();
      setSvg(data.svg);
      setTab('preview');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PlantUML Editor + Visual Edit Mode</h1>
      </header>
      <div className="app-body">
        <div className="pane pane-code">
          <div className="pane-toolbar">
            <span className="pane-label">Code</span>
            <div className="spacer" />
            <button onClick={handleGenerate}>Generate ⇒ Diagram</button>
            <button onClick={handleSync}>⇐ Sync from Diagram</button>
            <button onClick={handleRender} disabled={rendering}>
              {rendering ? 'Rendering…' : 'Render (official PlantUML)'}
            </button>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          {error && <div className="error-banner">{error}</div>}
        </div>

        <div className="pane pane-diagram">
          <div className="pane-toolbar">
            <button className={tab === 'edit' ? 'active' : ''} onClick={() => setTab('edit')}>
              Edit Mode
            </button>
            <button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>
              PlantUML Preview
            </button>
          </div>
          <div className="pane-content">
            {tab === 'edit' ? (
              <DiagramEditor ref={editorRef} model={model} resetToken={resetToken} />
            ) : (
              <div className="svg-preview">
                {imgSrc ? (
                  <img src={imgSrc} alt="Rendered PlantUML diagram" />
                ) : (
                  <p className="hint">Click "Render (official PlantUML)" to generate the image.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
