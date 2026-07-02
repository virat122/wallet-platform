/**
 * Minimal structured logger. Swap for pino/winston in production —
 * this keeps the boilerplate dependency-free and easy to read.
 */
function timestamp() {
  return new Date().toISOString();
}

function log(level, message, meta = {}) {
  const entry = { level, message, timestamp: timestamp(), ...meta };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
