// log.mjs — tiny leveled logger; everything goes to stderr so stdout stays
// clean for tooling.
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

export function createLogger(scope, level = 'info') {
  const threshold = LEVELS[level] ?? LEVELS.info;
  const emit = (lvl, args) => {
    if (LEVELS[lvl] > threshold) return;
    const ts = new Date().toISOString().slice(11, 23);
    console.error(`${ts} ${lvl.padEnd(5)} [${scope}]`, ...args);
  };
  return {
    error: (...a) => emit('error', a),
    warn: (...a) => emit('warn', a),
    info: (...a) => emit('info', a),
    debug: (...a) => emit('debug', a),
    child: (sub) => createLogger(`${scope}:${sub}`, level),
  };
}
