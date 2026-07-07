import type { DiagramModel, FlowNode, StepNode, ThemeName } from '../core/types.js';

const COL_WIDTH = 180;
const ROW_HEIGHT = 55;
const TOP_MARGIN = 40;
const LEFT_MARGIN = 100;
const BOX_W = 140;
const BOX_H = 36;

interface ThemePalette {
  bg: string;
  box: string;
  text: string;
  line: string;
  accent: string;
}

function themeColors(theme: ThemeName): ThemePalette {
  switch (theme) {
    case 'dark':
      return { bg: '#1e1e1e', box: '#333333', text: '#eeeeee', line: '#888888', accent: '#7aa2f7' };
    case 'warm':
      return { bg: '#fff8f0', box: '#ffe8cc', text: '#3a2a1a', line: '#c98a4b', accent: '#d97706' };
    case 'compact':
      return { bg: '#ffffff', box: '#eeeeee', text: '#111111', line: '#999999', accent: '#555555' };
    case 'clean':
      return { bg: '#ffffff', box: '#f5f5f5', text: '#111111', line: '#cccccc', accent: '#2563eb' };
    default:
      return { bg: '#fafafa', box: '#e8edff', text: '#1a1a2e', line: '#9aa5b1', accent: '#4f46e5' };
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function measureRows(nodes: FlowNode[]): number {
  let rows = 0;
  for (const n of nodes) {
    if (n.kind === 'step' || n.kind === 'separator') {
      rows += 1;
    } else {
      rows += 1 + measureRows(n.thenBranch) + 1 + measureRows(n.otherwiseBranch);
    }
  }
  return rows;
}

export function renderSvg(model: DiagramModel): string {
  const colors = themeColors(model.theme);
  const colX = new Map<string, number>();
  model.components.forEach((c, i) => colX.set(c.id, LEFT_MARGIN + i * COL_WIDTH));

  const totalRows = measureRows(model.flow);
  const width = Math.max(LEFT_MARGIN * 2 + Math.max(model.components.length - 1, 0) * COL_WIDTH + BOX_W, 420);
  const height = TOP_MARGIN + BOX_H + 40 + totalRows * ROW_HEIGHT + 30;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="sans-serif">`,
  );
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="${colors.bg}" />`);
  parts.push(
    `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="${colors.accent}" /></marker></defs>`,
  );
  parts.push(
    `<text x="${LEFT_MARGIN}" y="20" fill="${colors.text}" font-size="14" font-weight="bold">${esc(model.name)}</text>`,
  );

  for (const c of model.components) {
    const x = colX.get(c.id)!;
    parts.push(
      `<rect x="${x - BOX_W / 2}" y="${TOP_MARGIN}" width="${BOX_W}" height="${BOX_H}" rx="6" fill="${colors.box}" stroke="${colors.accent}" />`,
    );
    parts.push(
      `<text x="${x}" y="${TOP_MARGIN + BOX_H / 2 + 5}" text-anchor="middle" fill="${colors.text}" font-size="13">${esc(c.label)}</text>`,
    );
    parts.push(
      `<line x1="${x}" y1="${TOP_MARGIN + BOX_H}" x2="${x}" y2="${height - 15}" stroke="${colors.line}" stroke-dasharray="4,3" />`,
    );
  }

  let cursorY = TOP_MARGIN + BOX_H + 40;

  function drawStep(node: StepNode): void {
    const x1 = colX.get(node.from) ?? LEFT_MARGIN;
    const x2 = colX.get(node.to) ?? LEFT_MARGIN;
    const y = cursorY;
    const dash = node.style === 'return' ? ' stroke-dasharray="5,4"' : '';
    parts.push(
      `<text x="${(x1 + x2) / 2}" y="${y - 8}" text-anchor="middle" fill="${colors.text}" font-size="12">${esc(node.message)}</text>`,
    );
    parts.push(
      `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${colors.accent}" stroke-width="1.5"${dash} marker-end="url(#arrow)" />`,
    );
    cursorY += ROW_HEIGHT;
  }

  function drawFlow(nodes: FlowNode[]): void {
    for (const node of nodes) {
      if (node.kind === 'step') {
        drawStep(node);
      } else if (node.kind === 'separator') {
        parts.push(
          `<line x1="${LEFT_MARGIN - 60}" y1="${cursorY}" x2="${width - 20}" y2="${cursorY}" stroke="${colors.line}" stroke-width="1" />`,
        );
        parts.push(
          `<text x="${width / 2}" y="${cursorY - 6}" text-anchor="middle" fill="${colors.text}" font-size="11" font-weight="bold">${esc(node.label)}</text>`,
        );
        cursorY += ROW_HEIGHT;
      } else {
        parts.push(
          `<text x="${LEFT_MARGIN - 80}" y="${cursorY - 20}" fill="${colors.accent}" font-size="12" font-weight="bold">alt: ${esc(node.label)}</text>`,
        );
        cursorY += ROW_HEIGHT * 0.5;
        drawFlow(node.thenBranch);
        parts.push(
          `<text x="${LEFT_MARGIN - 80}" y="${cursorY - 20}" fill="${colors.accent}" font-size="12" font-style="italic">otherwise</text>`,
        );
        cursorY += ROW_HEIGHT * 0.5;
        drawFlow(node.otherwiseBranch);
      }
    }
  }

  drawFlow(model.flow);
  parts.push('</svg>');
  return parts.join('\n');
}
