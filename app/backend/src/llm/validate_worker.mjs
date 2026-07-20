// validate_worker.mjs — child process that evaluates one Strudel source string
// with the real engine and reports the onset count. Runs isolated because LLM
// output is arbitrary JS: an infinite loop hangs this worker, not the server
// (the parent kills it on timeout).
//
// stdin:  the code string
// argv:   --cycles N (default 4)
// env:    DATA_GEN_DIR — folder containing strudel_eval.mjs with node_modules
// stdout: one JSON line {ok:true, events:N, cps} | {ok:false, error}
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const cyclesArg = process.argv.indexOf('--cycles');
const cycles = cyclesArg > -1 ? Number(process.argv[cyclesArg + 1]) : 4;

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const code = Buffer.concat(chunks).toString('utf8');

try {
  const dataGenDir = process.env.DATA_GEN_DIR;
  if (!dataGenDir) throw new Error('DATA_GEN_DIR not set');
  const { evalStrudel } = await import(pathToFileURL(join(dataGenDir, 'strudel_eval.mjs')));
  const { pattern, cps } = await evalStrudel(code);
  const haps = pattern.queryArc(0, cycles).filter((h) => h.hasOnset());
  console.log(JSON.stringify({ ok: true, events: haps.length, cps }));
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: String(e?.message ?? e).slice(0, 500) }));
}
process.exit(0);
