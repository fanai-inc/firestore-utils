'use strict';

const inquirer = require('inquirer');
const to = require('await-to-js').default;
const admin = require('firebase-admin');
const chalk = require('chalk');

const write = require('../utils/writeCollection');

const exportCollection = async (collection, options) => {
  const [err, collections] = await to(admin.firestore().getCollections());
  // check that the collection actually exists
  if (err) {
    console.log(chalk.red(`Error retrieving collections: ${err}`));
    process.exit(1);
  } else {
    if (!collections.length) {
      console.log(chalk.red('No collections found'));
      process.exit(1);
    } else if (collection) {
      // check the provided collection exists in the database
      if (!collections.find(({ id }) => id === collection)) {
        console.log(
          chalk.red(
            `Provided collection does not exist. Please check the provided database URL and/or the specified collection`,
          ),
        );
        process.exit(1);
      } else {
        // fetch all documents in the collection
        try {
          write(options)(collection);
        } catch (e) {
          console.log(
            chalk.red(
              `Error while writing documents in ${chalk.cyan(
                collection,
              )} collection: ${err}`,
            ),
          );
          process.exit(1);
        }
      }
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
        ]),
      );

      if (err) {
        console.log(
          chalk.magenta(`
          Error listing collections: ${err}
        `),
        );
        process.exit(1);
      }

      const selectedCollections = selections.ExportedCollections;

      if (selectedCollections.length) {
        selectedCollections.forEach(write(options));
      } else {
        console.log(
          chalk.magenta(`
          Aborting since no collections were chosen
        `),
        );
        process.exit(1);
      }
    }
  }
};

module.exports = exportCollection;
