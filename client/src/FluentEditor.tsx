import { useEffect, useRef, useState } from 'react';
import { Sequence, actor, app, service, db, api, queue, storage, type DiagramModel } from './fluent/index';
import { generateFluentCode } from './fluent/generator';
import DiagramView from './DiagramView';

const DEFAULT_CODE = `Sequence("Login")
  .uses(
    actor("Usuario"),
    app("Frontend"),
    service("Auth"),
    db("Users")
  )
  .step("Usuario", "Frontend", "Ingresa credenciales")
  .step("Frontend", "Auth", "Valida credenciales")
  .step("Auth", "Users", "Busca usuario")
  .when("Credenciales correctas")
    .then()
      .step("Auth", "Frontend", "Crea sesión")
      .step("Frontend", "Usuario", "Redirige al dashboard")
    .otherwise()
      .step("Auth", "Frontend", "Devuelve error")
      .step("Frontend", "Usuario", "Muestra mensaje")
  .end()
  .theme("modern")
  .draw()`;

// Corre el código del usuario (mismo patrón que un REPL/playground: la entrada
// es del propio usuario, no datos externos no confiables, así que new Function
// aquí es equivalente a pegarlo en la consola del navegador).
function runFluentCode(code: string): { ast: DiagramModel; warnings: { message: string }[] } {
  const fn = new Function(
    'Sequence',
    'actor',
    'app',
    'service',
    'db',
    'api',
    'queue',
    'storage',
    `"use strict";\nreturn (\n${code}\n);`,
  );
  const result = fn(Sequence, actor, app, service, db, api, queue, storage);
  return { ast: result.ast, warnings: result.warnings };
}

export default function FluentEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [ast, setAst] = useState<DiagramModel | null>(null);
  const [warnings, setWarnings] = useState<{ message: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const lastSource = useRef<'code' | 'diagram'>('code');
  const skipNextRun = useRef(false);
  const runTimer = useRef<ReturnType<typeof setTimeout>>();

  const runNow = (source: string) => {
    try {
      const r = runFluentCode(source);
      setAst(r.ast);
      setWarnings(r.warnings);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Run once on mount.
  useEffect(() => {
    runNow(DEFAULT_CODE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-run while typing, debounced. Skipped when the code was just
  // regenerated from a diagram edit (avoids clobbering in-progress typing).
  useEffect(() => {
    if (skipNextRun.current) {
      skipNextRun.current = false;
      return;
    }
    clearTimeout(runTimer.current);
    runTimer.current = setTimeout(() => {
      if (lastSource.current !== 'code') return;
      runNow(code);
    }, 500);
    return () => clearTimeout(runTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleDiagramChange = (updated: DiagramModel) => {
    lastSource.current = 'diagram';
    setAst(updated);
    setWarnings([]);
    setError(null);
    skipNextRun.current = true;
    setCode(generateFluentCode(updated));
  };

  return (
    <div className="app-body">
      <div className="pane pane-code">
        <div className="pane-toolbar">
          <span className="pane-label">Fluent Grammar</span>
          <div className="spacer" />
          <button
            onClick={() => {
              lastSource.current = 'code';
              runNow(code);
            }}
          >
            Draw
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
        {error && (
          <div className="error-banner">
            <pre>{error}</pre>
          </div>
        )}
      </div>

      <div className="pane pane-diagram">
        <div className="pane-toolbar">
          <span className="pane-label">Diagram</span>
        </div>
        <div className="pane-content">
          {ast ? (
            <div className="svg-preview">
              <DiagramView model={ast} onChange={handleDiagramChange} />
            </div>
          ) : (
            <p className="hint">Escribe código a la izquierda para generar el diagrama.</p>
          )}
          {warnings.length > 0 && (
            <div className="error-banner error-banner-warning">
              {warnings.map((w, i) => (
                <pre key={i}>{w.message}</pre>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
