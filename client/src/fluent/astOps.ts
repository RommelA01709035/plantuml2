import type { ComponentDefinition, ConditionNode, DiagramModel, FlowNode, SeparatorNode, StepNode } from './core/types';

// An Address locates a node inside the nested flow tree.
// [2] -> rootFlow[2]
// [2, 'thenBranch', 0] -> rootFlow[2].thenBranch[0]
// [2, 'thenBranch', 1, 'otherwiseBranch', 0] -> rootFlow[2].thenBranch[1].otherwiseBranch[0]
export type Address = (number | 'thenBranch' | 'otherwiseBranch')[];

function locate(root: FlowNode[], address: Address): { arr: FlowNode[]; idx: number } {
  let arr = root;
  let idx = address[0] as number;
  for (let i = 1; i < address.length; i += 2) {
    const branch = address[i] as 'thenBranch' | 'otherwiseBranch';
    const node = arr[idx] as ConditionNode;
    arr = node[branch];
    idx = address[i + 1] as number;
  }
  return { arr, idx };
}

export function getNode(root: FlowNode[], address: Address): FlowNode {
  const { arr, idx } = locate(root, address);
  return arr[idx];
}

function updateArrayAt(root: FlowNode[], address: Address, fn: (arr: FlowNode[]) => FlowNode[]): FlowNode[] {
  if (address.length <= 1) return fn(root);
  const idx = address[0] as number;
  const branch = address[1] as 'thenBranch' | 'otherwiseBranch';
  const rest = address.slice(2);
  return root.map((n, i) => {
    if (i !== idx || n.kind !== 'condition') return n;
    return { ...n, [branch]: updateArrayAt(n[branch], rest, fn) };
  });
}

export function updateNodeAt(root: FlowNode[], address: Address, updater: (node: FlowNode) => FlowNode): FlowNode[] {
  const idx = address[address.length - 1] as number;
  const parentAddress = address.slice(0, -1);
  return updateArrayAt(root, [...parentAddress, 0], (arr) => arr.map((n, i) => (i === idx ? updater(n) : n)));
}

export function deleteNodeAt(root: FlowNode[], address: Address): FlowNode[] {
  const idx = address[address.length - 1] as number;
  const parentAddress = address.slice(0, -1);
  return updateArrayAt(root, [...parentAddress, 0], (arr) => arr.filter((_, i) => i !== idx));
}

// Appends a node to the array reached by `branchAddress` (an address whose
// last two tokens are the branch selector, or [] for the root flow).
export function appendNodeAt(root: FlowNode[], branchAddress: Address, node: FlowNode): FlowNode[] {
  return updateArrayAt(root, [...branchAddress, 0], (arr) => [...arr, node]);
}

let uidCounter = 1;
export function nextId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${uidCounter++}`;
}

export function renameComponent(model: DiagramModel, id: string, newLabel: string): DiagramModel {
  return {
    ...model,
    components: model.components.map((c) => (c.id === id ? { ...c, label: newLabel } : c)),
  };
}

export function addComponent(model: DiagramModel, component: ComponentDefinition): DiagramModel {
  return { ...model, components: [...model.components, component] };
}

export function moveComponent(model: DiagramModel, id: string, x: number, y: number): DiagramModel {
  return {
    ...model,
    components: model.components.map((c) => (c.id === id ? { ...c, x, y } : c)),
  };
}

export function editStepMessage(model: DiagramModel, address: Address, message: string): DiagramModel {
  return {
    ...model,
    flow: updateNodeAt(model.flow, address, (n) => (n.kind === 'step' ? { ...n, message } : n)),
  };
}

export function editConditionLabel(model: DiagramModel, address: Address, label: string): DiagramModel {
  return {
    ...model,
    flow: updateNodeAt(model.flow, address, (n) => (n.kind === 'condition' ? { ...n, label } : n)),
  };
}

export function deleteNode(model: DiagramModel, address: Address): DiagramModel {
  return { ...model, flow: deleteNodeAt(model.flow, address) };
}

// Swaps a node with its previous (-1) or next (+1) sibling in the same
// array — lets the user reorder a step/condition in time.
export function moveNode(model: DiagramModel, address: Address, direction: -1 | 1): DiagramModel {
  const idx = address[address.length - 1] as number;
  const parentAddress = address.slice(0, -1);
  return {
    ...model,
    flow: updateArrayAt(model.flow, [...parentAddress, 0], (arr) => {
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      const copy = [...arr];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    }),
  };
}

export function setStepGap(model: DiagramModel, address: Address, gapAfter: number): DiagramModel {
  return {
    ...model,
    flow: updateNodeAt(model.flow, address, (n) => (n.kind === 'step' ? { ...n, gapAfter: Math.max(0, gapAfter) } : n)),
  };
}

export function setStepXShift(model: DiagramModel, address: Address, xShift: number): DiagramModel {
  return {
    ...model,
    flow: updateNodeAt(model.flow, address, (n) => (n.kind === 'step' ? { ...n, xShift } : n)),
  };
}

export function setStepXStretch(model: DiagramModel, address: Address, xStretch: number): DiagramModel {
  return {
    ...model,
    flow: updateNodeAt(model.flow, address, (n) => (n.kind === 'step' ? { ...n, xStretch: Math.max(0, xStretch) } : n)),
  };
}

export function addStep(
  model: DiagramModel,
  branchAddress: Address,
  from: string,
  to: string,
  message: string,
  style: 'call' | 'return' = 'call',
): DiagramModel {
  const step: StepNode = { kind: 'step', from, to, message, style };
  return { ...model, flow: appendNodeAt(model.flow, branchAddress, step) };
}

export function addCondition(model: DiagramModel, branchAddress: Address, label: string): DiagramModel {
  const condition: ConditionNode = { kind: 'condition', label, thenBranch: [], otherwiseBranch: [] };
  return { ...model, flow: appendNodeAt(model.flow, branchAddress, condition) };
}

export function addSeparator(model: DiagramModel, branchAddress: Address, label: string): DiagramModel {
  const node: SeparatorNode = { kind: 'separator', label };
  return { ...model, flow: appendNodeAt(model.flow, branchAddress, node) };
}

export function editSeparatorLabel(model: DiagramModel, address: Address, label: string): DiagramModel {
  return {
    ...model,
    flow: updateNodeAt(model.flow, address, (n) => (n.kind === 'separator' ? { ...n, label } : n)),
  };
}

function filterFlowByComponent(nodes: FlowNode[], removedId: string): FlowNode[] {
  return nodes
    .filter((n) => !(n.kind === 'step' && (n.from === removedId || n.to === removedId)))
    .map((n) =>
      n.kind === 'condition'
        ? {
            ...n,
            thenBranch: filterFlowByComponent(n.thenBranch, removedId),
            otherwiseBranch: filterFlowByComponent(n.otherwiseBranch, removedId),
          }
        : n,
    );
}

// Removes a participant and any step (anywhere in the tree) that referenced it,
// so the diagram never keeps a dangling from/to id.
export function deleteComponent(model: DiagramModel, id: string): DiagramModel {
  return {
    ...model,
    components: model.components.filter((c) => c.id !== id),
    flow: filterFlowByComponent(model.flow, id),
  };
}
