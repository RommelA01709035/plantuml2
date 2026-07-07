import { useEffect, useState } from 'react';
import { Check, Plus, Trash, X } from '@phosphor-icons/react';
import type { DiagramModel, FlowNode, ConditionNode } from './fluent/core/types';
import type { Address } from './fluent/astOps';
import { editStepMessage, editConditionLabel, deleteNode, addStep, addCondition } from './fluent/astOps';

interface Props {
  model: DiagramModel;
  onChange: (model: DiagramModel) => void;
}

export default function ConditionTree({ model, onChange }: Props) {
  const rootConditions = model.flow
    .map((node, i) => ({ node, address: [i] as Address }))
    .filter((x): x is { node: ConditionNode; address: Address } => x.node.kind === 'condition');

  return (
    <div className="cond-tree">
      {rootConditions.length === 0 && (
        <p className="hint">Sin condiciones todavía. Los pasos directos se dibujan arriba, en el canvas.</p>
      )}
      {rootConditions.map(({ node, address }) => (
        <ConditionBlock key={address.join('-')} model={model} node={node} address={address} onChange={onChange} />
      ))}
      <AddControls model={model} branchAddress={[]} onChange={onChange} conditionOnly />
    </div>
  );
}

function ConditionBlock({
  model,
  node,
  address,
  onChange,
}: {
  model: DiagramModel;
  node: ConditionNode;
  address: Address;
  onChange: (m: DiagramModel) => void;
}) {
  return (
    <div className="cond-block">
      <div className="cond-header">
        <span className="diagram-condition-tag">si</span>
        <EditableText
          value={node.label}
          className="diagram-condition-text"
          onCommit={(v) => onChange(editConditionLabel(model, address, v))}
        />
        <IconBtn
          icon={<Trash size={13} weight="bold" />}
          label="Borrar condición"
          danger
          onClick={() => onChange(deleteNode(model, address))}
        />
      </div>
      <div className="cond-branch">
        <span className="cond-branch-label">entonces</span>
        <FlowList model={model} nodes={node.thenBranch} address={[...address, 'thenBranch']} onChange={onChange} />
        <AddControls model={model} branchAddress={[...address, 'thenBranch']} onChange={onChange} />
      </div>
      <div className="cond-branch">
        <span className="cond-branch-label diagram-condition-tag-muted">si no</span>
        <FlowList model={model} nodes={node.otherwiseBranch} address={[...address, 'otherwiseBranch']} onChange={onChange} />
        <AddControls model={model} branchAddress={[...address, 'otherwiseBranch']} onChange={onChange} />
      </div>
    </div>
  );
}

function FlowList({
  model,
  nodes,
  address,
  onChange,
}: {
  model: DiagramModel;
  nodes: FlowNode[];
  address: Address;
  onChange: (m: DiagramModel) => void;
}) {
  const labelOf = (id: string) => model.components.find((c) => c.id === id)?.label ?? id;
  return (
    <div className="cond-flow-list">
      {nodes.map((n, i) => {
        const addr = [...address, i];
        if (n.kind === 'step') {
          return (
            <div key={i} className="cond-step-row">
              <span className="cond-step-from-to">
                {labelOf(n.from)} &#8594; {labelOf(n.to)}
              </span>
              <EditableText
                value={n.message}
                placeholder="mensaje..."
                className="cond-step-message"
                onCommit={(v) => onChange(editStepMessage(model, addr, v))}
              />
              <IconBtn
                icon={<Trash size={12} weight="bold" />}
                label="Borrar step"
                danger
                onClick={() => onChange(deleteNode(model, addr))}
              />
            </div>
          );
        }
        return <ConditionBlock key={i} model={model} node={n} address={addr} onChange={onChange} />;
      })}
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

function AddControls({
  model,
  branchAddress,
  onChange,
  conditionOnly,
}: {
  model: DiagramModel;
  branchAddress: Address;
  onChange: (m: DiagramModel) => void;
  conditionOnly?: boolean;
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
      {!conditionOnly && (
        <button type="button" className="diagram-add-btn" onClick={() => setMode('step')}>
          <Plus size={12} weight="bold" /> paso
        </button>
      )}
      <button type="button" className="diagram-add-btn" onClick={() => setMode('condition')}>
        <Plus size={12} weight="bold" /> condición
      </button>
    </div>
  );
}
