const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const backend = path.resolve(__dirname, '../..'), root = path.resolve(backend, '..');
const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid;
const out = path.join(root, 'testing-docs/bdd/runs', id);
fs.mkdirSync(out, { recursive: true });
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const files = [...walk(path.join(backend, 'middleware')), ...walk(path.join(backend, 'routes')),
  ...walk(__dirname), path.join(backend, 'tests/helpers/fixtures.cjs'),
  ...['cucumber.cjs', 'package.json', 'package-lock.json'].map(f => path.join(backend, f))];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hashes = Object.fromEntries(files.map(f => [path.relative(root, f).replaceAll('\\', '/'), hash(f)]));
const executable = path.join(backend, 'node_modules/@cucumber/cucumber/bin/cucumber.js');
const args = [executable, '--config', 'cucumber.cjs', ...process.argv.slice(2)];
const startedAt = new Date().toISOString();
const run = spawnSync(process.execPath, args, {
  cwd: backend, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024,
  env: { ...process.env, BDD_REPORT_DIR: path.relative(backend, out).replaceAll('\\', '/'), CUCUMBER_PUBLISH_ENABLED: 'false', FORCE_COLOR: '0' },
});
fs.writeFileSync(path.join(out, 'stdout.log'), run.stdout || '');
fs.writeFileSync(path.join(out, 'stderr.log'), run.stderr || '');
const metadata = { startedAt, finishedAt: new Date().toISOString(), command: ['node', ...args], cwd: backend,
  exitCode: run.status, signal: run.signal, launchError: run.error?.message || null, node: process.version,
  cucumber: require('@cucumber/cucumber/package.json').version, sourceHashesBefore: hashes,
  inputsUnchangedDuringRun: files.every(f => hashes[path.relative(root, f).replaceAll('\\', '/')] === hash(f)),
};
fs.writeFileSync(path.join(out, 'execution.json'), JSON.stringify(metadata, null, 2) + '\n');
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
console.log('BDD evidence: ' + path.relative(root, out));
process.exitCode = run.status === null ? 1 : run.status;

