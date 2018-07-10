'use strict';

const { Transform } = require('stream');
const chalk = require('chalk');

const jsonl = (options = {}) =>
  new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, encoding = 'utf8', callback) {
      options.verbose &&
        console.log(
          'Exporting document: ',
          chalk.cyan(
            `{"id": "${chunk.id}", "data": ${JSON.stringify(chunk.data())}}\n`,
          ),
        );
      callback(
        null,
        `{"id": "${chunk.id}", "data": ${JSON.stringify(chunk.data())}}\n`,
      );
    },
  });

module.exports = jsonl;
