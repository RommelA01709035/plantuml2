import type { DiagramModel, FlowNode } from './core/types';
import type { Address } from './astOps';

export const COL_WIDTH = 200;
export const ROW_HEIGHT = 56;
export const TOP_MARGIN = 56;
export const LEFT_MARGIN = 120;
export const BOX_W = 150;
export const BOX_H = 40;

export interface ParticipantLayout {
  id: string;
  label: string;
  x: number;
}

export type Row =
  | { type: 'step'; y: number; x1: number; x2: number; from: string; to: string; message: string; address: Address }
  | { type: 'condition-header'; y: number; label: string; address: Address }
  | { type: 'condition-divider'; y: number; address: Address }
  | { type: 'condition-end'; y: number; address: Address };

export interface LayoutResult {
  participants: ParticipantLayout[];
  rows: Row[];
  width: number;
  height: number;
}

export function computeLayout(model: DiagramModel): LayoutResult {
  const participants: ParticipantLayout[] = model.components.map((c, i) => ({
    id: c.id,
    label: c.label,
    x: LEFT_MARGIN + i * COL_WIDTH,
  }));
  const colX = new Map(participants.map((p) => [p.id, p.x]));

  const rows: Row[] = [];
  let y = TOP_MARGIN + BOX_H + 40;

  function walk(nodes: FlowNode[], address: Address): void {
    nodes.forEach((node, i) => {
      const addr = [...address, i];
      if (node.kind === 'step') {
        rows.push({
          type: 'step',
          y,
          x1: colX.get(node.from) ?? LEFT_MARGIN,
          x2: colX.get(node.to) ?? LEFT_MARGIN,
          from: node.from,
          to: node.to,
          message: node.message,
          address: addr,
        });
        y += ROW_HEIGHT;
      } else {
        rows.push({ type: 'condition-header', y, label: node.label, address: addr });
        y += ROW_HEIGHT * 0.65;
        walk(node.thenBranch, [...addr, 'thenBranch']);
        rows.push({ type: 'condition-divider', y, address: addr });
        y += ROW_HEIGHT * 0.65;
        walk(node.otherwiseBranch, [...addr, 'otherwiseBranch']);
        rows.push({ type: 'condition-end', y, address: addr });
        y += ROW_HEIGHT * 0.5;
      }
    });
  }

  walk(model.flow, []);

  const width = Math.max(LEFT_MARGIN * 2 + Math.max(participants.length - 1, 0) * COL_WIDTH + BOX_W, 480);
  const height = y + 30;

  return { participants, rows, width, height };
}
