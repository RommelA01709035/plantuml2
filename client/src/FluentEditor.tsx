import { useEffect, useRef, useState } from 'react';
import { Plus, Check, X } from '@phosphor-icons/react';
import { Sequence, actor, app, service, db, api, queue, storage, type DiagramModel, type ComponentDefinition } from './fluent/index';
import { generateFluentCode } from './fluent/generator';
import {
  renameComponent,
  moveComponent,
  deleteComponent,
  addComponent,
  addStep,
  addCondition,
  addSeparator,
  editStepMessage,
  editConditionLabel,
  editSeparatorLabel,
  deleteNode,
  moveNode,
  setStepGap,
  setStepXShift,
  setStepXStretch,
} from './fluent/astOps';
import ParticipantGraph from './ParticipantGraph';

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

const COMPONENT_HELPERS = { actor, app, service, db, api, queue, storage } as const;
type ComponentTypeKey = keyof typeof COMPONENT_HELPERS;

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

// A cheap signature of everything that affects the graph's SHAPE or vertical
// LAYOUT: participant list, and the from/to/style/order/gapAfter of every
// step at any depth (so reordering, add/delete, or stretching a row all
// trigger a rebuild). Rename/move/message-text/label edits don't change this
// on purpose, so the canvas only rebuilds when it truly must.
function flowSignature(nodes: DiagramModel['flow']): string {
  return nodes
    .map((n) =>
      n.kind === 'step'
        ? `s:${n.from}>${n.to}:${n.style ?? 'call'}:${n.gapAfter ?? 0}:${n.xShift ?? 0}:${n.xStretch ?? 0}`
        : n.kind === 'separator'
          ? 'sep'
          : `c(${flowSignature(n.thenBranch)}|${flowSignature(n.otherwiseBranch)})`,
    )
    .join(',');
}

function rootSignature(m: DiagramModel): string {
  return JSON.stringify([m.components.map((c) => c.id), flowSignature(m.flow)]);
}

function mergePositions(parsed: DiagramModel, prev: DiagramModel): DiagramModel {
  const prevById = new Map(prev.components.map((c) => [c.id, c]));
  return {
    ...parsed,
    components: parsed.components.map((c) => {
      const old = prevById.get(c.id);
      return old && old.x !== undefined ? { ...c, x: old.x, y: old.y } : c;
    }),
  };
}

