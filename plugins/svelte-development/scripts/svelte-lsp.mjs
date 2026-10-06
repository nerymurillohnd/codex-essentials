#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

const METHODS = {
  definition: 'textDocument/definition',
  references: 'textDocument/references',
  hover: 'textDocument/hover',
  'document-symbols': 'textDocument/documentSymbol',
  'workspace-symbols': 'workspace/symbol',
  'incoming-calls': 'callHierarchy/incomingCalls',
  'outgoing-calls': 'callHierarchy/outgoingCalls'
};

function options(argv) {
  const values = { serverArgs: [] };
  const keys = { '--root': 'root', '--file': 'file', '--operation': 'operation', '--line': 'line', '--character': 'character', '--query': 'query', '--server': 'server', '--timeout-ms': 'timeout' };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--server-arg') {
      if (!argv[++i]) throw new Error('--server-arg needs a value');
      values.serverArgs.push(argv[i]);
    } else if (keys[key]) {
      if (!argv[++i]) throw new Error(`${key} needs a value`);
      values[keys[key]] = argv[i];
    } else {
      throw new Error(`unknown option: ${key}`);
    }
  }
  if (!values.root || !values.file || !values.operation) throw new Error('--root, --file and --operation are required');
  if (!Object.hasOwn(METHODS, values.operation) && values.operation !== 'diagnostics') throw new Error(`unknown operation: ${values.operation}`);
  if (['workspace-symbols'].includes(values.operation) && !values.query) throw new Error('--query is required for workspace-symbols');
  if (['definition', 'references', 'hover', 'incoming-calls', 'outgoing-calls'].includes(values.operation)) {
    values.line = Number(values.line);
    values.character = Number(values.character);
    if (!Number.isInteger(values.line) || !Number.isInteger(values.character) || values.line < 1 || values.character < 1) {
      throw new Error('--line and --character must be one-based positive integers');
    }
  }
  values.timeout = values.timeout === undefined ? 10000 : Number(values.timeout);
  if (!Number.isInteger(values.timeout) || values.timeout < 100) throw new Error('--timeout-ms must be at least 100');
  return values;
}

function oneBased(value) {
  if (Array.isArray(value)) return value.map(oneBased);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, (key === 'line' || key === 'character') && Number.isInteger(item) ? item + 1 : oneBased(item)]));
  }
  return value;
}

class LspClient {
  constructor(command, args, cwd, timeout, documentUri) {
    this.child = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? '1' }
    });
    this.pending = new Map();
    this.nextId = 1;
    this.buffer = Buffer.alloc(0);
    this.stderr = '';
    this.timeout = timeout;
    this.documentUri = documentUri;
    this.diagnostics = null;
    this.diagnosticsWaiter = null;
    this.child.stderr.on('data', chunk => { this.stderr += chunk.toString(); });
    this.child.stdout.on('data', chunk => this.read(chunk));
    this.child.on('error', error => this.failAll(new Error(`language server unavailable: ${error.message}`)));
    this.child.on('exit', code => this.failAll(new Error(`language server exited (${code}): ${this.stderr.trim()}`)));
  }

  send(message) {
    const body = Buffer.from(JSON.stringify({ jsonrpc: '2.0', ...message }));
    this.child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
    this.child.stdin.write(body);
  }

  request(method, params) {
    const id = this.nextId++;
    return new Promise((resolveRequest, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`language server timed out on ${method}`));
      }, this.timeout);
      this.pending.set(id, { resolve: resolveRequest, reject, timer });
      this.send({ id, method, params });
    });
  }

  notify(method, params) { this.send({ method, params }); }

  failAll(error) {
    for (const [id, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(error);
      this.pending.delete(id);
    }
    if (this.diagnosticsWaiter) this.diagnosticsWaiter(error);
  }

  read(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true) {
      const boundary = this.buffer.indexOf('\r\n\r\n');
      if (boundary < 0) return;
      const headers = this.buffer.subarray(0, boundary).toString();
      const length = Number(/Content-Length:\s*(\d+)/i.exec(headers)?.[1]);
      if (!Number.isSafeInteger(length) || length < 0) throw new Error('invalid language server frame');
      if (this.buffer.length < boundary + 4 + length) return;
      const body = this.buffer.subarray(boundary + 4, boundary + 4 + length);
      this.buffer = this.buffer.subarray(boundary + 4 + length);
      this.message(JSON.parse(body.toString()));
    }
  }

  message(message) {
    if (message.id !== undefined && !message.method) {
      const entry = this.pending.get(message.id);
      if (!entry) return;
      clearTimeout(entry.timer);
      this.pending.delete(message.id);
      if (message.error) entry.reject(new Error(`language server: ${message.error.message}`));
      else entry.resolve(message.result);
      return;
    }
    if (message.method === 'textDocument/publishDiagnostics') {
      if (message.params?.uri !== this.documentUri) return;
      this.diagnostics = message.params.diagnostics ?? [];
      if (this.diagnosticsWaiter) this.diagnosticsWaiter();
      return;
    }
    if (message.id !== undefined) {
      const result = message.method === 'workspace/configuration' ? [] : null;
      this.send({ id: message.id, result });
    }
  }

  async waitDiagnostics() {
    if (this.diagnostics !== null) return this.diagnostics;
    await new Promise((resolveWait, reject) => {
      const timer = setTimeout(() => { this.diagnosticsWaiter = null; resolveWait(); }, this.timeout);
      this.diagnosticsWaiter = error => {
        clearTimeout(timer);
        this.diagnosticsWaiter = null;
        error ? reject(error) : resolveWait();
      };
    });
    return this.diagnostics ?? [];
  }

  close() {
    for (const entry of this.pending.values()) clearTimeout(entry.timer);
    this.pending.clear();
    this.child.kill();
  }
}

