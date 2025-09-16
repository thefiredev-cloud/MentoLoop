/*
  Static code scan for common issues without building or installing deps.
  - Unresolved relative/@ alias imports
  - Placeholder links (href="#") and <Link href="#">
  - <button> without explicit type attribute
  - Suspicious onClick handlers (empty/no-op)
  - Console logging in app/convex/components (excluding tests/scripts)
  - TypeScript escape hatches (@ts-ignore/@ts-expect-error), eslint disables
  - TODO/FIXME/HACK markers
  - process.env usage vs .env.example keys
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const SRC_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.d.ts'];
const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', '.netlify', 'dist', 'build', '.vercel', '.vscode', 'coverage', 'convex-backup-20250825-124913'
]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.DS_Store')) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      files = files.concat(walk(full));
    } else {
      files.push(rel);
    }
  }
  return files;
}

function read(file) {
  try { return fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch { return ''; }
}

function isSource(file) {
  return SRC_EXTS.includes(path.extname(file));
}

function resolveImport(fromFile, imp) {
  // Supports relative (./, ../) and alias '@/...'
  let base;
  if (imp.startsWith('./') || imp.startsWith('../')) {
    base = path.resolve(path.dirname(path.join(ROOT, fromFile)), imp);
  } else if (imp.startsWith('@/')) {
    base = path.resolve(ROOT, imp.replace(/^@\//, ''));
  } else {
    return { resolved: true, tried: [] }; // external module
  }

  const tried = [];
  // if exact file exists
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return { resolved: true, tried };
  // try with extensions
  for (const ext of SRC_EXTS) {
    const p = base + ext;
    tried.push(path.relative(ROOT, p));
    if (fs.existsSync(p)) return { resolved: true, tried };
  }
  // try index files in directory
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    for (const ext of SRC_EXTS) {
      const p = path.join(base, 'index' + ext);
      tried.push(path.relative(ROOT, p));
      if (fs.existsSync(p)) return { resolved: true, tried };
    }
  }
  return { resolved: false, tried };
}

function collectEnvExampleKeys() {
  const examplePath = path.join(ROOT, '.env.example');
  if (!fs.existsSync(examplePath)) return new Set();
  const content = fs.readFileSync(examplePath, 'utf8');
  const keys = new Set();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) keys.add(trimmed.slice(0, idx));
  }
  return keys;
}

function scan() {
  const files = walk(ROOT).filter(f => !f.includes('tests' + path.sep));
  const sourceFiles = files.filter(isSource);

  const unresolvedImports = [];
  const placeholderLinks = [];
  const buttonsMissingType = [];
  const noopOnClicks = [];
  const consoleLogs = [];
  const tsEscapes = [];
  const eslintDisables = [];
  const todos = [];
  const anyUsages = [];
  const envUsages = new Map(); // key -> Set(files)
  const clientEnvMisuse = []; // { file, line, key }

  // Preload all contents to avoid repeated IO
  const contents = new Map();
  for (const f of sourceFiles) contents.set(f, read(f));

  // Import resolution and various scans
  const importRe = /\bimport\s+(?:[^'"()]+?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportRe = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  const linkHrefRe = /<(?:a|Link)([^>]*?)href=\{?(["'])#\2\}?/g;
  // Only match native <button>, not React components like <Button>
  const buttonTagRe = /<button\b([\s\S]*?)>/g;
  const onClickNoopRes = [
    /onClick=\{\s*\(.*?\)\s*=>\s*\{\s*\}\s*\}/gs,
    /onClick=\{\s*\(.*?\)\s*=>\s*null\s*\}/gs,
    /onClick=\{\s*\(.*?\)\s*=>\s*undefined\s*\}/gs
  ];
  const consoleRe = /\bconsole\.(?:log|debug|trace)\s*\(/g;
  const tsIgnoreRe = /@ts-(?:ignore|expect-error)/g;
  const eslintDisableRe = /eslint-disable(?:-next-line)?/g;
  const todoRe = /\b(?:TODO|FIXME|HACK|XXX)\b/g;
  const anyRe = /(?::\s*any\b|\bas\s+any\b)/g;
  const envRe = /process\.env\.([A-Z0-9_]+)/g;

  for (const f of sourceFiles) {
    const text = contents.get(f) || '';
    const isClient = /^['\"]use client['\"];?\s*/.test(text);
    // imports
    let m;
    // Skip generated type output to reduce noise
    const skipUnresolved = f.startsWith(`convex${path.sep}_generated${path.sep}`);
    if (!skipUnresolved) {
      importRe.lastIndex = 0;
      while ((m = importRe.exec(text))) {
        const spec = m[1];
        const { resolved, tried } = resolveImport(f, spec);
        if (!resolved) unresolvedImports.push({ file: f, spec, tried });
      }
      dynamicImportRe.lastIndex = 0;
      while ((m = dynamicImportRe.exec(text))) {
        const spec = m[1];
        const { resolved, tried } = resolveImport(f, spec);
        if (!resolved) unresolvedImports.push({ file: f, spec, tried });
      }
    }

    // placeholder links
    linkHrefRe.lastIndex = 0;
    let link;
    while ((link = linkHrefRe.exec(text))) {
      const snippet = text.slice(Math.max(0, link.index - 40), Math.min(text.length, link.index + 80)).replace(/\s+/g, ' ');
      placeholderLinks.push({ file: f, line: lineNumberAt(text, link.index), snippet });
    }

    // button type
    buttonTagRe.lastIndex = 0;
    let btn;
    while ((btn = buttonTagRe.exec(text))) {
      const attrs = btn[1] || '';
      // consider up to the closing of the start tag; attrs may span lines
      if (!/\btype\s*=/.test(attrs)) {
        buttonsMissingType.push({ file: f, line: lineNumberAt(text, btn.index), snippet: `<button${attrs.slice(0, 100)}>` });
      }
    }

    // onClick no-op
    for (const re of onClickNoopRes) {
      re.lastIndex = 0;
      let mm;
      while ((mm = re.exec(text))) {
        noopOnClicks.push({ file: f, line: lineNumberAt(text, mm.index) });
      }
    }

    // console logs (exclude tests/ and scripts/)
    if (!/^tests[\/]/.test(f) && !/^scripts[\/]/.test(f)) {
      consoleRe.lastIndex = 0;
      let cc;
      while ((cc = consoleRe.exec(text))) {
        consoleLogs.push({ file: f, line: lineNumberAt(text, cc.index) });
      }
    }

    // ts ignores
    tsIgnoreRe.lastIndex = 0;
    let ti;
    while ((ti = tsIgnoreRe.exec(text))) {
      tsEscapes.push({ file: f, line: lineNumberAt(text, ti.index) });
    }

    // eslint disables
    eslintDisableRe.lastIndex = 0;
    let ed;
    while ((ed = eslintDisableRe.exec(text))) {
      eslintDisables.push({ file: f, line: lineNumberAt(text, ed.index) });
    }

    // todos
    todoRe.lastIndex = 0;
    let td;
    while ((td = todoRe.exec(text))) {
      todos.push({ file: f, line: lineNumberAt(text, td.index) });
    }

    // any usage
    anyRe.lastIndex = 0;
    let au;
    while ((au = anyRe.exec(text))) {
      anyUsages.push({ file: f, line: lineNumberAt(text, au.index) });
    }

    // env usage
    envRe.lastIndex = 0;
    let ev;
    while ((ev = envRe.exec(text))) {
      const key = ev[1];
      if (!envUsages.has(key)) envUsages.set(key, new Set());
      envUsages.get(key).add(f);
      const clientAllowed = new Set(['NODE_ENV']);
      if (isClient && !key.startsWith('NEXT_PUBLIC_') && !clientAllowed.has(key)) {
        clientEnvMisuse.push({ file: f, line: lineNumberAt(text, ev.index), key });
      }
    }
  }

  const exampleKeys = collectEnvExampleKeys();
  const usedEnvKeys = new Set(envUsages.keys());
  const missingInExample = [...usedEnvKeys].filter(k => !exampleKeys.has(k)).sort();
  const unusedInCode = [...exampleKeys].filter(k => !usedEnvKeys.has(k)).sort();

  return {
    unresolvedImports,
    placeholderLinks,
    buttonsMissingType,
    noopOnClicks,
    consoleLogs,
    tsEscapes,
    eslintDisables,
    todos,
    anyUsages,
    env: {
      used: [...usedEnvKeys].sort(),
      missingInExample,
      unusedInCode,
    },
    clientEnvMisuse,
  };
}