export default function FluentEditor() {
  const initial = runFluentCode(DEFAULT_CODE);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [ast, setAst] = useState<DiagramModel>(initial.ast);
  const [warnings, setWarnings] = useState<{ message: string }[]>(initial.warnings);
  const [error, setError] = useState<string | null>(null);
  const [graphReset, setGraphReset] = useState(0);

  const lastSource = useRef<'code' | 'diagram'>('code');
  const skipNextRun = useRef(false);
  const runTimer = useRef<ReturnType<typeof setTimeout>>();

  const runNow = (source: string) => {
    try {
      const r = runFluentCode(source);
      setAst((prev) => {
        const merged = mergePositions(r.ast, prev);
        if (rootSignature(prev) !== rootSignature(merged)) setGraphReset((n) => n + 1);
        return merged;
      });
      setWarnings(r.warnings);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

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

  const applyDiagramChange = (updated: DiagramModel) => {
    lastSource.current = 'diagram';
    setAst((prev) => {
      if (rootSignature(prev) !== rootSignature(updated)) setGraphReset((n) => n + 1);
      return updated;
    });
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
          <span className="pane-label">Diagrama</span>
          <div className="spacer" />
          <AddRootCondition model={ast} onChange={applyDiagramChange} />
          <AddRootSeparator model={ast} onChange={applyDiagramChange} />
          <AddParticipant model={ast} onChange={applyDiagramChange} />
        </div>
        <div className="pane-content">
          <div className="diagram-scroll">
            <ParticipantGraph
              model={ast}
              resetSignal={graphReset}
              onRename={(id, label) => applyDiagramChange(renameComponent(ast, id, label))}
              onDeleteComponent={(id) => applyDiagramChange(deleteComponent(ast, id))}
              onMove={(id, x, y) => applyDiagramChange(moveComponent(ast, id, x, y))}
              onConnect={(source, target) => applyDiagramChange(addStep(ast, [], source, target, 'nuevo paso'))}
              onEditStepMessage={(address, message) => applyDiagramChange(editStepMessage(ast, address, message))}
              onDeleteStep={(address) => applyDiagramChange(deleteNode(ast, address))}
              onMoveStep={(address, direction) => applyDiagramChange(moveNode(ast, address, direction))}
              onAdjustStepGap={(address, gapAfter) => applyDiagramChange(setStepGap(ast, address, gapAfter))}
              onAdjustStepXShift={(address, xShift) => applyDiagramChange(setStepXShift(ast, address, xShift))}
              onAdjustStepXStretch={(address, xStretch) => applyDiagramChange(setStepXStretch(ast, address, xStretch))}
              onEditConditionLabel={(address, label) => applyDiagramChange(editConditionLabel(ast, address, label))}
              onDeleteCondition={(address) => applyDiagramChange(deleteNode(ast, address))}
              onAddStep={(branchAddress, from, to, message) => applyDiagramChange(addStep(ast, branchAddress, from, to, message))}
              onAddCondition={(branchAddress, label) => applyDiagramChange(addCondition(ast, branchAddress, label))}
              onEditSeparatorLabel={(address, label) => applyDiagramChange(editSeparatorLabel(ast, address, label))}
              onDeleteSeparator={(address) => applyDiagramChange(deleteNode(ast, address))}
            />
          </div>
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

function AddParticipant({ model, onChange }: { model: DiagramModel; onChange: (m: DiagramModel) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ComponentTypeKey>('actor');
  const [label, setLabel] = useState('');

  function reset() {
    setOpen(false);
    setLabel('');
  }

  function commit() {
    const trimmed = label.trim();
    if (!trimmed) return reset();
    const helper = COMPONENT_HELPERS[type];
    let component: ComponentDefinition = helper(trimmed);
    if (model.components.some((c) => c.id === component.id)) {
      component = { ...component, id: `${component.id}-${model.components.length + 1}` };
    }
    onChange(addComponent(model, component));
    reset();
  }

  if (!open) {
    return (
      <button type="button" className="diagram-add-btn" onClick={() => setOpen(true)}>
        <Plus size={12} weight="bold" /> participante
      </button>
    );
  }

  return (
    <div className="diagram-add-form">
      <select value={type} onChange={(e) => setType(e.target.value as ComponentTypeKey)} className="diagram-select">
        {(Object.keys(COMPONENT_HELPERS) as ComponentTypeKey[]).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
      <input
        autoFocus
        className="diagram-add-input"
        placeholder="nombre"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') reset();
        }}
      />
      <button type="button" className="icon-btn" title="Agregar" onClick={commit}>
        <Check size={13} weight="bold" />
      </button>
      <button type="button" className="icon-btn" title="Cancelar" onClick={reset}>
        <X size={13} weight="bold" />
      </button>
    </div>
  );
}

function AddRootCondition({ model, onChange }: { model: DiagramModel; onChange: (m: DiagramModel) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');

  function reset() {
    setOpen(false);
    setLabel('');
  }

  function commit() {
    const trimmed = label.trim();
    if (!trimmed) return reset();
    onChange(addCondition(model, [], trimmed));
    reset();
  }

  if (!open) {
    return (
      <button type="button" className="diagram-add-btn" onClick={() => setOpen(true)}>
        <Plus size={12} weight="bold" /> condición
      </button>
    );
  }

  return (
    <div className="diagram-add-form">
      <input
        autoFocus
        className="diagram-add-input"
        placeholder="condición"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') reset();
        }}
      />
      <button type="button" className="icon-btn" title="Agregar" onClick={commit}>
        <Check size={13} weight="bold" />
      </button>
      <button type="button" className="icon-btn" title="Cancelar" onClick={reset}>
        <X size={13} weight="bold" />
      </button>
    </div>
  );
}

function AddRootSeparator({ model, onChange }: { model: DiagramModel; onChange: (m: DiagramModel) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');

  function reset() {
    setOpen(false);
    setLabel('');
  }

  function commit() {
    const trimmed = label.trim();
    if (!trimmed) return reset();
    onChange(addSeparator(model, [], trimmed));
    reset();
  }

  if (!open) {
    return (
      <button type="button" className="diagram-add-btn" onClick={() => setOpen(true)}>
        <Plus size={12} weight="bold" /> separador
      </button>
    );
  }

  return (
    <div className="diagram-add-form">
      <input
        autoFocus
        className="diagram-add-input"
        placeholder="== texto =="
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') reset();
        }}
      />
      <button type="button" className="icon-btn" title="Agregar" onClick={commit}>
        <Check size={13} weight="bold" />
      </button>
      <button type="button" className="icon-btn" title="Cancelar" onClick={reset}>
        <X size={13} weight="bold" />
      </button>
    </div>
  );
}
