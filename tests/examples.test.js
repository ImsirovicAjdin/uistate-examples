/**
 * @uistate/examples — integration tests via @uistate/event-test
 *
 * Tests the state patterns demonstrated in examples 001–011.
 * Each test recreates the core logic of an example using eventTest.
 */

import { createEventTest, runTests } from '@uistate/event-test';
import { createEventState } from '@uistate/core';

const results = runTests({

  // ── 001-counter ───────────────────────────────────────────────────

  '001-counter: increment': () => {
    const t = createEventTest({ count: 0 });
    t.trigger('count', 1);
    t.assertPath('count', 1);
    t.assertType('count', 'number');
    t.assertEventFired('count', 1);
  },

  '001-counter: multiple increments': () => {
    const t = createEventTest({ count: 0 });
    t.trigger('count', 1).trigger('count', 2).trigger('count', 3);
    t.assertPath('count', 3);
    t.assertEventFired('count', 3);
  },

  // ── 002-counter-improved ──────────────────────────────────────────

  '002-counter-improved: increment and decrement': () => {
    const t = createEventTest({ count: 0 });
    t.trigger('count', 1).trigger('count', 2).trigger('count', 1);
    t.assertPath('count', 1);
  },

  // ── 003-input-reactive ────────────────────────────────────────────

  '003-input-reactive: text binding': () => {
    const t = createEventTest({ input: '' });
    t.trigger('input', 'hello world');
    t.assertPath('input', 'hello world');
    t.assertType('input', 'string');
    t.assertEventFired('input', 1);
  },

  '003-input-reactive: rapid updates': () => {
    const t = createEventTest({ input: '' });
    t.trigger('input', 'h').trigger('input', 'he').trigger('input', 'hel');
    t.assertPath('input', 'hel');
    t.assertEventFired('input', 3);
  },

  // ── 004-computed-state ────────────────────────────────────────────

  '004-computed: derived full name': () => {
    const store = createEventState({ firstName: '', lastName: '' });
    let fullName = '';
    store.subscribe('*', () => {
      fullName = `${store.get('firstName')} ${store.get('lastName')}`.trim();
    });
    store.set('firstName', 'Abraham');
    store.set('lastName', 'Lincoln');
    if (fullName !== 'Abraham Lincoln') throw new Error(`Expected "Abraham Lincoln", got "${fullName}"`);
    store.destroy();
  },

  '004-computed: character count': () => {
    const store = createEventState({ firstName: '', lastName: '' });
    let charCount = 0;
    store.subscribe('*', () => {
      charCount = (store.get('firstName') + store.get('lastName')).length;
    });
    store.set('firstName', 'Abe');
    store.set('lastName', 'Lincoln');
    if (charCount !== 10) throw new Error(`Expected 10, got ${charCount}`);
    store.destroy();
  },

  // ── 005-conditional-rendering ─────────────────────────────────────

  '005-conditional: toggle visibility': () => {
    const t = createEventTest({ visible: false });
    t.trigger('visible', true);
    t.assertPath('visible', true);
    t.assertType('visible', 'boolean');
    t.trigger('visible', false);
    t.assertPath('visible', false);
  },

  '005-conditional: show/hide based on auth': () => {
    const t = createEventTest({ isLoggedIn: false, user: null });
    t.trigger('isLoggedIn', true).trigger('user', { name: 'Alice' });
    t.assertPath('isLoggedIn', true);
    t.assertPath('user', { name: 'Alice' });
  },

  // ── 006-list-rendering ────────────────────────────────────────────

  '006-list: add items': () => {
    const t = createEventTest({ items: [] });
    t.trigger('items', [{ id: 1, text: 'Buy milk' }]);
    t.assertArrayLength('items', 1);
    t.assertArrayOf('items', { id: 'number', text: 'string' });
  },

  '006-list: remove item': () => {
    const t = createEventTest({ items: [{ id: 1, text: 'A' }, { id: 2, text: 'B' }] });
    t.trigger('items', [{ id: 2, text: 'B' }]);
    t.assertArrayLength('items', 1);
    t.assertPath('items', [{ id: 2, text: 'B' }]);
  },

  // ── 007-form-validation ───────────────────────────────────────────

  '007-form: valid email': () => {
    const t = createEventTest({ email: '', errors: {} });
    t.trigger('email', 'test@example.com');
    t.trigger('errors', {});
    t.assertPath('errors', {});
  },

  '007-form: invalid email': () => {
    const t = createEventTest({ email: '', errors: {} });
    t.trigger('email', 'bad');
    t.trigger('errors', { email: 'Invalid email' });
    t.assertShape('errors', { email: 'string' });
  },

  '007-form: multiple field validation': () => {
    const t = createEventTest({ name: '', email: '', errors: {} });
    t.trigger('errors', { name: 'Required', email: 'Invalid' });
    t.assertShape('errors', { name: 'string', email: 'string' });
  },

  // ── 008-undo-redo ─────────────────────────────────────────────────

  '008-undo-redo: undo restores previous': () => {
    const t = createEventTest({ value: 0 });
    t.trigger('value', 1).trigger('value', 2);
    // Undo: go back to 1
    t.trigger('value', 1);
    t.assertPath('value', 1);
  },

  '008-undo-redo: redo restores next': () => {
    const t = createEventTest({ value: 0 });
    t.trigger('value', 1).trigger('value', 2);
    // Undo then redo
    t.trigger('value', 1).trigger('value', 2);
    t.assertPath('value', 2);
  },

  // ── 009-localStorage-side-effects ─────────────────────────────────

  '009-side-effects: subscriber as side effect': () => {
    const store = createEventState({ theme: 'light' });
    let sideEffectRan = false;
    store.subscribe('theme', () => { sideEffectRan = true; });
    store.set('theme', 'dark');
    if (!sideEffectRan) throw new Error('Side effect should have run');
    if (store.get('theme') !== 'dark') throw new Error('Expected dark');
    store.destroy();
  },

  // ── 010-decoupled-components ──────────────────────────────────────

  '010-decoupled: shared store between components': () => {
    const store = createEventState({ shared: { count: 0 } });
    let a = null, b = null;
    store.subscribe('shared.count', (v) => { a = v; });
    store.subscribe('shared.count', (v) => { b = v; });
    store.set('shared.count', 42);
    if (a !== 42 || b !== 42) throw new Error('Both components should receive 42');
    store.destroy();
  },

  '010-decoupled: wildcard for any shared change': () => {
    const t = createEventTest({ shared: { x: 0, y: 0 } });
    t.trigger('shared.x', 1).trigger('shared.y', 2);
    t.assertPath('shared.x', 1);
    t.assertPath('shared.y', 2);
  },

  // ── 011-async-patterns ────────────────────────────────────────────

  'async 011-async: setAsync success': async () => {
    const store = createEventState({});
    await store.setAsync('users', async () => [{ id: 1, name: 'Alice' }]);
    if (store.get('users.status') !== 'success') throw new Error('Expected success');
    if (!Array.isArray(store.get('users.data'))) throw new Error('Expected array data');
    store.destroy();
  },

  '011-async: setAsync loading state': () => {
    const store = createEventState({});
    const p = store.setAsync('data', async () => 42);
    if (store.get('data.status') !== 'loading') throw new Error('Expected loading');
    if (store.get('data.error') !== null) throw new Error('Expected null error');
    p.catch(() => {});
    store.destroy();
  },

  '011-async: setAsync error': async () => {
    const store = createEventState({});
    try {
      await store.setAsync('data', async () => { throw new Error('fail'); });
    } catch {}
    if (store.get('data.status') !== 'error') throw new Error('Expected error status');
    store.destroy();
  },
});

if (results.failed > 0) process.exit(1);
