#!/usr/bin/env node

const yargs = require("yargs");
const fs = require('fs');
const homedir = require('os').homedir();
const readline = require('readline');
const logswall = require('logswall');

const LOGSWALL_FOLDER = homedir + "/.logswall";
const LOGSWALL_CONFIG_FILE = LOGSWALL_FOLDER + '/config.json';

const configFileExists = fs.existsSync(LOGSWALL_CONFIG_FILE);
const demandOption = !configFileExists;

let config;

if (configFileExists) {
    try {
        const configContent = fs.readFileSync(LOGSWALL_CONFIG_FILE, 'utf8');
        config = JSON.parse(configContent) || {};
    } catch {
        config = {};
    }
}

const options = yargs
    .usage("Usage: -p <project key> -q <queue key> [--set-default]")
    .option("p", { alias: "key", describe: "Key", type: "string", demandOption })
    .option("q", { alias: "queue", describe: "Queue", type: "string", demandOption })
    .option("d", { alias: "set-default", describe: "Set default project and queue", type: "boolean", demandOption: false })
    .argv;

config.key = options.key || config.key;
config.queue = options.queue || config.queue;

if (options.setDefault) {
    if (!fs.existsSync(LOGSWALL_FOLDER)) {
        fs.mkdirSync(LOGSWALL_FOLDER);
    }

    fs.writeFileSync(LOGSWALL_CONFIG_FILE, JSON.stringify({ queue: config.queue, key: config.key }), { mode: 0o755 });
}

const $ = logswall.Console({ queue: config.queue, key: config.key });

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function (line) {
    $.console.log(line);
    console.log(line);
})

rl.on('close', function () {
    $.done();
})