function lineNumberAt(text, index) {
  // 1-based line number
  let n = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

function main() {
  const result = scan();
  const out = [];
  function header(title) { out.push(`\n=== ${title} ===`); }
  function item(file, line, extra) {
    const loc = line ? `${file}:${line}` : file;
    out.push(`- ${loc}${extra ? ` -> ${extra}` : ''}`);
  }

  header('Unresolved Imports');
  if (result.unresolvedImports.length === 0) out.push('(none)');
  else for (const u of result.unresolvedImports) item(u.file, null, `${u.spec} (tried: ${u.tried.join(', ')})`);

  header('Placeholder Links (href="#")');
  if (result.placeholderLinks.length === 0) out.push('(none)');
  else for (const p of result.placeholderLinks) item(p.file, p.line, p.snippet);

  header('Buttons Missing type= attribute');
  if (result.buttonsMissingType.length === 0) out.push('(none)');
  else for (const b of result.buttonsMissingType) item(b.file, b.line, b.snippet);

  header('No-op onClick handlers');
  if (result.noopOnClicks.length === 0) out.push('(none)');
  else for (const n of result.noopOnClicks) item(n.file, n.line);

  header('Console logging (non-test/scripts)');
  if (result.consoleLogs.length === 0) out.push('(none)');
  else for (const c of result.consoleLogs) item(c.file, c.line);

  header('TypeScript escape hatches (@ts-ignore/@ts-expect-error)');
  if (result.tsEscapes.length === 0) out.push('(none)');
  else for (const t of result.tsEscapes) item(t.file, t.line);

  header('ESLint disables');
  if (result.eslintDisables.length === 0) out.push('(none)');
  else for (const e of result.eslintDisables) item(e.file, e.line);

  header('TODO/FIXME/HACK markers');
  if (result.todos.length === 0) out.push('(none)');
  else for (const t of result.todos) item(t.file, t.line);

  header('any usage');
  if (result.anyUsages.length === 0) out.push('(none)');
  else for (const a of result.anyUsages) item(a.file, a.line);

  header('Env usage');
  out.push(`Used keys (${result.env.used.length}): ${result.env.used.join(', ')}`);
  out.push(`Missing in .env.example (${result.env.missingInExample.length}): ${result.env.missingInExample.join(', ') || '(none)'}`);
  out.push(`Unused in code (${result.env.unusedInCode.length}): ${result.env.unusedInCode.join(', ') || '(none)'}`);
  header('Client env misuse (non NEXT_PUBLIC_)');
  if (result.clientEnvMisuse.length === 0) out.push('(none)');
  else for (const m of result.clientEnvMisuse) item(m.file, m.line, m.key);

  console.log(out.join('\n'));
}

main();
