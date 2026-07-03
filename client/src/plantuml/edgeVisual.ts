import { MarkerType } from 'reactflow';

export interface EdgeVisual {
  markerStart?: MarkerType;
  markerEnd?: MarkerType;
  dashed: boolean;
}

const CLOSED = new Set(['<|--', '--|>', '..|>', '<|..']);
const OPEN_ARROW = new Set(['-->', '<--', '..>', '<..']);
const DIAMOND = new Set(['*--', '--*', 'o--', '--o']);

export function getEdgeVisual(arrow: string): EdgeVisual {
  const dashed = arrow.includes('..');

  const markerType = CLOSED.has(arrow) ? MarkerType.ArrowClosed
    : OPEN_ARROW.has(arrow) ? MarkerType.Arrow
    : DIAMOND.has(arrow) ? MarkerType.ArrowClosed
    : undefined;

  if (!markerType) return { dashed };

  const atLeft = arrow.startsWith('<') || arrow.startsWith('*') || arrow.startsWith('o');
  return atLeft ? { markerStart: markerType, dashed } : { markerEnd: markerType, dashed };
}
