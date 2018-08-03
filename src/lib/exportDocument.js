'use strict';

const to = require('await-to-js').default;
const admin = require('firebase-admin');
const chalk = require('chalk');
const PassThrough = require('stream').PassThrough;
const base64 = require('base64-stream');

const exitOnError = require('../utils/exitOnError');
const formFilePath = require('../utils/formFilePath');
const createOutStream = require('../utils/createOutStream');

const exportDocument = async (documentLookupPattern, options = {}) => {
  if (documentLookupPattern.split('/').filter(Boolean).length % 2) {
    exitOnError(`
    Argument "documentPath" must point to a document, but was:

      ${chalk.cyan(documentLookupPattern)}

    Your path does not contain an even number of components.
    `);
  }
  // query the db for the document at the path provided
  const [err, document] = await to(
    admin
      .firestore()
      .doc(documentLookupPattern)
      .get()
  );

  if (err) {
    exitOnError(`Error retrieving document: ${err}`);
  }

  // exit if no document is found at the specified path
  if (!document.exists) {
    exitOnError(
      `No document found based on the provided lookup pattern supplied: ${documentLookupPattern}`
    );
  } else {
    console.log(
      chalk.cyan(
        `Attempting to export ${document.id}:
        `
      )
    );

    const bufferStream = new PassThrough();

    const outStream = createOutStream(
      document.id,
      Object.assign({}, options, {
        filePath: options.filePath || formFilePath(),
      })
    );

    bufferStream.write(JSON.stringify(document.data()), 'utf8');

    bufferStream
      .pipe(options.bucket ? base64.encode() : new PassThrough())
      .pipe(outStream);

    bufferStream.end(err => {
      if (err) {
        exitOnError(`Unable to write document: ${JSON.stringify(err)}`);
      } else {
        console.log(
          chalk.green(`Successfully exported: ${chalk.magenta(document.id)}`)
        );
      }
    });
  }
};

module.exports = exportDocument;
