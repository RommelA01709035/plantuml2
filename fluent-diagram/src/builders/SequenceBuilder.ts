import type {
  ComponentDefinition,
  ConditionNode,
  DiagramModel,
  DrawResult,
  FlowNode,
  StepNode,
  ThemeName,
} from '../core/types.js';
import { slugify } from '../core/normalize.js';
import { inferType } from '../components/componentHelpers.js';
import { validate, type ConditionMeta } from '../core/validator.js';
import { renderSvg } from '../renderers/svgRenderer.js';

type Ref = string | ComponentDefinition;

interface Frame {
  node: ConditionNode;
  activeBranch: 'then' | 'otherwise' | null;
}

export class SequenceBuilder {
  private readonly name: string;
  private themeName: ThemeName = 'modern';
  private readonly componentsById = new Map<string, ComponentDefinition>();
  private readonly declaredRaw: ComponentDefinition[] = [];
  private explicitUses = false;
  private readonly unresolvedRefs: string[] = [];
  private readonly rootFlow: FlowNode[] = [];
  private readonly stack: Frame[] = [];
  private readonly conditionMeta = new Map<ConditionNode, ConditionMeta>();

  constructor(name: string) {
    this.name = name;
  }

  uses(...components: ComponentDefinition[]): this {
    this.explicitUses = true;
    for (const c of components) {
      this.declaredRaw.push(c);
      if (!this.componentsById.has(c.id)) this.componentsById.set(c.id, c);
    }
    return this;
  }

  private resolveRef(ref: Ref): string {
    if (typeof ref !== 'string') {
      if (!this.componentsById.has(ref.id)) this.componentsById.set(ref.id, ref);
      this.declaredRaw.push(ref);
      return ref.id;
    }

    const slug = slugify(ref);
    const existing =
      this.componentsById.get(slug) ??
      [...this.componentsById.values()].find((c) => c.label.toLowerCase() === ref.toLowerCase());
    if (existing) return existing.id;

    if (this.explicitUses) {
      this.unresolvedRefs.push(ref);
      return slug;
    }

    const comp: ComponentDefinition = { id: slug, label: ref, type: inferType(ref) };
    this.componentsById.set(comp.id, comp);
    this.declaredRaw.push(comp);
    return comp.id;
  }

  private currentArray(): FlowNode[] {
    if (this.stack.length === 0) return this.rootFlow;
    const top = this.stack[this.stack.length - 1];
    return top.activeBranch === 'otherwise' ? top.node.otherwiseBranch : top.node.thenBranch;
  }

  step(from: Ref, to: Ref, message: string): this {
    const node: StepNode = {
      kind: 'step',
      from: this.resolveRef(from),
      to: this.resolveRef(to),
      message,
    };
    this.currentArray().push(node);
    return this;
  }

  when(label: string): this {
    const node: ConditionNode = { kind: 'condition', label, thenBranch: [], otherwiseBranch: [] };
    this.currentArray().push(node);
    this.conditionMeta.set(node, { thenCalled: false, otherwiseCalled: false });
    this.stack.push({ node, activeBranch: null });
    return this;
  }

  then(): this {
    const top = this.stack[this.stack.length - 1];
    if (!top) throw new Error('then() llamado sin when() previo.');
    top.activeBranch = 'then';
    this.conditionMeta.get(top.node)!.thenCalled = true;
    return this;
  }

  otherwise(): this {
    const top = this.stack[this.stack.length - 1];
    if (!top) throw new Error('otherwise() llamado sin when() previo.');
    top.activeBranch = 'otherwise';
    this.conditionMeta.get(top.node)!.otherwiseCalled = true;
    return this;
  }

  // Alias legible (spec 3.2): .if().yes().no().end()
  if(label: string): this {
    return this.when(label);
  }

  yes(): this {
    return this.then();
  }

  no(): this {
    return this.otherwise();
  }

  end(): this {
    if (this.stack.length === 0) throw new Error('end() llamado sin when() abierto.');
    this.stack.pop();
    return this;
  }

  theme(name: ThemeName): this {
    this.themeName = name;
    return this;
  }

  draw(): DrawResult {
    const ast: DiagramModel = {
      type: 'sequence',
      name: this.name,
      theme: this.themeName,
      components: [...this.componentsById.values()],
      flow: this.rootFlow,
    };

    const warnings = validate(ast, {
      diagramName: this.name,
      components: ast.components,
      declaredRaw: this.declaredRaw,
      unresolvedRefs: this.unresolvedRefs,
      conditionMeta: this.conditionMeta,
      explicitUses: this.explicitUses,
    });

    return { ast, warnings, svg: renderSvg(ast) };
  }
}

export function Sequence(name: string): SequenceBuilder {
  return new SequenceBuilder(name);
}
