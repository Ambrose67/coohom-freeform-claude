#!/usr/bin/env node
// Stdio proxy for @manycore/coohom-lux3d-mcp so it works in Claude Code.
//
// Why it exists:
// 1. Lux3D rejects every tool call that lacks `_meta.threadId` (Codex sends one,
//    Claude Code does not). This proxy adds a stable thread ID to each tools/call.
// 2. The package's entry point exits silently when started through its npm bin
//    symlink, so the proxy starts the real file with `node` instead.
//
// Thread ID: LUX3D_THREAD_ID if set, otherwise one ID per proxy process
// ("claude-<random>"). The executor page URL returned by prepare_workspace
// carries this ID, so keep using the same Claude session while connected.
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import readline from 'node:readline';

const threadId = (process.env.LUX3D_THREAD_ID || `claude-${randomUUID()}`).slice(0, 256);
const pkg = process.env.LUX3D_PACKAGE || '@manycore/coohom-lux3d-mcp@latest';

const child = spawn(
  'npx',
  ['--yes', '-p', pkg, '-c', 'node "$(realpath "$(command -v lux3d-mcp-server)")"'],
  { stdio: ['pipe', 'pipe', 'inherit'], env: process.env }
);

const fromClient = readline.createInterface({ input: process.stdin });
fromClient.on('line', (line) => {
  let out = line;
  try {
    const msg = JSON.parse(line);
    if (msg && msg.method === 'tools/call') {
      msg.params = msg.params || {};
      msg.params._meta = { ...(msg.params._meta || {}), threadId: msg.params._meta?.threadId || threadId };
      out = JSON.stringify(msg);
    }
  } catch {
    // not JSON: pass through unchanged
  }
  child.stdin.write(out + '\n');
});
fromClient.on('close', () => child.stdin.end());

child.stdout.pipe(process.stdout);
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
