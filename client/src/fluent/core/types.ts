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
}

export interface StepNode {
  kind: 'step';
  from: string;
  to: string;
  message: string;
}

export interface ConditionNode {
  kind: 'condition';
  label: string;
  thenBranch: FlowNode[];
  otherwiseBranch: FlowNode[];
}

export type FlowNode = StepNode | ConditionNode;

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
