const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const locales = ['pt', 'en', 'fr', 'es'];

function loadTranslations() {
  const source = fs.readFileSync(path.join(root, 'src/i18n/translations.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const sandbox = {
    exports: {},
    require(id) {
      if (id === '@/types') return {};
      return require(id);
    },
  };
  vm.runInNewContext(compiled, sandbox);
  return sandbox.exports.translations;
}

function walk(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(item.name)) continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...walk(fullPath));
    if (item.isFile() && /\.(tsx?|jsx?)$/.test(item.name)) files.push(fullPath);
  }
  return files;
}

function hasKey(tree, key) {
  let cursor = tree;
  for (const part of key.split('.')) {
    if (!cursor || typeof cursor !== 'object' || !(part in cursor)) return false;
    cursor = cursor[part];
  }
  return typeof cursor === 'string';
}

const translations = loadTranslations();
const files = [...walk(path.join(root, 'app')), ...walk(path.join(root, 'src'))];
const keyPattern = /\bt\(\s*['"]([^'"]+)['"]/g;
const keys = new Set();

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = keyPattern.exec(text))) keys.add(match[1]);
}

const missing = [];
for (const key of [...keys].sort()) {
  for (const locale of locales) {
    if (!hasKey(translations[locale], key)) missing.push(`${locale}:${key}`);
  }
}

console.log(`checked=${keys.size}`);
if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
console.log('missing=0');
