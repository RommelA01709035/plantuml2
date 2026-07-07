import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  applyEdgeChanges,
  applyNodeChanges,
  useNodes,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type EdgeProps,
  type NodeProps,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowsOutLineVertical, ArrowsInLineVertical, CaretUp, CaretDown, Check, Plus, Trash, X } from '@phosphor-icons/react';
import type { DiagramModel } from './fluent/core/types';
import type { Address } from './fluent/astOps';
import { computeSequenceLayout } from './fluent/sequenceLayout';

// Sequence-diagram layout: participants sit in a fixed row (only X is
// draggable, like sliding a lifeline sideways). Steps are drawn at a Y
// determined by their ORDER, not by node position — that's what makes this
// read as a sequence diagram instead of a free-form graph.
const TOP_Y = 40;
const COL_GAP = 220;
// Must match .rf-participant's CSS width — the lifeline handle sits at the
// node's bottom-CENTER, so the anchor below needs the same half-width offset
// or the two X coordinates won't line up and the lifeline draws diagonally.
const PARTICIPANT_W = 140;
const SELF_LOOP_W = 50;
const SELF_LOOP_H = 30;

const anchorId = (participantId: string) => `${participantId}__anchor`;
const frameId = (addr: Address) => `frame-${addr.join('-')}`;
const separatorId = (addr: Address) => `sep-${addr.join('-')}`;

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

function IconBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" className={`icon-btn ${danger ? 'icon-btn-danger' : ''}`} onClick={onClick} title={label} aria-label={label}>
      {icon}
    </button>
  );
}

function useParticipantXRange(padding = 50): [number, number] {
  const allNodes = useNodes();
  const xs = allNodes.filter((n) => n.type === 'participant').map((n) => n.position.x);
  if (xs.length === 0) return [0, 300];
  const PARTICIPANT_BOX_W = 130;
  return [Math.min(...xs) - padding, Math.max(...xs) + PARTICIPANT_BOX_W + padding];
}

