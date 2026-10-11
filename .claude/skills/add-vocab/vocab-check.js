#!/usr/bin/env node
// Usage (from repo root):
//   node .claude/skills/add-vocab/vocab-check.js list              # all existing words by deck
//   node .claude/skills/add-vocab/vocab-check.js dup "w1" "w2" ... # report which words already exist
//   node .claude/skills/add-vocab/vocab-check.js verify [expected]  # parse <script>, validate rows, print card count
const fs = require('fs'), vm = require('vm');
const file = process.env.VOCAB_FILE || 'vocab-app.html';
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const norm = s => s.trim().toLowerCase().replace(/\s+/g, ' ');
const m = html.match(/const DECKS = \[[\s\S]*?\n\];/);
if (!m) { console.error('DECKS not found'); process.exit(1); }
const DECKS = vm.runInNewContext(m[0].replace('const DECKS =', 'DECKS =') + ';DECKS');
const rows = DECKS.flatMap(d => d.raw.split('\n').filter(l => l.trim()).map(l => ({deck: d.id, line: l, p: l.split('|').map(s => s.trim())})));
const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'list') {
  DECKS.forEach(d => console.log(d.id + ' (' + d.name + '): ' + rows.filter(r => r.deck === d.id).map(r => r.p[0]).join(', ')));
  console.log('TOTAL', rows.length);
} else if (cmd === 'dup') {
  const have = new Map(rows.map(r => [norm(r.p[0]), r.deck]));
  const seen = new Set();
  args.forEach(w => {
    const k = norm(w);
    console.log((have.has(k) ? 'DUP(' + have.get(k) + ')' : seen.has(k) ? 'DUP(input)' : 'NEW') + '\t' + w);
    seen.add(k);
  });
} else if (cmd === 'verify') {
  scripts.forEach((s, i) => new vm.Script(s, {filename: 'script#' + i}));
  let bad = 0; const keys = new Set();
  rows.forEach(r => {
    const ok = r.p.length === 6 && r.p.every(Boolean) && /^\/.+\/$/.test(r.p[2]) && /\*[^*]+\*/.test(r.p[4]) && !/`|\$\{/.test(r.line);
    const k = norm(r.p[0]);
    if (!ok || keys.has(k)) { bad++; console.log('WARN (check if it is a new row):', r.deck, r.line); }
    keys.add(k);
  });
  console.log('scripts parse OK; cards =', rows.length, bad ? '; warnings = ' + bad : '');
  if ((args[0] && +args[0] !== rows.length)) process.exit(1);
} else { console.error('usage: list | dup <words...> | verify [expectedCount]'); process.exit(1); }
