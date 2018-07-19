'use strict';

const inquirer = require('inquirer');
const to = require('await-to-js').default;
const admin = require('firebase-admin');
const chalk = require('chalk');

const padDate = require('../utils/padDate');
const write = require('../utils/writeCollection');

const exportCollection = async (collectionsToExport, options) => {
  const [err, collections] = await to(admin.firestore().getCollections());
  // check that the collection actually exists
  if (err) {
    console.log(chalk.red(`Error retrieving collections: ${err}`));
    process.exit(1);
  } else {
    const date = new Date();
    // build the storage path which defaults to firebase/yyyy/mm/dd/UTCtimestamp
    const storagePath =
      options.filePath ||
      `firebase/${date.getUTCFullYear()}/${padDate(
        date.getUTCMonth() + 1
      )}/${padDate(date.getUTCDate())}/${date.toISOString()}`;

    // form the path to store the exported collections
    options = Object.assign({}, options, { filePath: storagePath });
    const writeCollection = write(options);

    if (!collections.length) {
      console.log(chalk.red('No collections found'));
      process.exit(1);
    } else if (collectionsToExport) {
      // get collections specified by argv passed in
      const parsedCollections = collectionsToExport.split(',').filter(Boolean);
      console.log(
        chalk.cyan(
          `Attempting to export collections: \n${chalk.magenta(
            parsedCollections.join('\n')
          )}`
        )
      );
      parsedCollections.forEach(collection => {
        // check the provided collection exists in the database
        if (!collections.find(({ id }) => id === collection)) {
          console.log(
            chalk.red(
              `Provided collection does not exist. \nPlease check the provided database URL and/or the specified collection:\n\t ${chalk.cyan(
                `- ${collection}`
              )}`
            )
          );
        } else {
          // fetch all documents in the collection
          try {
            writeCollection(collection);
          } catch (err) {
            console.log(
              chalk.red(
                `Error while exporting documents in ${chalk.cyan(
                  collection
                )} collection: ${err}`
              )
            );
            process.exit(1);
          }
        }
      });
    } else {
      // list all collections
      const prompt = inquirer.createPromptModule();

      const [err, selections] = await to(
        prompt([
          {
            choices: collections.map(({ id }) => id),
            message:
              'Which of the following collections would you like to export?',
            name: 'ExportedCollections',
            type: 'checkbox',
          },
        ])
      );

      if (err) {
        console.log(
          chalk.magenta(`
          Error listing collections: ${err}
        `)
        );
        process.exit(1);
      }

      const selectedCollections = selections.ExportedCollections;

      if (selectedCollections.length) {
        selectedCollections.forEach(collection => {
          try {
            writeCollection(collection);
          } catch (err) {
            console.log(
              chalk.red(
                `Error while exporting documents in ${chalk.cyan(
                  collection
                )} collection: ${err}`
              )
            );
            process.exit(1);
          }
        });
      } else {
        console.log(
          chalk.magenta(`
          Aborting since no collections were chosen
        `)
        );
        process.exit(1);
      }
    }
  }
};

module.exports = exportCollection;
