let pending = Buffer.alloc(0);
let opened = false;

function send(message) {
  const body = Buffer.from(JSON.stringify(message));
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

function receive(message) {
  if (message.method === 'textDocument/didOpen') {
    opened = true;
    send({
      jsonrpc: '2.0',
      method: 'textDocument/publishDiagnostics',
      params: { uri: 'file:///unrelated.svelte', diagnostics: [{ message: 'unrelated warning' }] }
    });
    setTimeout(() => send({
      jsonrpc: '2.0',
      method: 'textDocument/publishDiagnostics',
      params: { uri: message.params.textDocument.uri, diagnostics: [{ message: 'sample warning', severity: 2 }] }
    }), 50);
    return;
  }
  if (message.id === undefined) return;
  if (message.method === 'initialize') {
    if (process.argv.includes('--require-polling') && process.env.CHOKIDAR_USEPOLLING !== '1') {
      send({ jsonrpc: '2.0', id: message.id, error: { code: -32000, message: 'polling required' } });
      return;
    }
    send({ jsonrpc: '2.0', id: message.id, result: { capabilities: {} } });
    return;
  }
  if (!opened) {
    send({ jsonrpc: '2.0', id: message.id, error: { code: -32000, message: 'file not opened' } });
    return;
  }
  const result = message.method === 'textDocument/references'
    ? [{ uri: message.params.textDocument.uri, range: { start: { line: 1, character: 3 }, end: { line: 1, character: 9 } } }]
    : message.method === 'textDocument/documentSymbol'
      ? [{ name: 'sample', kind: 12 }]
      : message.method === 'textDocument/prepareCallHierarchy'
        ? [{ name: 'sample', uri: message.params.textDocument.uri, range: { start: { line: 0, character: 0 }, end: { line: 0, character: 6 } } }]
        : message.method === 'callHierarchy/incomingCalls'
          ? [{ from: message.params.item, fromRanges: [] }]
          : null;
  send({ jsonrpc: '2.0', id: message.id, result });
}

process.stdin.on('data', chunk => {
  pending = Buffer.concat([pending, chunk]);
  while (true) {
    const boundary = pending.indexOf('\r\n\r\n');
    if (boundary < 0) return;
    const headers = pending.subarray(0, boundary).toString();
    const length = Number(/Content-Length:\s*(\d+)/i.exec(headers)?.[1]);
    if (!Number.isInteger(length) || pending.length < boundary + 4 + length) return;
    const body = pending.subarray(boundary + 4, boundary + 4 + length);
    pending = pending.subarray(boundary + 4 + length);
    receive(JSON.parse(body.toString()));
  }
});
