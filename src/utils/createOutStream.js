'use strict';

const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const exitOnError = require('./exitOnError');

const outStream = (fileName, options = {}) => {
  if (options.bucket) {
    // attempt to write to GCloud Storage bucket
    try {
      const storage = require('@google-cloud/storage')();
      const bucket = storage.bucket(options.bucket);

      return bucket
        .file(
          `${path.normalize(
            `/${(options.filePath || '').trim()}/`
          )}${fileName}.jsonl`
        )
        .createWriteStream(options.bucketOptions);
    } catch (err) {
      exitOnError(
        chalk.red(
          `Error with bucket: ${
            options.bucket
          }. Please make sure the bucket exists. ${JSON.stringify(err)}`
        )
      );
    }
  } else {
    const outPath =
      options.out && fs.lstatSync(options.out).isDirectory()
        ? `${options.out}/${fileName}.jsonl`
        : options.out || `${process.cwd()}/${fileName}.jsonl`;

    return fs.createWriteStream(path.normalize(outPath));
  }
};

module.exports = outStream;
