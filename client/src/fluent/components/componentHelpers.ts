import type { ComponentDefinition, ComponentType } from '../core/types.js';
import { slugify } from '../core/normalize.js';

function makeComponent(type: ComponentType) {
  return (label: string): ComponentDefinition => ({ id: slugify(label), label, type });
}

export const actor = makeComponent('actor');
export const app = makeComponent('app');
export const service = makeComponent('service');
export const db = makeComponent('db');
export const api = makeComponent('api');
export const queue = makeComponent('queue');
export const storage = makeComponent('storage');

export function inferType(name: string): ComponentType {
  const n = name.toLowerCase();
  if (/whatsapp|\bapi\b/.test(n)) return 'api';
  if (/queue|cola/.test(n)) return 'queue';
  if (/storage|bucket/.test(n)) return 'storage';
  if (/\b(db|database|users?)\b/.test(n)) return 'db';
  if (/auth|service/.test(n)) return 'service';
  if (/front|app|ui\b/.test(n)) return 'app';
  if (/usuario|user|actor|client/.test(n)) return 'actor';
  return 'unknown';
}
