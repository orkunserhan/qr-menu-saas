const fs = require('fs');
const path = require('path');

function scanDir(dir, keys) {
  if (!keys) keys = new Set();
  if (!fs.existsSync(dir)) return keys;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    const skip = ['node_modules', '.next', 'public', '.git'];
    if (item.isDirectory() && !skip.includes(item.name)) {
      scanDir(full, keys);
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) && !item.name.endsWith('.d.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const re = /\bt\(['`"]([a-zA-Z0-9._-]+)['`"]\)/g;
      let m;
      while ((m = re.exec(content)) !== null) keys.add(m[1]);
    }
  }
  return keys;
}

function getKeys(obj, prefix) {
  if (!prefix) prefix = '';
  let keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

console.log('=== GLOBAL i18n AUDIT ===\n');

const usedKeys = scanDir('.');
console.log('Unique t() key calls found in code: ' + usedKeys.size);

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const enKeys = new Set(getKeys(en));
console.log('EN total flat keys: ' + enKeys.size);

console.log('\n=== PER-LANGUAGE PARITY CHECK ===');
const langs = ['de', 'it', 'sk', 'fr'];
langs.forEach(function(lang) {
  const other = JSON.parse(fs.readFileSync('messages/' + lang + '.json', 'utf8'));
  const otherKeys = new Set(getKeys(other));
  const missing = Array.from(enKeys).filter(function(k) { return !otherKeys.has(k); });
  const extra = Array.from(otherKeys).filter(function(k) { return !enKeys.has(k); });
  const status = missing.length === 0 && extra.length === 0 ? 'PERFECT' : 'NEEDS FIX';
  console.log('\n' + lang.toUpperCase() + ': ' + otherKeys.size + ' keys | missing=' + missing.length + ' | extra=' + extra.length + ' | ' + status);
  if (missing.length > 0) {
    missing.forEach(function(k) { console.log('  MISSING: ' + k); });
  }
});

console.log('\n=== AUTH SECTION DETAIL ===');
['en','de','it','sk','fr'].forEach(function(l) {
  const d = JSON.parse(fs.readFileSync('messages/'+l+'.json','utf8'));
  const authKeys = Object.keys(d.auth || {});
  console.log(l.toUpperCase() + ' auth(' + authKeys.length + '): ' + authKeys.join(', '));
});
