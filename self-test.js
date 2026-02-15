/**
 * @uistate/examples — zero-dependency self-test
 *
 * Verifies that examples 001–011 exist and have the expected structure.
 * Also tests the core state patterns each example demonstrates,
 * using only @uistate/core (no DOM, no eventTest).
 */

import { createEventState } from '@uistate/core';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${title}`);
}

// ── 1. Example directories exist ────────────────────────────────────

section('1. example directories exist');

const examples = [
  '001-counter',
  '002-counter-improved',
  '003-input-reactive',
  '004-computed-state',
  '005-conditional-rendering',
  '006-list-rendering',
  '007-form-validation',
  '008-undo-redo',
  '009-localStorage-side-effects',
  '010-decoupled-components',
  '011-async-patterns',
];

for (const ex of examples) {
  const dir = join(__dirname, 'eventState', ex);
  assert(`${ex}/ exists`, existsSync(dir));
}

// ── 2. Each example has index.html ──────────────────────────────────

section('2. each example has index.html');

for (const ex of examples) {
  const file = join(__dirname, 'eventState', ex, 'index.html');
  assert(`${ex}/index.html exists`, existsSync(file));
}

// ── 3. 001-counter pattern ──────────────────────────────────────────

section('3. 001-counter: basic get/set/subscribe');

const s1 = createEventState({ count: 0 });
let s1val = null;
s1.subscribe('count', (v) => { s1val = v; });
s1.set('count', s1.get('count') + 1);
assert('count incremented to 1', s1.get('count') === 1);
assert('subscriber received value', s1val === 1);
s1.destroy();

// ── 4. 003-input-reactive pattern ───────────────────────────────────

section('4. 003-input-reactive: two-way binding pattern');

const s3 = createEventState({ input: '' });
let s3val = '';
s3.subscribe('input', (v) => { s3val = v; });
s3.set('input', 'hello');
assert('input set to hello', s3.get('input') === 'hello');
assert('subscriber received hello', s3val === 'hello');
s3.destroy();

// ── 5. 004-computed-state pattern ───────────────────────────────────

section('5. 004-computed: derived values');

const s4 = createEventState({ firstName: '', lastName: '' });
let fullName = '';
s4.subscribe('*', () => {
  fullName = `${s4.get('firstName')} ${s4.get('lastName')}`.trim();
});
s4.set('firstName', 'Abraham');
s4.set('lastName', 'Lincoln');
assert('computed fullName', fullName === 'Abraham Lincoln');
s4.destroy();

// ── 6. 005-conditional-rendering pattern ────────────────────────────

section('6. 005-conditional: boolean toggle');

const s5 = createEventState({ visible: false });
s5.set('visible', !s5.get('visible'));
assert('toggled to true', s5.get('visible') === true);
s5.set('visible', !s5.get('visible'));
assert('toggled back to false', s5.get('visible') === false);
s5.destroy();

// ── 7. 006-list-rendering pattern ───────────────────────────────────

section('7. 006-list: array state');

const s6 = createEventState({ items: [] });
const items = [...s6.get('items'), { id: 1, text: 'Buy milk' }];
s6.set('items', items);
assert('items has 1 entry', s6.get('items').length === 1);
assert('first item text', s6.get('items')[0].text === 'Buy milk');
s6.destroy();

// ── 8. 007-form-validation pattern ──────────────────────────────────

section('8. 007-form: validation state');

const s7 = createEventState({ email: '', errors: {} });
const email = 'test@example.com';
s7.set('email', email);
const isValid = email.includes('@');
s7.set('errors', isValid ? {} : { email: 'Invalid email' });
assert('valid email → no errors', Object.keys(s7.get('errors')).length === 0);

s7.set('email', 'bad');
s7.set('errors', { email: 'Invalid email' });
assert('invalid email → has error', s7.get('errors').email === 'Invalid email');
s7.destroy();

// ── 9. 008-undo-redo pattern ────────────────────────────────────────

section('9. 008-undo-redo: history stack');

const s8 = createEventState({ value: 0 });
const history = [0];
let historyIndex = 0;

s8.set('value', 1); history.push(1); historyIndex++;
s8.set('value', 2); history.push(2); historyIndex++;

// Undo
historyIndex--;
s8.set('value', history[historyIndex]);
assert('undo: value = 1', s8.get('value') === 1);

// Redo
historyIndex++;
s8.set('value', history[historyIndex]);
assert('redo: value = 2', s8.get('value') === 2);
s8.destroy();

// ── 10. 010-decoupled-components pattern ────────────────────────────

section('10. 010-decoupled: shared store');

const s10 = createEventState({ shared: { count: 0 } });
let componentA = null;
let componentB = null;
s10.subscribe('shared.count', (v) => { componentA = v; });
s10.subscribe('shared.count', (v) => { componentB = v; });
s10.set('shared.count', 5);
assert('component A received value', componentA === 5);
assert('component B received value', componentB === 5);
s10.destroy();

// ── 11. 011-async-patterns ──────────────────────────────────────────

section('11. 011-async: setAsync lifecycle');

const s11 = createEventState({});
const promise = s11.setAsync('data', async () => ({ result: 42 }));
assert('loading state set', s11.get('data.status') === 'loading');
await promise;
assert('success state set', s11.get('data.status') === 'success');
assert('data received', s11.get('data.data')?.result === 42);
s11.destroy();

// ── Summary ─────────────────────────────────────────────────────────

console.log(`\n@uistate/examples v1.0.1 — self-test`);
if (failed > 0) {
  console.error(`✗ ${failed} assertion(s) failed, ${passed} passed`);
  process.exit(1);
} else {
  console.log(`✓ ${passed} assertions passed`);
}
