import type { DiagramModel, FlowNode } from './core/types';
import type { Address } from './astOps';

export const ROW_START = 140;
export const ROW_HEIGHT = 60;

export interface FlatStep {
  address: Address;
  from: string;
  to: string;
  message: string;
  style: 'call' | 'return';
  y: number;
}

export interface FlatSeparator {
  address: Address;
  label: string;
  y: number;
}

export interface FrameInfo {
  address: Address;
  label: string;
  startY: number;
  dividerY: number;
  endY: number;
}

export interface SequenceLayout {
  steps: FlatStep[];
  separators: FlatSeparator[];
  frames: FrameInfo[];
  bottomY: number;
}

// Flattens the whole (possibly nested) flow tree into a single ordered list of
// step/separator rows plus the Y-range each condition ("alt" fragment) spans,
// so the canvas can draw everything at its correct temporal position
// regardless of nesting depth.
export function computeSequenceLayout(model: DiagramModel): SequenceLayout {
  const steps: FlatStep[] = [];
  const separators: FlatSeparator[] = [];
  const frames: FrameInfo[] = [];
  let rowIndex = 0;

  const rowY = (idx: number) => ROW_START + idx * ROW_HEIGHT;

  function walk(nodes: FlowNode[], address: Address): void {
    nodes.forEach((node, i) => {
      const addr = [...address, i];
      if (node.kind === 'step') {
        steps.push({
          address: addr,
          from: node.from,
          to: node.to,
          message: node.message,
          style: node.style ?? 'call',
          y: rowY(rowIndex),
        });
        rowIndex += 1;
      } else if (node.kind === 'separator') {
        separators.push({ address: addr, label: node.label, y: rowY(rowIndex) });
        rowIndex += 1;
      } else {
        const startY = rowY(rowIndex) - ROW_HEIGHT * 0.55;
        walkBranch(node.thenBranch, [...addr, 'thenBranch']);
        const dividerY = rowY(rowIndex) - ROW_HEIGHT * 0.55;
        walkBranch(node.otherwiseBranch, [...addr, 'otherwiseBranch']);
        const endY = rowY(rowIndex) - ROW_HEIGHT * 0.55;
        frames.push({ address: addr, label: node.label, startY, dividerY, endY });
      }
    });
  }

  function walkBranch(nodes: FlowNode[], address: Address): void {
    const before = rowIndex;
    walk(nodes, address);
    if (rowIndex === before) rowIndex += 1; // reserve space for an empty branch
  }

  walk(model.flow, []);

  return { steps, separators, frames, bottomY: rowY(Math.max(rowIndex, 1)) + 20 };
}
