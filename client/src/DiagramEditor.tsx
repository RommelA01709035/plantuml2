import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ClassNode, { type ClassNodeData } from './ClassNode';
import type { DiagramModel } from './plantuml/parser';
import { getEdgeVisual } from './plantuml/edgeVisual';

const nodeTypes = { classNode: ClassNode };

let counter = 1;
const nextId = (prefix: string) => `${prefix}${Date.now().toString(36)}${counter++}`;

type FlowNodeData = Omit<ClassNodeData, keyof CallbackBundle> & Partial<CallbackBundle>;
interface CallbackBundle {
  onRename: (id: string) => void;
  onAddMember: (id: string) => void;
  onEditMember: (id: string, idx: number) => void;
  onDeleteMember: (id: string, idx: number) => void;
  onDeleteNode: (id: string) => void;
}

function layoutModelNodes(model: DiagramModel, callbacks: CallbackBundle): Node<ClassNodeData>[] {
  const cols = 3;
  const spacingX = 260;
  const spacingY = 200;
  return model.nodes.map((n, i) => ({
    id: n.id,
    type: 'classNode',
    position: {
      x: n.x ?? (i % cols) * spacingX + 60,
      y: n.y ?? Math.floor(i / cols) * spacingY + 60,
    },
    data: { name: n.name, members: n.members, stereotype: n.stereotype, ...callbacks },
  }));
}

function layoutModelEdges(model: DiagramModel): Edge[] {
  return model.edges.map((e) => {
    const v = getEdgeVisual(e.arrow);
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      data: { arrow: e.arrow },
      style: v.dashed ? { strokeDasharray: '5,5' } : undefined,
      markerStart: v.markerStart ? { type: v.markerStart } : undefined,
      markerEnd: v.markerEnd ? { type: v.markerEnd } : undefined,
    };
  });
}

interface Props {
  model: DiagramModel;
  resetToken: number;
  onChange?: (model: DiagramModel) => void;
  onActivity?: () => void;
}

function DiagramEditor({ model, resetToken, onChange, onActivity }: Props) {
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const userEditRef = useRef(false);

  const onRename = useCallback((id: string) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      const name = window.prompt('Class name:', n.data.name);
      if (!name) return n;
      userEditRef.current = true;
      return { ...n, data: { ...n.data, name } };
    }));
  }, []);

  const onAddMember = useCallback((id: string) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      const member = window.prompt('New member (e.g. "+int x" or "+doSomething()")', '');
      if (!member) return n;
      userEditRef.current = true;
      return { ...n, data: { ...n.data, members: [...n.data.members, member] } };
    }));
  }, []);

  const onEditMember = useCallback((id: string, idx: number) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      const value = window.prompt('Edit member:', n.data.members[idx]);
      if (value === null) return n;
      const members = [...n.data.members];
      members[idx] = value;
      userEditRef.current = true;
      return { ...n, data: { ...n.data, members } };
    }));
  }, []);

  const onDeleteMember = useCallback((id: string, idx: number) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      userEditRef.current = true;
      return { ...n, data: { ...n.data, members: n.data.members.filter((_, i) => i !== idx) } };
    }));
  }, []);

  const onDeleteNode = useCallback((id: string) => {
    userEditRef.current = true;
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const callbacks: CallbackBundle = { onRename, onAddMember, onEditMember, onDeleteMember, onDeleteNode };

  const skipNextEmit = useRef(true);
  const emitTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setNodes(layoutModelNodes(model, callbacks));
    setEdges(layoutModelEdges(model));
    skipNextEmit.current = true;
    userEditRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  useEffect(() => {
    if (skipNextEmit.current) {
      skipNextEmit.current = false;
      return;
    }
    // ReactFlow fires nodes/edges updates internally too (dimension measuring,
    // selection, etc). Only sync upward on changes a user actually made.
    if (!userEditRef.current) return;
    userEditRef.current = false;
    onActivity?.();
    clearTimeout(emitTimer.current);
    emitTimer.current = setTimeout(() => {
      onChange?.({
        nodes: nodes.map((n) => ({
          id: n.id,
          name: n.data.name,
          members: n.data.members,
          stereotype: n.data.stereotype,
          x: n.position.x,
          y: n.position.y,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          arrow: (e.data?.arrow as string) ?? '-->',
          label: typeof e.label === 'string' ? e.label : undefined,
        })),
      });
    }, 250);
    return () => clearTimeout(emitTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as Node<FlowNodeData>[]);
    const meaningful = changes.some(
      (c) => c.type === 'remove' || (c.type === 'position' && c.dragging === false),
    );
    if (meaningful) userEditRef.current = true;
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
    if (changes.some((c) => c.type === 'remove')) userEditRef.current = true;
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    userEditRef.current = true;
    setEdges((eds) => addEdge(
      { ...connection, id: nextId('e'), data: { arrow: '-->' }, markerEnd: { type: MarkerType.Arrow } },
      eds,
    ));
  }, []);

  const onEdgeDoubleClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const currentArrow = (edge.data?.arrow as string) ?? '-->';
    const currentLabel = typeof edge.label === 'string' ? edge.label : '';
    const input = window.prompt(
      'Edit relation as: <arrow> [label]\nExamples: --> uses   |   <|--   |   *-- part   |   ..> depends   |   ..|> implements',
      `${currentArrow}${currentLabel ? ' ' + currentLabel : ''}`,
    );
    if (!input) return;
    const parts = input.trim().split(/\s+/);
    const arrow = parts[0];
    const label = parts.slice(1).join(' ') || undefined;
    const v = getEdgeVisual(arrow);
    userEditRef.current = true;
    setEdges((eds) => eds.map((e) => (e.id !== edge.id ? e : {
      ...e,
      label,
      data: { arrow },
      style: v.dashed ? { strokeDasharray: '5,5' } : undefined,
      markerStart: v.markerStart ? { type: v.markerStart } : undefined,
      markerEnd: v.markerEnd ? { type: v.markerEnd } : undefined,
    })));
  }, []);

  const addClass = useCallback(() => {
    const name = window.prompt('New class name:', 'NewClass');
    if (!name) return;
    const id = nextId('n');
    userEditRef.current = true;
    setNodes((nds) => [...nds, {
      id,
      type: 'classNode',
      position: { x: 80 + (nds.length % 3) * 260, y: 80 + Math.floor(nds.length / 3) * 200 },
      data: { name, members: [], onRename, onAddMember, onEditMember, onDeleteMember, onDeleteNode },
    }]);
  }, [onRename, onAddMember, onEditMember, onDeleteMember, onDeleteNode]);

  return (
    <div className="diagram-editor">
      <div className="pane-toolbar">
        <button onClick={addClass}>+ Class</button>
        <span className="diagram-hint">
          Drag from a node edge to connect · double-click title/member to edit · double-click an edge to change relation/label · select + Delete to remove
        </span>
      </div>
      <div className="diagram-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodeTypes={nodeTypes}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  );
}

export default DiagramEditor;
