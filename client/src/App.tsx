import { useEffect, useMemo, useRef, useState } from 'react';
import DiagramEditor from './DiagramEditor';
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

function mergePositions(parsed: DiagramModel, prev: DiagramModel): DiagramModel {
  const prevByName = new Map(prev.nodes.map((n) => [n.name, n]));
  return {
    nodes: parsed.nodes.map((n) => {
      const old = prevByName.get(n.name);
      return old && old.x !== undefined ? { ...n, x: old.x, y: old.y } : n;
    }),
    edges: parsed.edges,
  };
}

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [model, setModel] = useState<DiagramModel>(() => parsePlantUML(DEFAULT_CODE));
  const [resetToken, setResetToken] = useState(0);
  const [tab, setTab] = useState<RightTab>('edit');
  const [svg, setSvg] = useState<string>('');
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipNextParse = useRef(false);
  const parseTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastSource = useRef<'code' | 'diagram'>('code');

  const imgSrc = useMemo(() => {
    if (!svg) return '';
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  }, [svg]);

  // text -> diagram, auto (debounced so we don't reparse on every keystroke)
  useEffect(() => {
    if (skipNextParse.current) {
      skipNextParse.current = false;
      return;
    }
    clearTimeout(parseTimer.current);
    parseTimer.current = setTimeout(() => {
      if (lastSource.current !== 'code') return; // user moved to diagram meanwhile, drop stale parse
      try {
        const parsed = parsePlantUML(code);
        setModel((prev) => mergePositions(parsed, prev));
        setResetToken((t) => t + 1);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    }, 400);
    return () => clearTimeout(parseTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // diagram -> text, auto (DiagramEditor already debounces before calling this)
  const handleDiagramActivity = () => {
    lastSource.current = 'diagram';
  };

  const handleDiagramChange = (updated: DiagramModel) => {
    if (lastSource.current !== 'diagram') return; // user moved to code meanwhile, drop stale sync
    setModel(updated);
    skipNextParse.current = true;
    setCode(generatePlantUML(updated));
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
            <button onClick={handleRender} disabled={rendering}>
              {rendering ? 'Rendering…' : 'Render (official PlantUML)'}
            </button>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => {
              lastSource.current = 'code';
              setCode(e.target.value);
            }}
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
              <DiagramEditor
                model={model}
                resetToken={resetToken}
                onChange={handleDiagramChange}
                onActivity={handleDiagramActivity}
              />
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
