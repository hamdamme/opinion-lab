import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { cleanAnswers, cleanBatch, readStored, writeStored, removeStored } from '../src/lib/browserState.ts';
import { parseLiveRating, liveEndpoint } from '../src/lib/liveRating.ts';
import { computeStats } from '../src/lib/stats.ts';

const dataset = JSON.parse(readFileSync(new URL('../public/data/dataset.json', import.meta.url)));

test('study MAD displays exact four-place values including decimal ties', () => {
  const stats = computeStats(dataset.statements, dataset.llms.map(m => m.name), s => s.reference);
  for (const [name, value] of [['Mistral Large', '0.6775'], ['LG ExaOne Deep 7B', '0.9125'], ['Google Gemini 2.0 Flash', '0.6950']]) {
    assert.equal(stats.find(s => s.name === name).mae.toFixed(4), value);
  }
  assert.ok(stats.every(s => s.n === 400));
});

test('opposite rating errors cancel the signed mean but not disagreement', () => {
  const stats = computeStats([{reference:3, ratings:{model:1}}, {reference:3, ratings:{model:5}}], ['model'], s => s.reference)[0];
  assert.equal(stats.bias, 0);
  assert.equal(stats.mae, 2);
  assert.equal(stats.exact, 0);
});

test('live ratings accept only a complete single integer response', () => {
  for (let i = 1; i <= 5; i++) assert.equal(parseLiveRating(` \n${i} `), i);
  for (const value of ['10', '3.0', 'I cannot give a 1–5 rating', 'Rating: 4', '4\n5', '', null, 3, {}, '0', '6']) {
    assert.throws(() => parseLiveRating(value));
  }
});

test('API endpoints must use HTTPS without embedded credentials or query data', () => {
  assert.equal(liveEndpoint('https://example.com/v1/'), 'https://example.com/v1/chat/completions');
  for (const url of ['http://example.com/v1', 'https://user:pass@example.com', 'https://example.com?key=test', 'https://example.com#x']) {
    assert.throws(() => liveEndpoint(url));
  }
});

test('stored answers reject invalid structures, IDs, and ratings', () => {
  for (const value of [null, [], 5, 'text']) assert.deepEqual(cleanAnswers(value), {});
  assert.deepEqual(cleanAnswers({'1.1.1':3,'1.2.100':5,'1.1.0':1,'1.1.101':1,'2.1.1':'3','2.1.2':2.5,'2.2.1':null}), {'1.1.1':3,'1.2.100':5});
  assert.deepEqual(cleanAnswers({'1.1.1':3,'1.2.100':5}, new Set(['1.1.1'])), {'1.1.1':3});
  assert.deepEqual(cleanBatch(['1.1.1','1.1.1',null,'wrong','2.2.100']), ['1.1.1','2.2.100']);
  assert.deepEqual(cleanBatch(null), []);
});

test('blocked storage and invalid JSON do not crash the app', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', {configurable:true, get(){throw new Error('blocked');}});
    assert.equal(readStored('x'), null);
    assert.equal(writeStored('x', {}), false);
    assert.doesNotThrow(() => removeStored('opinionlab.livecfg'));
    const removed=[];
    Object.defineProperty(globalThis, 'localStorage', {configurable:true, value:{getItem:()=>'{broken',removeItem:key=>removed.push(key)}});
    assert.equal(readStored('x'), null);
    removeStored('opinionlab.livecfg');
    assert.deepEqual(removed, ['opinionlab.livecfg']);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});
