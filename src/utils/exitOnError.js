'use strict';

const chalk = require('chalk');

const exitOnError = message => {
  console.log(chalk.red(message));
  process.exit(1);
};

module.exports = exitOnError;
