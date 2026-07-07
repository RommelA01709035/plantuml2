import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type EdgeProps,
  type NodeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Trash } from '@phosphor-icons/react';
import type { DiagramModel } from './fluent/core/types';

interface ParticipantNodeData {
  label: string;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

function ParticipantNode({ id, data }: NodeProps<ParticipantNodeData>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label);

  useEffect(() => {
    if (!editing) setDraft(data.label);
  }, [data.label, editing]);

  return (
    <div className="rf-participant">
      <Handle type="target" position={Position.Left} className="rf-handle" />
      {editing ? (
        <input
          autoFocus
          className="inline-edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            setEditing(false);
            const trimmed = draft.trim();
            if (trimmed && trimmed !== data.label) data.onRename(id, trimmed);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setDraft(data.label);
              setEditing(false);
            }
          }}
        />
      ) : (
        <button type="button" className="inline-text rf-participant-text" onDoubleClick={() => setEditing(true)}>
          {data.label}
        </button>
      )}
      <button
        type="button"
        className="icon-btn icon-btn-danger rf-participant-delete"
        title="Borrar participante"
        onClick={() => data.onDelete(id)}
      >
        <Trash size={12} weight="bold" />
      </button>
      <Handle type="source" position={Position.Right} className="rf-handle" />
    </div>
  );
}

interface StepEdgeData {
  label: string;
  onEditMessage: (id: string, message: string) => void;
  onDelete: (id: string) => void;
}

function StepEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, data }: EdgeProps<StepEdgeData>) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const label = data?.label ?? '';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);

  useEffect(() => {
    if (!editing) setDraft(label);
  }, [label, editing]);

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ stroke: 'var(--accent)', strokeWidth: 1.6 }} />
      <EdgeLabelRenderer>
        <div className="rf-edge-label" style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
          {editing ? (
            <input
              autoFocus
              className="inline-edit"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                setEditing(false);
                const trimmed = draft.trim();
                if (trimmed && trimmed !== label) data?.onEditMessage(id, trimmed);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  setDraft(label);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <button type="button" className="inline-text" onDoubleClick={() => setEditing(true)}>
              {label || <span className="inline-text-placeholder">mensaje...</span>}
            </button>
          )}
          <button type="button" className="icon-btn icon-btn-danger" title="Borrar step" onClick={() => data?.onDelete(id)}>
            <Trash size={11} weight="bold" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { participant: ParticipantNode };
const edgeTypes = { step: StepEdge };

export type StepAddress = (number | 'thenBranch' | 'otherwiseBranch')[];

export interface RootStep {
  address: StepAddress;
  from: string;
  to: string;
  message: string;
}

interface Props {
  model: DiagramModel;
  rootSteps: RootStep[];
  // Bump whenever the tree SHAPE changed (add/delete anywhere) so this canvas
  // rebuilds from the authoritative model. Pure edits (rename/move/message)
  // don't bump it and are applied optimistically in local state instead.
  resetSignal: number;
  onRename: (id: string, label: string) => void;
  onDeleteComponent: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onConnect: (source: string, target: string) => void;
  onEditStepMessage: (address: StepAddress, message: string) => void;
  onDeleteStep: (address: StepAddress) => void;
}

function buildNodes(
  model: DiagramModel,
  onRename: ParticipantNodeData['onRename'],
  onDelete: ParticipantNodeData['onDelete'],
): Node<ParticipantNodeData>[] {
  const cols = 3;
  return model.components.map((c, i) => ({
    id: c.id,
    type: 'participant',
    position: { x: c.x ?? (i % cols) * 220 + 40, y: c.y ?? Math.floor(i / cols) * 120 + 40 },
    data: { label: c.label, onRename, onDelete },
  }));
}

export default function ParticipantGraph({
  model,
  rootSteps,
  resetSignal,
  onRename,
  onDeleteComponent,
  onMove,
  onConnect,
  onEditStepMessage,
  onDeleteStep,
}: Props) {
  const [nodes, setNodes] = useState<Node<ParticipantNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge<StepEdgeData>[]>([]);
  const addressByEdgeId = useRef(new Map<string, StepAddress>());

  const handleRename = useCallback(
    (id: string, label: string) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
      onRename(id, label);
    },
    [onRename],
  );

  const handleEditStepMessage = useCallback(
    (edgeId: string, message: string) => {
      setEdges((eds) => eds.map((e) => (e.id === edgeId ? { ...e, data: { ...e.data!, label: message } } : e)));
      const addr = addressByEdgeId.current.get(edgeId);
      if (addr) onEditStepMessage(addr, message);
    },
    [onEditStepMessage],
  );

  useEffect(() => {
    setNodes(buildNodes(model, handleRename, onDeleteComponent));
    const stepEdges: Edge<StepEdgeData>[] = rootSteps.map((s, i) => ({
      id: `step-${i}`,
      source: s.from,
      target: s.to,
      type: 'step',
      data: { label: s.message, onEditMessage: handleEditStepMessage, onDelete: onDeleteStepEdge },
      markerEnd: { type: MarkerType.ArrowClosed },
    }));
    addressByEdgeId.current = new Map(stepEdges.map((e, i) => [e.id, rootSteps[i].address]));
    setEdges(stepEdges);

    function onDeleteStepEdge(edgeId: string) {
      const addr = addressByEdgeId.current.get(edgeId);
      if (addr) onDeleteStep(addr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      for (const c of changes) {
        if (c.type === 'position' && c.dragging === false && c.position) {
          onMove(c.id, c.position.x, c.position.y);
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
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
