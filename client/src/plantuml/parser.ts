export interface DiagramNode {
  id: string;
  name: string;
  members: string[];
  stereotype?: string;
  x?: number;
  y?: number;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  arrow: string;
  label?: string;
}

export interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

const CLASS_DECL = /^(class|interface|abstract\s+class|enum)\s+(\w+)\s*\{?$/i;
const ARROW_TOKENS = [
  '<\\|--', '--\\|>', '\\*--', '--\\*', 'o--', '--o',
  '\\.\\.\\|>', '<\\|\\.\\.', '\\.\\.>', '<\\.\\.', '-->', '<--', '--', '\\.\\.',
];
const RELATION = new RegExp(`^(\\w+)\\s*(${ARROW_TOKENS.join('|')})\\s*(\\w+)\\s*(?::\\s*(.*))?$`);

export function parsePlantUML(text: string): DiagramModel {
  const lines = text.split(/\r?\n/);
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const nodeMap = new Map<string, DiagramNode>();
  let currentClass: DiagramNode | null = null;
  let edgeCounter = 0;

  const ensureNode = (name: string): DiagramNode => {
    let n = nodeMap.get(name);
    if (!n) {
      n = { id: name, name, members: [] };
      nodeMap.set(name, n);
      nodes.push(n);
    }
    return n;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('@startuml') || line.startsWith('@enduml') || line.startsWith("'")) continue;

    if (currentClass) {
      if (line === '}') {
        currentClass = null;
      } else {
        currentClass.members.push(line);
      }
      continue;
    }

    const classMatch = line.match(CLASS_DECL);
    if (classMatch) {
      const kind = classMatch[1].toLowerCase().replace(/\s+/, ' ');
      const name = classMatch[2];
      const node = ensureNode(name);
      if (kind !== 'class') node.stereotype = kind === 'abstract class' ? 'abstract' : kind;
      if (line.endsWith('{')) currentClass = node;
      continue;
    }

    const relMatch = line.match(RELATION);
    if (relMatch) {
      const [, left, arrow, right, label] = relMatch;
      ensureNode(left);
      ensureNode(right);
      edges.push({ id: `e${edgeCounter++}`, source: left, target: right, arrow, label });
      continue;
    }
  }

  return { nodes, edges };
}
