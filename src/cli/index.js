#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const portFinder = require('portfinder');
const { Command } = require('commander');
const child_process = require('child_process');
const path = require('node:path');

const program = new Command();

const defaultPort = 3000;

function startServerOnPort(err, port, directory) {
  if (err) {
    console.error('failed to get available port', err);
    return;
  }

  const serverProcess = child_process.fork(
    path.join(__dirname, '../../dist/src/backend/index.js'),
    [directory],
    {
      stdio: 'inherit',
      shell: true,
      env: { PORT: port, NODE_ENV: 'prod' },
    },
  );
  serverProcess.on('message', function (str) {
    if (str === 'init done') {
      child_process.exec(`open http://127.0.0.1:${port}`);
    }
  });
}

program
  .name('Lune')
  .description('opens local web app for screenshot management')
  .requiredOption(
    '-d, --directory <directory>',
    'directory of the screenshots',
  );

program.parse(process.argv);

const options = program.opts();
let directory = options.directory.replace('~', process.env.HOME);

if (directory.trim()) {
  portFinder.getPort({ port: defaultPort }, (err, port) =>
    startServerOnPort(err, port, directory),
  );
} else {
  program.error('must provide directory');
}
