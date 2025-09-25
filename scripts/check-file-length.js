#!/usr/bin/env node
const { execSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const MAX_LINES = 500;
const WARN_LINES = 400;

function listFiles() {
  const cmd = "git ls-files '*.ts' '*.tsx'";
  const out = execSync(cmd, { encoding: 'utf8' });
  return out.split('\n').filter(Boolean);
}

function countLines(path) {
  const content = readFileSync(path, 'utf8');
  return content.split('\n').length;
}

function main() {
  const repoRoot = process.cwd();
  const files = listFiles();
  const offenders = [];
  const warnings = [];

  for (const rel of files) {
    const p = join(repoRoot, rel);
    const lines = countLines(p);
    if (lines > MAX_LINES) offenders.push({ file: rel, lines });
    else if (lines >= WARN_LINES) warnings.push({ file: rel, lines });
  }

  if (warnings.length) {
    console.warn('[check-file-length] Warning: files approaching limit (>= 400 lines):');
    for (const w of warnings) console.warn(` - ${w.file}: ${w.lines} lines`);
  }

  if (offenders.length) {
    console.error('[check-file-length] Error: files exceeding 500 lines:');
    for (const o of offenders) console.error(` - ${o.file}: ${o.lines} lines`);
    console.error('\nPlease split these files per project rules.');
    process.exit(1);
  }
}

main();


