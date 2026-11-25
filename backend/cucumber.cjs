const path = require('node:path');
const fs = require('node:fs');
const reports = process.env.BDD_REPORT_DIR || '../testing-docs/bdd/latest';
fs.mkdirSync(path.resolve(__dirname, reports), { recursive: true });
module.exports = {
  default: {
    paths: ['tests/bdd/features/**/*.feature'],
    require: ['tests/bdd/support/world.cjs', 'tests/bdd/steps/**/*.cjs'],
    parallel: 0,
    retry: 0,
    publish: false,
    format: [
      'progress',
      'json:' + reports + '/cucumber.json',
      'html:' + reports + '/cucumber.html',
      'message:' + reports + '/messages.ndjson',
    ],
  },
};

