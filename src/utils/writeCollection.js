'use strict';

const admin = require('firebase-admin');
const fs = require('fs');
const chalk = require('chalk');
const jsonl = require('./jsonl');
const path = require('path');
const base64 = require('base64-stream');
const Passthrough = require('stream').PassThrough;

const write = (options = {}, cb = () => null) => collection => {
  let count = 0;
  const outStream = (() => {
    if (options.bucket) {
      // attempt to write to GCloud Storage bucket
      try {
        const storage = require('@google-cloud/storage')();
        const bucket = storage.bucket(options.bucket);

        return bucket
          .file(`${path.normalize(`/${options.filePath}/`)}${collection}.jsonl`)
          .createWriteStream(options.bucketOptions);
      } catch (err) {
        console.log(
          chalk.red(
            `Error with bucket: ${
              options.bucket
            }. Please make sure the bucket name exists. ${JSON.stringify(err)}`
          )
        );
        process.exit(1);
      }
    } else {
      if (options.out && fs.lstatSync(options.out).isDirectory()) {
        return fs.createWriteStream(
          path.normalize(`${options.out}/${collection}.jsonl`)
        );
      } else {
        return fs.createWriteStream(
          path.normalize(options.out || `${process.cwd()}/${collection}.jsonl`)
        );
      }
    }
  })();

  try {
    admin
      .firestore()
      .collection(collection)
      .stream()
      .pipe(jsonl(options))
      .on('data', () => count++)
      .pipe(options.bucket ? base64.encode() : new Passthrough())
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
