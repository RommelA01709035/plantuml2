import type { ComponentDefinition, ConditionNode, DiagramModel, FlowNode, ValidationWarning } from './types.js';
import { closestMatch } from './normalize.js';
import { DiagramValidationError } from './errors.js';

export interface ConditionMeta {
  thenCalled: boolean;
  otherwiseCalled: boolean;
}

export interface ValidationContext {
  diagramName: string;
  components: ComponentDefinition[];
  declaredRaw: ComponentDefinition[];
  unresolvedRefs: string[];
  conditionMeta: Map<ConditionNode, ConditionMeta>;
  explicitUses: boolean;
}

export function validate(model: DiagramModel, ctx: ValidationContext): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  checkDuplicateComponents(ctx);
  checkUnresolvedParticipants(ctx);
  walkFlow(model.flow, ctx, warnings);

  return warnings;
}

function checkDuplicateComponents(ctx: ValidationContext): void {
  const byId = new Map<string, ComponentDefinition[]>();
  for (const c of ctx.declaredRaw) {
    const list = byId.get(c.id) ?? [];
    list.push(c);
    byId.set(c.id, list);
  }

  for (const list of byId.values()) {
    const types = new Set(list.map((c) => c.type));
    if (types.size > 1) {
      throw new DiagramValidationError({
        header: 'Error en uses():',
        issue: `El componente "${list[0].label}" fue declarado más de una vez con tipos diferentes.`,
        detailsList: {
          title: 'Declaraciones encontradas:',
          items: list.map((c) => `${c.type}("${c.label}")`),
        },
        suggestion: 'Usa nombres distintos o declara el componente una sola vez.',
        suggestionLabel: 'Solución:',
      });
    }
  }
}

function checkUnresolvedParticipants(ctx: ValidationContext): void {
  if (!ctx.explicitUses || ctx.unresolvedRefs.length === 0) return;

  const missing = ctx.unresolvedRefs[0];
  const known = ctx.components.map((c) => c.label);
  const suggestion = closestMatch(missing, known);

  throw new DiagramValidationError({
    header: `Error en Sequence("${ctx.diagramName}"):`,
    issue: `El participante "${missing}" no existe.`,
    detailsList: { title: 'Participantes declarados:', items: known },
    suggestion: suggestion ? `¿Querías usar "${suggestion}"?` : undefined,
    suggestionLabel: 'Posible solución:',
  });
}

function walkFlow(nodes: FlowNode[], ctx: ValidationContext, warnings: ValidationWarning[]): void {
  const labelById = new Map(ctx.components.map((c) => [c.id, c.label]));

  for (const node of nodes) {
    if (node.kind === 'step') {
      if (!node.message || !node.message.trim()) {
        const from = labelById.get(node.from) ?? node.from;
        const to = labelById.get(node.to) ?? node.to;
        warnings.push({
          message: [
            'Advertencia:',
            'El mensaje del step está vacío.',
            '',
            'Ejemplo recomendado:',
            `.step("${from}", "${to}", "Ingresa credenciales")`,
          ].join('\n'),
        });
      }
      continue;
    }

    if (node.kind === 'separator') continue;

    const meta = ctx.conditionMeta.get(node);
    if (!meta?.thenCalled) {
      throw new DiagramValidationError({
        header: `Error en when("${node.label}"):`,
        issue: 'La condición no tiene rama then().',
        suggestion: '.then()\n  .step(...)',
        suggestionLabel: 'Agrega:',
      });
    }
    if (!meta.otherwiseCalled) {
      warnings.push({
        message: [
          `Advertencia en when("${node.label}"):`,
          'La condición no tiene rama otherwise().',
          '',
          'Si este flujo puede fallar, agrega:',
          '.otherwise()\n  .step(...)',
        ].join('\n'),
      });
    }

    walkFlow(node.thenBranch, ctx, warnings);
    walkFlow(node.otherwiseBranch, ctx, warnings);
  }
}
