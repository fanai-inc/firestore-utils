'use strict';

const admin = require('firebase-admin');
const fs = require('fs');
const chalk = require('chalk');
const jsonl = require('./jsonl');
const path = require('path');
const base64 = require('base64-stream');

const write = (options = {}, cb = () => null) => collection => {
  let count = 0;
  const outStream = (() => {
    if (options.bucket) {
      // attempt to write to GCloud Storage bucket
      const storage = require('@google-cloud/storage')();
      const bucket = storage.bucket(options.bucket);

      return bucket
        .file(
          `${path.normalize(
            `/${options.filePath || process.cwd()}/`
          )}${collection}.jsonl`
        )
        .createWriteStream(options.bucketOptions);
    } else {
      return fs.createWriteStream(
        options.out || `${process.cwd()}/${collection}.jsonl`
      );
    }
  })();

  try {
    admin
      .firestore()
      .collection(collection)
      .stream()
      .pipe(jsonl(options))
      .on('data', () => count++)
      .pipe(base64.encode())
      .pipe(outStream)
      .on('finish', () => {
        console.log(
          `${chalk.green(
            `Successfully exported: ${chalk.magenta(collection)}`
          )}`
        );

        options.verbose &&
          console.log(
            `Total documents written for ${chalk.magenta(
              collection
            )} collection: ${chalk.bold.green(count)}`
          );

        cb();
      })
      .on('error', err => {
        console.log(
          chalk.red(`Unable to write collection: ${JSON.stringify(err)}`)
        );
        process.exit(1);
      });
  } catch (err) {
    console.log(
      chalk.red(`Unable to write collection: ${JSON.stringify(err)}`)
    );
  }
};

module.exports = write;