interface ParticipantNodeData {
  label: string;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

function ParticipantNode({ id, data }: NodeProps<ParticipantNodeData>) {
  return (
    <div className="rf-participant">
      <Handle type="target" position={Position.Left} className="rf-handle" />
      <EditableText value={data.label} className="rf-participant-text" onCommit={(v) => data.onRename(id, v)} />
      <IconBtn icon={<Trash size={12} weight="bold" />} label="Borrar participante" danger onClick={() => data.onDelete(id)} />
      <Handle type="source" position={Position.Right} className="rf-handle" />
      {/* Dedicated handle for the lifeline edge, centered — the left/right
          handles above are for connect-to-create-step and sit off-center,
          which would draw the lifeline diagonally instead of straight down. */}
      <Handle type="source" position={Position.Bottom} id="lifeline" className="rf-handle-hidden" />
    </div>
  );
}

function AnchorNode() {
  return (
    <div className="rf-anchor">
      <Handle type="target" position={Position.Top} id="lifeline" className="rf-handle-hidden" />
    </div>
  );
}

interface ActivationNodeData {
  height: number;
}

function ActivationNode({ data }: NodeProps<ActivationNodeData>) {
  return <div className="rf-activation" style={{ height: data.height }} />;
}

interface FrameNodeData {
  label: string;
  dividerOffset: number;
  height: number;
  address: Address;
  onEditLabel: (address: Address, label: string) => void;
  onDelete: (address: Address) => void;
  onAddStep: (branchAddress: Address, from: string, to: string, message: string) => void;
  onAddCondition: (branchAddress: Address, label: string) => void;
  components: DiagramModel['components'];
}

function FrameNode({ data }: NodeProps<FrameNodeData>) {
  const [minX, maxX] = useParticipantXRange();

  return (
    <div className="rf-frame" style={{ transform: `translateX(${minX}px)`, width: maxX - minX, height: data.height }}>
      <div className="rf-frame-tab">
        <span className="rf-frame-tab-kind">alt</span>
        <EditableText value={data.label} className="rf-frame-label" onCommit={(v) => data.onEditLabel(data.address, v)} />
        <IconBtn icon={<Trash size={12} weight="bold" />} label="Borrar condición" danger onClick={() => data.onDelete(data.address)} />
      </div>
      <div className="rf-frame-divider" style={{ top: data.dividerOffset }}>
        <span className="rf-frame-else-tag">si no</span>
      </div>
      <div className="rf-frame-controls" style={{ top: data.dividerOffset - 26 }}>
        <FrameAddControls
          components={data.components}
          branchAddress={[...data.address, 'thenBranch']}
          onAddStep={data.onAddStep}
          onAddCondition={data.onAddCondition}
        />
      </div>
      <div className="rf-frame-controls" style={{ top: data.height - 26 }}>
        <FrameAddControls
          components={data.components}
          branchAddress={[...data.address, 'otherwiseBranch']}
          onAddStep={data.onAddStep}
          onAddCondition={data.onAddCondition}
        />
      </div>
    </div>
  );
}

interface SeparatorNodeData {
  label: string;
  address: Address;
  onEditLabel: (address: Address, label: string) => void;
  onDelete: (address: Address) => void;
}

function SeparatorNode({ data }: NodeProps<SeparatorNodeData>) {
  const [minX, maxX] = useParticipantXRange();

  return (
    <div className="rf-separator" style={{ transform: `translateX(${minX}px)`, width: maxX - minX }}>
      <span className="rf-separator-line" />
      <span className="rf-separator-label-wrap">
        <EditableText value={data.label} className="rf-separator-label" onCommit={(v) => data.onEditLabel(data.address, v)} />
        <IconBtn icon={<Trash size={11} weight="bold" />} label="Borrar separador" danger onClick={() => data.onDelete(data.address)} />
      </span>
    </div>
  );
}

function FrameAddControls({
  components,
  branchAddress,
  onAddStep,
  onAddCondition,
}: {
  components: DiagramModel['components'];
  branchAddress: Address;
  onAddStep: (branchAddress: Address, from: string, to: string, message: string) => void;
  onAddCondition: (branchAddress: Address, label: string) => void;
}) {
  const [mode, setMode] = useState<'idle' | 'step' | 'condition'>('idle');
  const [from, setFrom] = useState(components[0]?.id ?? '');
  const [to, setTo] = useState(components[1]?.id ?? components[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [label, setLabel] = useState('');

  if (components.length === 0) return null;

  function reset() {
    setMode('idle');
    setMessage('');
    setLabel('');
  }

  function commit() {
    if (mode === 'step') onAddStep(branchAddress, from || components[0].id, to || components[0].id, message.trim() || 'paso');
    else if (mode === 'condition') onAddCondition(branchAddress, label.trim() || 'condición');
    reset();
  }

  if (mode === 'step') {
    return (
      <div className="diagram-add-form">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="diagram-select">
          {components.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="diagram-add-arrow">&#8594;</span>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="diagram-select">
          {components.map((c) => (
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
        <Plus size={11} weight="bold" /> paso
      </button>
      <button type="button" className="diagram-add-btn" onClick={() => setMode('condition')}>
        <Plus size={11} weight="bold" /> condición
      </button>
    </div>
  );
}

interface StepEdgeData {
  label: string;
  rowY: number;
  style: 'call' | 'return';
  selfCall: boolean;
  onEditMessage: (id: string, message: string) => void;
  onDelete: (id: string) => void;
  onMove: (direction: -1 | 1) => void;
  onAdjustGap: (delta: number) => void;
}

function StepEdge({ id, sourceX, targetX, markerEnd, data }: EdgeProps<StepEdgeData>) {
  const label = data?.label ?? '';
  const y = data?.rowY ?? 0;
  const isReturn = data?.style === 'return';
  const strokeDasharray = isReturn ? '6 4' : undefined;

  let path: string;
  let labelX: number;
  let labelY: number;

  if (data?.selfCall) {
    const x = sourceX;
    path = `M ${x} ${y} L ${x + SELF_LOOP_W} ${y} L ${x + SELF_LOOP_W} ${y + SELF_LOOP_H} L ${x} ${y + SELF_LOOP_H}`;
    labelX = x + SELF_LOOP_W / 2;
    labelY = y;
  } else {
    const x2 = sourceX === targetX ? targetX + 60 : targetX;
    path = `M ${sourceX} ${y} L ${x2} ${y}`;
    labelX = (sourceX + x2) / 2;
    labelY = y;
  }

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: 'var(--accent)', strokeWidth: 1.6, strokeDasharray }} />
      <EdgeLabelRenderer>
        <div className="rf-edge-label" style={{ transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY}px)` }}>
          <IconBtn icon={<CaretUp size={11} weight="bold" />} label="Mover arriba" onClick={() => data?.onMove(-1)} />
          <IconBtn icon={<CaretDown size={11} weight="bold" />} label="Mover abajo" onClick={() => data?.onMove(1)} />
          <EditableText value={label} placeholder="mensaje..." onCommit={(v) => data?.onEditMessage(id, v)} />
          <IconBtn icon={<ArrowsOutLineVertical size={11} weight="bold" />} label="Alargar" onClick={() => data?.onAdjustGap(20)} />
          <IconBtn icon={<ArrowsInLineVertical size={11} weight="bold" />} label="Acortar" onClick={() => data?.onAdjustGap(-20)} />
          <IconBtn icon={<Trash size={11} weight="bold" />} label="Borrar step" danger onClick={() => data?.onDelete(id)} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  participant: ParticipantNode,
  anchor: AnchorNode,
  frame: FrameNode,
  separator: SeparatorNode,
  activation: ActivationNode,
};
const edgeTypes = { step: StepEdge };

export type StepAddress = Address;

interface Props {
  model: DiagramModel;
  // Bump whenever the tree SHAPE changed (add/delete anywhere) so this canvas
  // rebuilds from the authoritative model. Pure edits (rename/move/message)
  // don't bump it and are applied optimistically in local state instead.
  resetSignal: number;
  onRename: (id: string, label: string) => void;
  onDeleteComponent: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onConnect: (source: string, target: string) => void;
  onEditStepMessage: (address: Address, message: string) => void;
  onDeleteStep: (address: Address) => void;
  onMoveStep: (address: Address, direction: -1 | 1) => void;
  onAdjustStepGap: (address: Address, gapAfter: number) => void;
  onEditConditionLabel: (address: Address, label: string) => void;
  onDeleteCondition: (address: Address) => void;
  onAddStep: (branchAddress: Address, from: string, to: string, message: string) => void;
  onAddCondition: (branchAddress: Address, label: string) => void;
  onEditSeparatorLabel: (address: Address, label: string) => void;
  onDeleteSeparator: (address: Address) => void;
}

export default function ParticipantGraph({
  model,
  resetSignal,
  onRename,
  onDeleteComponent,
  onMove,
  onConnect,
  onEditStepMessage,
  onDeleteStep,
  onMoveStep,
  onAdjustStepGap,
  onEditConditionLabel,
  onDeleteCondition,
  onAddStep,
  onAddCondition,
  onEditSeparatorLabel,
  onDeleteSeparator,
}: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge<StepEdgeData>[]>([]);

  const handleRename = useCallback(
    (id: string, label: string) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
      onRename(id, label);
    },
    [onRename],
  );

  const handleEditConditionLabel = useCallback(
    (address: Address, label: string) => {
      setNodes((nds) => nds.map((n) => (n.id === frameId(address) ? { ...n, data: { ...n.data, label } } : n)));
      onEditConditionLabel(address, label);
    },
    [onEditConditionLabel],
  );

  const handleEditSeparatorLabel = useCallback(
    (address: Address, label: string) => {
      setNodes((nds) => nds.map((n) => (n.id === separatorId(address) ? { ...n, data: { ...n.data, label } } : n)));
      onEditSeparatorLabel(address, label);
    },
    [onEditSeparatorLabel],
  );

  const handleEditStepMessage = useCallback(
    (edgeId: string, message: string, address: Address) => {
      setEdges((eds) => eds.map((e) => (e.id === edgeId ? { ...e, data: { ...e.data!, label: message } } : e)));
      onEditStepMessage(address, message);
    },
    [onEditStepMessage],
  );

  useEffect(() => {
    const layout = computeSequenceLayout(model);

    const nextNodes: Node[] = [];
    const participantX = new Map<string, number>();
    model.components.forEach((c, i) => {
      const x = c.x ?? i * COL_GAP + 40;
      participantX.set(c.id, x);
      nextNodes.push({
        id: c.id,
        type: 'participant',
        position: { x, y: TOP_Y },
        data: { label: c.label, onRename: handleRename, onDelete: onDeleteComponent },
      });
      nextNodes.push({
        id: anchorId(c.id),
        type: 'anchor',
        position: { x: x + PARTICIPANT_W / 2, y: layout.bottomY },
        data: {},
        draggable: false,
        selectable: false,
        focusable: false,
      });
    });

    layout.activations.forEach((a, i) => {
      const px = participantX.get(a.participantId);
      if (px === undefined) return;
      nextNodes.push({
        id: `activation-${a.participantId}-${i}`,
        type: 'activation',
        position: { x: px + PARTICIPANT_W / 2 - 5, y: a.startY },
        data: { height: a.endY - a.startY },
        draggable: false,
        selectable: false,
        focusable: false,
      });
    });

    layout.frames.forEach((f) => {
      nextNodes.unshift({
        id: frameId(f.address),
        type: 'frame',
        position: { x: 0, y: f.startY },
        data: {
          label: f.label,
          dividerOffset: f.dividerY - f.startY,
          height: f.endY - f.startY,
          address: f.address,
          onEditLabel: handleEditConditionLabel,
          onDelete: onDeleteCondition,
          onAddStep,
          onAddCondition,
          components: model.components,
        },
        draggable: false,
        selectable: false,
        focusable: false,
      });
    });

    layout.separators.forEach((s) => {
      nextNodes.push({
        id: separatorId(s.address),
        type: 'separator',
        position: { x: 0, y: s.y - 12 },
        data: { label: s.label, address: s.address, onEditLabel: handleEditSeparatorLabel, onDelete: onDeleteSeparator },
        draggable: false,
        selectable: false,
        focusable: false,
      });
    });

    setNodes(nextNodes);

    const lifelineEdges: Edge[] = model.components.map((c) => ({
      id: `lifeline-${c.id}`,
      source: c.id,
      sourceHandle: 'lifeline',
      target: anchorId(c.id),
      targetHandle: 'lifeline',
      type: 'straight',
      selectable: false,
      focusable: false,
      interactionWidth: 0,
      style: { stroke: 'var(--ink)', strokeWidth: 1.5, strokeDasharray: '4 4' },
    }));

    const stepEdges: Edge<StepEdgeData>[] = layout.steps.map((s) => ({
      id: `step-${s.address.join('-')}`,
      source: s.from,
      target: s.to,
      type: 'step',
      data: {
        label: s.message,
        rowY: s.y,
        style: s.style,
        selfCall: s.from === s.to,
        onEditMessage: (edgeId: string, msg: string) => handleEditStepMessage(edgeId, msg, s.address),
        onDelete: () => onDeleteStep(s.address),
        onMove: (direction: -1 | 1) => onMoveStep(s.address, direction),
        onAdjustGap: (delta: number) => onAdjustStepGap(s.address, s.gapAfter + delta),
      },
      markerEnd: { type: s.style === 'return' ? MarkerType.Arrow : MarkerType.ArrowClosed },
    }));

    setEdges([...lifelineEdges, ...stepEdges]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Participants only slide horizontally; their lifeline Y is locked at TOP_Y.
      const adjusted = changes.map((c) =>
        c.type === 'position' && c.position && !c.id.endsWith('__anchor')
          ? { ...c, position: { x: c.position.x, y: TOP_Y } }
          : c,
      );
      setNodes((nds) => {
        const next = applyNodeChanges(adjusted, nds);
        const byId = new Map(next.map((n) => [n.id, n]));
        // Keep each anchor's X glued to its participant's X so the lifeline follows drag.
        return next.map((n) => {
          if (n.type !== 'anchor') return n;
          const participantX = byId.get(n.id.replace(/__anchor$/, ''))?.position.x;
          const x = participantX !== undefined ? participantX + PARTICIPANT_W / 2 : n.position.x;
          return { ...n, position: { x, y: n.position.y } };
        });
      });
      for (const c of changes) {
        if (c.type === 'position' && c.dragging === false && c.position && !c.id.endsWith('__anchor')) {
          onMove(c.id, c.position.x, TOP_Y);
        }
      }
    },
    [onMove],
  );

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      onConnect(connection.source, connection.target);
    },
    [onConnect],
  );

  return (
    <div className="rf-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
