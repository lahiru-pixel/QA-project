// Invoke through npm run test:record so npm_execpath identifies the current npm.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const [stage, script, ...args] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(stage || '') || !['test', 'test:coverage'].includes(script)) {
  throw new Error('Usage: npm run test:record -- <unique-stage> <test|test:coverage> [Jest arguments]');
}
const backend = path.resolve(__dirname, '../..');
const root = path.resolve(backend, '..');
const output = path.join(root, 'testing-docs/unit-testing/evidence', stage);
if (fs.existsSync(output)) throw new Error('Evidence directory already exists; choose a new stage name');
fs.mkdirSync(output, { recursive: true });
function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const inputs = [
  ...filesIn(path.join(backend, 'middleware')), ...filesIn(path.join(backend, 'routes')),
  ...filesIn(path.join(backend, 'tests')),
  path.join(backend, 'jest.config.cjs'), path.join(backend, 'package.json'), path.join(backend, 'package-lock.json'),
];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before = Object.fromEntries(inputs.map(f => [path.relative(root, f).replaceAll('\\', '/'), hash(f)]));
for (const file of ['middleware/authenticate.js', 'tests/unit/authenticate-null-user.test.cjs']) {
  fs.copyFileSync(path.join(backend, file), path.join(output, path.basename(file) + '.txt'));
}
const npmArgs = script === 'test' ? ['test'] : ['run', script];
npmArgs.push('--', ...args, '--json', '--outputFile=' + path.join(output, 'jest-results.json'));
const startedAt = new Date().toISOString();
const run = spawnSync(process.execPath, [process.env.npm_execpath, ...npmArgs], {
  cwd: backend, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' }, maxBuffer: 20 * 1024 * 1024,
});
fs.writeFileSync(path.join(output, 'stdout.log'), run.stdout || '');
fs.writeFileSync(path.join(output, 'stderr.log'), run.stderr || '');
const metadata = {
  startedAt, finishedAt: new Date().toISOString(), cwd: backend,
  command: ['npm', ...npmArgs], exitCode: run.status, signal: run.signal,
  launchError: run.error ? run.error.message : null, node: process.version,
  jest: require('jest/package.json').version, sourceHashesBefore: before,
  inputsUnchangedDuringRun: inputs.every(f => before[path.relative(root, f).replaceAll('\\', '/')] === hash(f)),
};
fs.writeFileSync(path.join(output, 'execution.json'), JSON.stringify(metadata, null, 2) + '\n');
process.stdout.write(run.stdout || '');
process.stderr.write(run.stderr || '');
console.log('Saved genuine run evidence: ' + path.relative(root, output));
process.exitCode = run.status === null ? 1 : run.status;

