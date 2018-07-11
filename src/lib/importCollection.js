const fs = require('fs');
const path = require('path');
const readline = require('readline');
const admin = require('firebase-admin');
const chalk = require('chalk');
const inquirer = require('inquirer');
const to = require('await-to-js').default;

const importCollection = async (filePath, collectionName, options = {}) => {
  if (!options.force) {
    const prompt = inquirer.createPromptModule();

    const [err, choice] = await to(
      prompt([
        {
          message:
            'Importing will overwrite all documents within the collection. Proceed (y/n).',
          name: 'overwrite',
          type: 'confirm',
        },
      ])
    );

    if (err) {
      console.log(chalk.red(`Unknown Error`));
      process.exit(1);
    } else {
      if (choice.overwrite) {
        writeCollection(filePath, collectionName, options);
      } else {
        process.exit(0);
      }
    }
  } else {
    writeCollection(filePath, collectionName, options);
  }
};

const writeCollection = (filePath, collectionName, options) => {
  const { encoding = 'utf8', objectMode = true, highWaterMark } = options;

  const input = fs
    .createReadStream(filePath, { encoding, objectMode, highWaterMark })
    .on('error', err => console.log(`${chalk.red(err)}`));

  const rl = readline.createInterface({ input });

  console.log(
    `Preparing batch write of document(s) in: ${chalk.cyan(
      path.basename(filePath)
    )}`
  );

  const db = admin.firestore();
  const batch = db.batch();
  const collection = db.collection(collectionName);
  let documentCount = 0;

  rl.on('line', line => {
    const { id, data } = JSON.parse(line);
    batch.set(collection.doc(id), data, { merge: true });

    if (options.verbose) {
      console.log(`Storing document: ${chalk.cyan(id)}`);
    }

    documentCount++;
  }).on('close', async () => {
    const [err, res] = await to(batch.commit());

    if (err) {
      console.log(`Batch write failed: ${chalk.red(err)}`);
      process.exit(1);
    }

    if (options.verbose) {
      console.log(`\nResult of batch write operation:\n`);
      res.forEach(v => console.log(JSON.stringify(v)));
    }

    console.log(`\n${chalk.green('Success!!')}\n`);
    console.log(
      `Wrote ${chalk.red(documentCount)} documents to the ${chalk.cyan(
        collectionName
      )} collection.`
    );

    process.exit(0);
  });
};

module.exports = importCollection;
