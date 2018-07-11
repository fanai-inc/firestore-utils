'use-strict';

const chalk = require('chalk');
const fs = require('fs');
const admin = require('firebase-admin');

const initializeApp = (databaseURL, serviceAccountConfig) => {
  console.log(chalk.cyan(`Connecting to firestore project...`));

  let config;

  // if a path to a service config is provided then load that in here
  if (serviceAccountConfig) {
    config = fs.readFileSync(serviceAccountConfig, err => {
      if (err) {
        console.log(chalk.red(`Unable to read service account config: ${err}`));
        process.exit(1);
      }
    });

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
  } else if (
    process.env.FIREBASE_PROJECT &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_EMAIL_ID
  ) {
    // else use the environmental variables if provided
    config = require('./generateServiceConfig');
  } else {
    console.log(
      chalk.red(`
      Error initializing firebase project:

      No path to a service config provided or
      required environmental variables not found.

      Please provide a path to a valid service config as specified in the documentation or
      make sure the following environmental variables are present in the node process:

      - ${chalk.bold.cyan('FIREBASE_PROJECT')}
      - ${chalk.bold.cyan('FIREBASE_PRIVATE_KEY')}
      - ${chalk.bold.cyan('FIREBASE_EMAIL_ID')}
      `)
    );

    process.exit(1);
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(config),
      databaseURL,
    });
  } catch (err) {
    console.log(chalk.red(`Error initializing firebase project: ${err}`));
    process.exit(1);
  }
};

module.exports = initializeApp;
