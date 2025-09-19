#!/usr/bin/env node
// Minimal non-fatal static scan used by CI

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE = new Set(['node_modules', '.git', '.next', 'playwright-report', 'test-results', 'dist', 'build']);
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE.has(entry.name)) continue;
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function parseEnvExample() {
  const fp = path.join(ROOT, '.env.example');
  const keys = new Set();
  if (!fs.existsSync(fp)) return keys;
  const text = fs.readFileSync(fp, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) keys.add(t.slice(0, i));
  }
  return keys;
}

function extractEnv(content) {
  const found = new Set();
  let m;
  const dot = /process\.env\.([A-Z0-9_]+)/g;
  while ((m = dot.exec(content))) found.add(m[1]);
  const br = /process\.env\[\s*["'`]([A-Z0-9_]+)["'`]\s*\]/g;
  while ((m = br.exec(content))) found.add(m[1]);
  return found;
}

function main() {
  const files = walk(ROOT).filter(f => EXTS.has(path.extname(f)));
  const exampleKeys = parseEnvExample();
  const usedKeys = new Set();
  for (const f of files) {
    try {
      const c = fs.readFileSync(f, 'utf8');
      for (const k of extractEnv(c)) usedKeys.add(k);
    } catch {}
  }

  const missing = [...usedKeys].filter(k => !exampleKeys.has(k)).sort();
  const checks = [
    'app/api/stripe-webhook/route.ts',
    'convex/payments.ts',
    '.github/phi-allowlist.txt',
  ];
  const missingFiles = checks.filter(rel => !fs.existsSync(path.join(ROOT, rel)));

  const result = {
    filesScanned: files.length,
    usedEnvCount: usedKeys.size,
    envExampleCount: exampleKeys.size,
    envMissingCount: missing.length,
    envMissingList: missing,
    missingFiles,
  };

  console.log(JSON.stringify({ kind: 'static-scan', ok: true, result }, null, 2));
  if (missing.length || missingFiles.length) {
    console.warn('\nNotes:');
    if (missing.length) console.warn(`- ${missing.length} env key(s) used in code are missing from .env.example`);
    if (missingFiles.length) console.warn(`- ${missingFiles.length} required file(s) missing:`, missingFiles.join(', '));
  }
  process.exit(0);
}

main();


