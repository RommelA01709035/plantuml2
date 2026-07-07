export type ComponentType =
  | 'actor'
  | 'app'
  | 'service'
  | 'db'
  | 'api'
  | 'queue'
  | 'storage'
  | 'unknown';

export interface ComponentDefinition {
  id: string;
  label: string;
  type: ComponentType;
  // UI-only; never encoded in generated fluent code (grammar has no coordinates).
  x?: number;
  y?: number;
}

export interface StepNode {
  kind: 'step';
  from: string;
  to: string;
  message: string;
  // 'call' (solid arrow) is the default; 'return' renders dashed, UML-style.
  style?: 'call' | 'return';
}

export interface ConditionNode {
  kind: 'condition';
  label: string;
  thenBranch: FlowNode[];
  otherwiseBranch: FlowNode[];
}

export interface SeparatorNode {
  kind: 'separator';
  label: string;
}

export type FlowNode = StepNode | ConditionNode | SeparatorNode;

export type ThemeName = 'modern' | 'clean' | 'warm' | 'dark' | 'compact';

export interface DiagramModel {
  type: 'sequence';
  name: string;
  theme: ThemeName;
  components: ComponentDefinition[];
  flow: FlowNode[];
}

export interface ValidationWarning {
  message: string;
}

export interface DrawResult {
  ast: DiagramModel;
  warnings: ValidationWarning[];
  svg?: string;
}
