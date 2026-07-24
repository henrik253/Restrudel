// subprocess.mjs — shared child-process runner: stdin input, timeout kill,
// abort-signal kill, stderr tail in errors. Used by the local transcriber,
// the LLM CLI fallback, and the Strudel validation worker.
import { spawn } from 'node:child_process';

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {{cwd?: string, env?: object, input?: string|Buffer, timeoutMs?: number,
 *          signal?: AbortSignal, onStderrLine?: (line: string) => void,
 *          encoding?: 'utf8'|'buffer'}} [opts]
 *   encoding 'buffer' keeps stdout as a Buffer — required for binary output
 *   (e.g. ffmpeg writing a WAV to stdout), which string concatenation corrupts.
 * @returns {Promise<{stdout: string|Buffer, stderr: string}>}
 */
export function runCommand(cmd, args, opts = {}) {
  const { cwd, env, input, timeoutMs = 120_000, signal, onStderrLine, encoding = 'utf8' } = opts;
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
    const binary = encoding === 'buffer';
    const chunks = [];
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;

    const kill = () => {
      try { child.kill('SIGKILL'); } catch { /* already gone */ }
    };
    const timer = setTimeout(() => { timedOut = true; kill(); }, timeoutMs);
    timer.unref?.();
    const onAbort = () => kill();
    signal?.addEventListener('abort', onAbort, { once: true });

    const fail = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(err);
    };

    child.on('error', (e) => fail(new Error(`failed to start ${cmd}: ${e.message}`)));
    child.stdout.on('data', (d) => { if (binary) chunks.push(d); else stdout += d; });
    let stderrBuf = '';
    child.stderr.on('data', (d) => {
      stderr += d;
      if (onStderrLine) {
        stderrBuf += d;
        const lines = stderrBuf.split('\n');
        stderrBuf = lines.pop();
        for (const line of lines) if (line.trim()) onStderrLine(line.trim());
      }
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      if (timedOut) return reject(new Error(`${cmd} timed out after ${Math.round(timeoutMs / 1000)} s`));
      if (signal?.aborted) return reject(Object.assign(new Error('cancelled'), { code: 'cancelled' }));
      if (code !== 0) {
        return reject(new Error(`${cmd} exited with code ${code}: ${stderr.trim().slice(-500)}`));
      }
      resolve({ stdout: binary ? Buffer.concat(chunks) : stdout, stderr });
    });

    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
}
