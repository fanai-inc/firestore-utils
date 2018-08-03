'use strict';

const admin = require('firebase-admin');
const chalk = require('chalk');
const jsonl = require('./jsonl');
const base64 = require('base64-stream');
const PassThrough = require('stream').PassThrough;
const exitOnError = require('./exitOnError');
const createOutStream = require('./createOutStream');

const onWriteEnd = (collection, options = {}, count, cb = () => null) => () => {
  console.log(
    `${chalk.green(`Successfully exported: ${chalk.magenta(collection)}`)}`
  );

  options.verbose &&
    console.log(
      `Total documents written for ${chalk.magenta(
        collection
      )} collection: ${chalk.bold.green(count)}`
    );

  cb();
};

const onWriteFailure = err =>
  exitOnError(`Unable to write collection: ${JSON.stringify(err)}`);

const write = (options = {}, cb = () => null) => collection => {
  let count = 0;
  const collectionName = options.subCollection
    ? collection.split('/').slice(-1)[0]
    : collection;

  const outStream = createOutStream(collectionName, options);

  try {
    if (options.query) {
      const query = options.query.split(',');
      const validQuery = (query[1] || '').match(/(<=)|(>=)|(==)|(>|<)/g);

      if (query.length === 3 && validQuery) {
        admin
          .firestore()
          .collection(collection)
          .where(query[0], validQuery[0], query[query.length - 1])
          .stream()
          .pipe(jsonl(options))
          .on('data', () => count++)
          .pipe(options.bucket ? base64.encode() : new PassThrough())
          .pipe(outStream)
          .on('finish', onWriteEnd(collection, options, count, cb))
          .on('error', onWriteFailure);
      } else {
        console.warn(
          `${chalk.yellow(
            `Warning:
             query malformed (${chalk.magenta(
               options.query
             )}). It's been ignored for this export operation.
             Please verify that your query is a comma separated list and that each index corresponds
             to that specified in the docs:
             https://cloud.google.com/nodejs/docs/reference/firestore/0.15.x/Query#where

             Supported equality operators are as follows: "<", "<=", "==", ">", ">=".
             If you've provided more than one we've tried to use the first.
            `
          )}`
        );
      }
    } else {
      admin
        .firestore()
        .collection(collection)
        .stream()
        .pipe(jsonl(options))
        .on('data', () => count++)
        .pipe(options.bucket ? base64.encode() : new PassThrough())
        .pipe(outStream)
        .on('finish', onWriteEnd(collection, options, count, cb))
        .on('error', onWriteFailure);
    }
  } catch (err) {
    console.log(
      chalk.red(
        `Unable to write document(s) in collection: ${JSON.stringify(err)}`
      )
    );
  }
};

module.exports = write;
