import type { DiagramModel, FlowNode } from './core/types';

function escapeStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function emitFlow(nodes: FlowNode[], labelOf: (id: string) => string, depth: number): string[] {
  const indent = '  '.repeat(depth);
  const lines: string[] = [];

  for (const node of nodes) {
    if (node.kind === 'step') {
      const method = node.style === 'return' ? 'return' : 'step';
      lines.push(
        `${indent}.${method}("${escapeStr(labelOf(node.from))}", "${escapeStr(labelOf(node.to))}", "${escapeStr(node.message)}")`,
      );
    } else if (node.kind === 'separator') {
      lines.push(`${indent}.separator("${escapeStr(node.label)}")`);
    } else {
      lines.push(`${indent}.when("${escapeStr(node.label)}")`);
      lines.push(`${indent}  .then()`);
      lines.push(...emitFlow(node.thenBranch, labelOf, depth + 2));
      lines.push(`${indent}  .otherwise()`);
      lines.push(...emitFlow(node.otherwiseBranch, labelOf, depth + 2));
      lines.push(`${indent}.end()`);
    }
  }

  return lines;
}

export function generateFluentCode(model: DiagramModel): string {
  const labelOf = (id: string) => model.components.find((c) => c.id === id)?.label ?? id;
  const lines: string[] = [`Sequence("${escapeStr(model.name)}")`];

  if (model.components.length > 0) {
    lines.push('  .uses(');
    model.components.forEach((c, i) => {
      const comma = i < model.components.length - 1 ? ',' : '';
      lines.push(`    ${c.type}("${escapeStr(c.label)}")${comma}`);
    });
    lines.push('  )');
  }

  lines.push(...emitFlow(model.flow, labelOf, 1));
  lines.push(`  .theme("${model.theme}")`);
  lines.push('  .draw()');

  return lines.join('\n');
}
