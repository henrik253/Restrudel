// postinstall: @kabelsalat/web ships no "exports" map, so Node resolves its
// CJS "main" (dist/index.js), which lacks the SalatRepl named export that
// @strudel/core imports. Point "main" at the ESM build. Without this, any
// `import '@strudel/core'` in Node crashes.
import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('./node_modules/@kabelsalat/web/package.json', import.meta.url);
try {
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  if (pkg.main !== 'dist/index.mjs') {
    pkg.main = 'dist/index.mjs';
    writeFileSync(path, JSON.stringify(pkg, null, 2));
    console.log('patched @kabelsalat/web main -> dist/index.mjs');
  }
} catch {
  // package not installed (e.g. future strudel versions drop it) — fine
}
