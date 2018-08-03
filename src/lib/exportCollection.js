'use strict';

const inquirer = require('inquirer');
const to = require('await-to-js').default;
const admin = require('firebase-admin');
const chalk = require('chalk');
const minimatch = require('minimatch');

const formFilePath = require('../utils/formFilePath');
const write = require('../utils/writeCollection');
const exitOnError = require('../utils/exitOnError');

const exportCollection = async (collectionLookupPattern, options = {}) => {
  // query all root level collections
  const [err, collections] = await to(admin.firestore().getCollections());

  if (err) {
    exitOnError(`Error retrieving collections: ${err}`);
  }

  let collectionsToExport = [];
  let subCollection = false;

  // if the lookupPattern is in the format of col/[col|doc]+
  // assume the lookup pattern is to a specific subcollection
  if (
    collectionLookupPattern &&
    collectionLookupPattern.split('/').filter(Boolean).length > 1
  ) {
    try {
      const collectionRef = admin
        .firestore()
        .collection(collectionLookupPattern);

      // verify the collection was found and if it has a parent then we know this is a subcollection
      if (collectionRef && collectionRef.parent) {
        collectionsToExport = [collectionRef.path];
        subCollection = true;
      } else {
        // log error since this is a document an not a subcollection
        exitOnError(
          `Error retrieving collection, please verify that the path provided points to a collectionRef and not a document`
        );
      }
    } catch (err) {
      exitOnError(err);
    }
  } else {
    // filter collections specified by glob using minimatch https://www.npmjs.com/package/minimatch
    collectionsToExport = minimatch
      .match(
        collections.map(({ id }) => id),
        collectionLookupPattern || '*',
        (options.glob = {})
      )
      .filter(Boolean);

    // prompt the user with collections they can export
    if (options.cli) {
      // list all collections
      const prompt = inquirer.createPromptModule();

      const [err, selections] = await to(
        prompt([
          {
            choices: collectionsToExport,
            message:
              'Which of the following collections would you like to export?',
            name: 'ExportedCollections',
            type: 'checkbox',
          },
        ])
      );

      if (err) {
        exitOnError(chalk.magenta(`Error listing collections: ${err}`));
      }

      collectionsToExport = selections.ExportedCollections;

      if (!collectionsToExport.length) {
        exitOnError(
          chalk.magenta(`
        Aborting since no collections were chosen
        `)
        );
      }
    }
  }

  // exit if no collections are found when a lookup returns no matches
  if (!collectionsToExport.length) {
    exitOnError(
      `No collections found based on the provided lookup pattern supplied: ${collectionLookupPattern}`
    );
  }

  console.log(
    chalk.cyan(
      `Attempting to export ${
        subCollection ? 'subcollection' : 'collection(s)'
      }:

    ${chalk.magenta(collectionsToExport.join('\n'))}
      `
    )
  );

  // form the path to store the exported collections
  const writeCollection = write(
    Object.assign({}, options, {
      filePath: options.filePath || formFilePath(),
      subCollection,
    })
  );

  collectionsToExport.forEach(collection => {
    // fetch all documents in the collection
    try {
      writeCollection(collection);
    } catch (err) {
      exitOnError(
        chalk.red(
          `Error while exporting documents in ${chalk.cyan(
            collection
          )} collection: ${err}`
        )
      );
    }
  });
};

module.exports = exportCollection;
