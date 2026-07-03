import type { DiagramModel } from './parser';

export function generatePlantUML(model: DiagramModel): string {
  const lines: string[] = ['@startuml'];

  for (const node of model.nodes) {
    const kind = node.stereotype === 'interface' ? 'interface'
      : node.stereotype === 'abstract' ? 'abstract class'
      : node.stereotype === 'enum' ? 'enum'
      : 'class';

    if (node.members.length > 0) {
      lines.push(`${kind} ${node.name} {`);
      for (const member of node.members) lines.push(`  ${member}`);
      lines.push('}');
    } else {
      lines.push(`${kind} ${node.name}`);
    }
  }

  if (model.nodes.length && model.edges.length) lines.push('');

  for (const edge of model.edges) {
    const label = edge.label ? ` : ${edge.label}` : '';
    lines.push(`${edge.source} ${edge.arrow} ${edge.target}${label}`);
  }

  lines.push('@enduml');
  return lines.join('\n');
}