async function main() {
  const opt = options(process.argv.slice(2));
  const root = resolve(opt.root);
  const file = resolve(root, opt.file);
  const within = relative(root, file);
  if (within.startsWith('..') || isAbsolute(within)) throw new Error('--file must be inside --root');
  if (!(await stat(file).catch(() => null))?.isFile()) throw new Error(`${file} is not a file`);
  if (!file.endsWith('.svelte')) throw new Error('the Svelte server must start from a .svelte file');
  const source = await readFile(file, 'utf8');
  if (opt.line) {
    const lines = source.split(/\r?\n/);
    if (opt.line > lines.length || opt.character > lines[opt.line - 1].length + 1) {
      throw new Error('position is outside the file (character counts UTF-16 code units)');
    }
  }
  const uri = pathToFileURL(file).href;
  const client = new LspClient(opt.server ?? 'svelteserver', opt.serverArgs.length ? opt.serverArgs : opt.server ? [] : ['--stdio'], root, opt.timeout, uri);
  try {
    await client.request('initialize', {
      processId: process.pid,
      rootUri: pathToFileURL(root).href,
      workspaceFolders: [{ uri: pathToFileURL(root).href, name: root.split('/').at(-1) }],
      capabilities: { workspace: { configuration: true }, textDocument: { publishDiagnostics: { relatedInformation: true } } }
    });
    client.notify('initialized', {});
    client.notify('textDocument/didOpen', { textDocument: { uri, languageId: 'svelte', version: 1, text: source } });
    let result;
    if (opt.operation === 'diagnostics') {
      result = await client.waitDiagnostics();
    } else if (opt.operation === 'workspace-symbols') {
      result = await client.request(METHODS[opt.operation], { query: opt.query });
    } else {
      const params = { textDocument: { uri } };
      if (opt.line) params.position = { line: opt.line - 1, character: opt.character - 1 };
      if (opt.operation === 'references') params.context = { includeDeclaration: true };
      if (opt.operation.endsWith('-calls')) {
        const items = await client.request('textDocument/prepareCallHierarchy', params);
        result = items?.length ? await client.request(METHODS[opt.operation], { item: items[0] }) : [];
      } else result = await client.request(METHODS[opt.operation], params);
    }
    process.stdout.write(JSON.stringify({ operation: opt.operation, result: oneBased(result) }) + '\n');
  } finally {
    client.close();
  }
}

main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
