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
  gapAfter: number;
  xShift: number;
  xStretch: number;
  // Whether from/to already has an open activation bar at this row — lets the
  // renderer land the arrow on the bar's edge instead of the bare lifeline.
  sourceActive: boolean;
  targetActive: boolean;
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

export interface ActivationInfo {
  participantId: string;
  startY: number;
  endY: number;
}

export interface SequenceLayout {
  steps: FlatStep[];
  separators: FlatSeparator[];
  frames: FrameInfo[];
  activations: ActivationInfo[];
  bottomY: number;
}

// Flattens the whole (possibly nested) flow tree into a single ordered list of
// step/separator rows plus the Y-range each condition ("alt" fragment) spans,
// so the canvas can draw everything at its correct temporal position
// regardless of nesting depth. Y advances via a running cursor (not a fixed
// index*ROW_HEIGHT) so a step's optional `gapAfter` can stretch the rows
// below it without needing manual per-row math anywhere else.
export function computeSequenceLayout(model: DiagramModel): SequenceLayout {
  const steps: FlatStep[] = [];
  const separators: FlatSeparator[] = [];
  const frames: FrameInfo[] = [];
  const activations: ActivationInfo[] = [];
  // Simple stack-based activation tracking: a 'call' opens an activation on
  // the receiver, a matching 'return' from that same participant closes the
  // most recent one (LIFO). Anything left open closes at the diagram's end —
  // exactly the "simple version" fallback, not perfect nested-call accounting.
  const openActivations = new Map<string, number[]>();
  let cursorY = ROW_START;

  function walk(nodes: FlowNode[], address: Address): void {
    nodes.forEach((node, i) => {
      const addr = [...address, i];
      if (node.kind === 'step') {
        const y = cursorY;
        const style = node.style ?? 'call';
        const gapAfter = node.gapAfter ?? 0;
        const xShift = node.xShift ?? 0;
        const xStretch = node.xStretch ?? 0;

        let sourceActive = false;
        let targetActive = false;
        if (node.from !== node.to) {
          if (style === 'call') {
            sourceActive = (openActivations.get(node.from)?.length ?? 0) > 0;
            const stack = openActivations.get(node.to) ?? [];
            stack.push(y);
            openActivations.set(node.to, stack);
            targetActive = true; // just opened by this very call
          } else {
            const stack = openActivations.get(node.from);
            sourceActive = !!stack?.length; // closing an activation that was open
            const startY = stack?.pop();
            if (startY !== undefined) activations.push({ participantId: node.from, startY, endY: y });
            targetActive = (openActivations.get(node.to)?.length ?? 0) > 0;
          }
        }

        steps.push({
          address: addr,
          from: node.from,
          to: node.to,
          message: node.message,
          style,
          y,
          gapAfter,
          xShift,
          xStretch,
          sourceActive,
          targetActive,
        });
        cursorY += ROW_HEIGHT + gapAfter;
      } else if (node.kind === 'separator') {
        separators.push({ address: addr, label: node.label, y: cursorY });
        cursorY += ROW_HEIGHT;
      } else {
        const startY = cursorY - ROW_HEIGHT * 0.55;
        walkBranch(node.thenBranch, [...addr, 'thenBranch']);
        const dividerY = cursorY - ROW_HEIGHT * 0.55;
        walkBranch(node.otherwiseBranch, [...addr, 'otherwiseBranch']);
        const endY = cursorY - ROW_HEIGHT * 0.55;
        frames.push({ address: addr, label: node.label, startY, dividerY, endY });
      }
    });
  }

  function walkBranch(nodes: FlowNode[], address: Address): void {
    const before = cursorY;
    walk(nodes, address);
    if (cursorY === before) cursorY += ROW_HEIGHT; // reserve space for an empty branch
  }

  walk(model.flow, []);

  const bottomY = cursorY + 20;

  // Close whatever never got an explicit .return() — ends at the diagram bottom.
  for (const [participantId, stack] of openActivations) {
    for (const startY of stack) activations.push({ participantId, startY, endY: bottomY - 20 });
  }

  return { steps, separators, frames, activations, bottomY };
}
