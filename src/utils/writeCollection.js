'use strict';

const admin = require('firebase-admin');
const fs = require('fs');
const chalk = require('chalk');
const jsonl = require('./jsonl');

const write = (options = {}, cb = () => null) => collection => {
  let count = 0;

  admin
    .firestore()
    .collection(collection)
    .stream()
    .pipe(jsonl(options))
    .on('data', () => count++)
    .pipe(
      fs.createWriteStream(
        options.out || `${process.cwd()}/${collection}.jsonl`
      )
    )
    .on('finish', () => {
      console.log(`${chalk.green('Success!!')}`);

      options.verbose &&
        console.log(
          `Total documents written for ${chalk.magenta(
            collection
          )} collection: ${chalk.bold.green(count)}`
        );

      cb();
    });
};

module.exports = write;
