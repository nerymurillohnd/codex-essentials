import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { test } from 'node:test';

const script = resolve(import.meta.dirname, '../../plugins/svelte-development/scripts/svelte-lsp.mjs');
const fake = resolve(import.meta.dirname, 'fake-lsp-server.mjs');

function withFile(run) {
  const root = mkdtempSync(join(tmpdir(), 'svelte-lsp-test-'));
  writeFileSync(join(root, 'Widget.svelte'), '<script>let sample = 1;</script>\n<p>{sample}</p>\n');
  try { run(root); } finally { rmSync(root, { recursive: true, force: true }); }
}

function query(root, extra) {
  return spawnSync(process.execPath, [script, '--root', root, '--file', 'Widget.svelte', '--server', process.execPath, '--server-arg', fake, '--timeout-ms', '3000', ...extra], { encoding: 'utf8', timeout: 5000 });
}

test('opens the file and reports semantic references with one-based input positions', () => withFile(root => {
  const result = query(root, ['--operation', 'references', '--line', '2', '--character', '5']);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.operation, 'references');
  assert.equal(output.result.length, 1);
  assert.equal(output.result[0].range.start.line, 2);
  assert.equal(output.result[0].range.start.character, 4);
  assert.match(output.result[0].uri, /Widget\.svelte$/);
}));

test('collects diagnostics pushed after didOpen', () => withFile(root => {
  const result = query(root, ['--operation', 'diagnostics']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).result[0].message, 'sample warning');
}));

test('resolves call hierarchy without requiring a long-running daemon', () => withFile(root => {
  const result = query(root, ['--operation', 'incoming-calls', '--line', '2', '--character', '5']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).result[0].from.name, 'sample');
}));

test('rejects invalid positions and missing files before starting the server', () => withFile(root => {
  const invalid = query(root, ['--operation', 'references', '--line', '0', '--character', '1']);
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /one-based positive/);
  const outside = query(root, ['--operation', 'references', '--line', '99', '--character', '1']);
  assert.notEqual(outside.status, 0);
  assert.match(outside.stderr, /outside the file/);
  const missing = spawnSync(process.execPath, [script, '--root', root, '--file', 'Missing.svelte', '--operation', 'diagnostics'], { encoding: 'utf8' });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /not a file/);
}));

test('reports a missing language server explicitly', () => withFile(root => {
  const result = spawnSync(process.execPath, [script, '--root', root, '--file', 'Widget.svelte', '--operation', 'diagnostics', '--server', 'missing-svelte-server-xyz', '--timeout-ms', '1000'], { encoding: 'utf8', timeout: 3000 });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /language server unavailable/);
}));

test('starts the language server with polling when watcher limits are tight', () => withFile(root => {
  const result = query(root, ['--operation', 'document-symbols', '--server-arg', '--require-polling']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).result[0].name, 'sample');
}));
