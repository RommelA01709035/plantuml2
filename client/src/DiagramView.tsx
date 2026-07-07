import { useEffect, useState } from 'react';
import { Check, Plus, Trash, X } from '@phosphor-icons/react';
import type { DiagramModel } from './fluent/core/types';
import { computeLayout, TOP_MARGIN, BOX_W, BOX_H } from './fluent/layout';
import type { Address } from './fluent/astOps';
import { renameComponent, editStepMessage, editConditionLabel, deleteNode, addStep, addCondition, addComponent } from './fluent/astOps';
import { actor, app, service, db, api, queue, storage } from './fluent/index';

const COMPONENT_HELPERS = { actor, app, service, db, api, queue, storage } as const;
type ComponentTypeKey = keyof typeof COMPONENT_HELPERS;

interface Props {
  model: DiagramModel;
  onChange: (model: DiagramModel) => void;
}

export default function DiagramView({ model, onChange }: Props) {
  const layout = computeLayout(model);

  return (
    <div className="diagram-view-wrap">
      <div className="diagram-toolbar">
        <AddParticipant model={model} onChange={onChange} />
      </div>
      <div className="diagram-view" style={{ width: layout.width, height: layout.height }}>
        <svg className="diagram-svg" width={layout.width} height={layout.height}>
          <defs>
            <marker id="dv-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" className="diagram-arrowhead" />
            </marker>
          </defs>
          {layout.participants.map((p) => (
            <line
              key={p.id}
              x1={p.x}
              y1={TOP_MARGIN + BOX_H}
              x2={p.x}
              y2={layout.height - 20}
              className="diagram-lifeline"
            />
          ))}
          {layout.rows.map((row, i) =>
            row.type === 'step' ? (
              <line
                key={i}
                x1={row.x1}
                y1={row.y}
                x2={row.x2}
                y2={row.y}
                className="diagram-arrow"
                markerEnd="url(#dv-arrow)"
              />
            ) : null,
          )}
        </svg>

        <div className="diagram-overlay">
          {layout.participants.map((p) => (
            <div
              key={p.id}
              className="diagram-participant"
              style={{ left: p.x - BOX_W / 2, top: TOP_MARGIN, width: BOX_W, height: BOX_H }}
            >
              <EditableText
                value={p.label}
                className="diagram-participant-text"
                onCommit={(v) => onChange(renameComponent(model, p.id, v))}
              />
            </div>
          ))}

          {layout.rows.map((row, i) => {
            if (row.type === 'step') {
              return (
                <div
                  key={i}
                  className="diagram-row diagram-row-step"
                  style={{ top: row.y - 20, left: Math.min(row.x1, row.x2), width: Math.abs(row.x2 - row.x1) || 40 }}
                >
                  <EditableText
                    value={row.message}
                    placeholder="mensaje..."
                    className="diagram-step-message"
                    onCommit={(v) => onChange(editStepMessage(model, row.address, v))}
                  />
                  <IconBtn
                    icon={<Trash size={13} weight="bold" />}
                    label="Borrar step"
                    danger
                    onClick={() => onChange(deleteNode(model, row.address))}
                  />
                </div>
              );
            }
            if (row.type === 'condition-header') {
              return (
                <div key={i} className="diagram-row diagram-row-condition" style={{ top: row.y - 22, left: 16 }}>
                  <span className="diagram-condition-tag">si</span>
                  <EditableText
                    value={row.label}
                    className="diagram-condition-text"
                    onCommit={(v) => onChange(editConditionLabel(model, row.address, v))}
                  />
                  <IconBtn
                    icon={<Trash size={13} weight="bold" />}
                    label="Borrar condición"
                    danger
                    onClick={() => onChange(deleteNode(model, row.address))}
                  />
                </div>
              );
            }
            if (row.type === 'condition-divider') {
              return (
                <div key={i} className="diagram-row diagram-row-divider" style={{ top: row.y - 24, left: 16 }}>
                  <span className="diagram-condition-tag diagram-condition-tag-muted">si no</span>
                  <AddRowControls model={model} branchAddress={[...row.address, 'thenBranch']} onChange={onChange} compact />
                </div>
              );
            }
            if (row.type === 'condition-end') {
              return (
                <div key={i} className="diagram-row diagram-row-end" style={{ top: row.y - 18, left: 16 }}>
                  <AddRowControls model={model} branchAddress={[...row.address, 'otherwiseBranch']} onChange={onChange} compact />
                </div>
              );
            }
            return null;
          })}

          <div className="diagram-row diagram-row-root-add" style={{ top: layout.height - 26, left: 16 }}>
            <AddRowControls model={model} branchAddress={[]} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableText({
  value,
  onCommit,
  placeholder,
  className,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  if (editing) {
    return (
      <input
        className={`inline-edit ${className ?? ''}`}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => {
          setEditing(false);
          const trimmed = draft.trim();
          if (trimmed && trimmed !== value) onCommit(trimmed);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button type="button" className={`inline-text ${className ?? ''}`} onClick={() => setEditing(true)}>
      {value || <span className="inline-text-placeholder">{placeholder}</span>}
    </button>
  );
}

function IconBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-btn ${danger ? 'icon-btn-danger' : ''}`}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function AddRowControls({
  model,
  branchAddress,
  onChange,
  compact,
}: {
  model: DiagramModel;
  branchAddress: Address;
  onChange: (m: DiagramModel) => void;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<'idle' | 'step' | 'condition'>('idle');
  const [from, setFrom] = useState(model.components[0]?.id ?? '');
  const [to, setTo] = useState(model.components[1]?.id ?? model.components[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [label, setLabel] = useState('');

  if (model.components.length === 0) return null;

  function reset() {
    setMode('idle');
    setMessage('');
    setLabel('');
  }

  function commit() {
    if (mode === 'step') {
      onChange(addStep(model, branchAddress, from || model.components[0].id, to || model.components[0].id, message.trim() || 'paso'));
    } else if (mode === 'condition') {
      onChange(addCondition(model, branchAddress, label.trim() || 'condición'));
    }
    reset();
  }

  if (mode === 'step') {
    return (
      <div className="diagram-add-form">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="diagram-select">
          {model.components.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="diagram-add-arrow">&#8594;</span>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="diagram-select">
          {model.components.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          autoFocus
          className="diagram-add-input"
          placeholder="mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') reset();
          }}
        />
        <IconBtn icon={<Check size={13} weight="bold" />} label="Agregar" onClick={commit} />
        <IconBtn icon={<X size={13} weight="bold" />} label="Cancelar" onClick={reset} />
      </div>
    );
  }

  if (mode === 'condition') {
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
        <IconBtn icon={<Check size={13} weight="bold" />} label="Agregar" onClick={commit} />
        <IconBtn icon={<X size={13} weight="bold" />} label="Cancelar" onClick={reset} />
      </div>
    );
  }

  return (
    <div className="diagram-add-idle">
      <button type="button" className="diagram-add-btn" onClick={() => setMode('step')}>
        <Plus size={12} weight="bold" /> paso
      </button>
      {!compact && (
        <button type="button" className="diagram-add-btn" onClick={() => setMode('condition')}>
          <Plus size={12} weight="bold" /> condición
        </button>
      )}
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
    let component = helper(trimmed);
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
      <IconBtn icon={<Check size={13} weight="bold" />} label="Agregar" onClick={commit} />
      <IconBtn icon={<X size={13} weight="bold" />} label="Cancelar" onClick={reset} />
    </div>
  );
}
