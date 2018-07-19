'use-strict';

const chalk = require('chalk');
const fs = require('fs');
const admin = require('firebase-admin');

const initializeApp = (databaseURL, serviceAccountConfig, options) => {
  console.log(chalk.cyan(`Connecting to firestore project...`));
  let config =
    serviceAccountConfig || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!config && !options.useApplicationDefault) {
    console.log(
      chalk.red(`
      Error initializing firebase project:

      No path to a service config provided or
      required environmental variable not set.

      Please provide a path to a valid service config as specified in the documentation or
      make sure the following environmental variable is present in the node process:

      - ${chalk.bold.cyan('GOOGLE_APPLICATION_CREDENTIALS')}
      `)
    );

    process.exit(1);
  }

  if (config) {
    // assume file path rather than json
    if (!/(^{|^"{)/.test(config)) {
      config = fs.readFileSync(config, 'utf8', err => {
        if (err) {
          console.log(
            chalk.red(`Unable to read service account config: ${err}`)
          );
          process.exit(1);
        }
      });
    }

    try {
      config = JSON.parse(config);
    } catch (err) {
      console.log(
        chalk.red(
          `Unable to parse service account config please make sure the config is valid JSON: ${err}`
        )
      );
      process.exit(1);
    }
  }

  try {
    admin.initializeApp({
      credential:
        (config && admin.credential.cert(config)) ||
        (options.useApplicationDefault &&
          admin.credential.applicationDefault()),
      databaseURL,
    });
    console.log(chalk.green(`Connection successful!!!`));
  } catch (err) {
    console.log(chalk.red(`Error initializing firebase project: ${err}`));
    process.exit(1);
  }
};

module.exports = initializeApp;
