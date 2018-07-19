'use strict';

const chalk = require('chalk');
const program = require('commander');
const path = require('path');
const envinfo = require('envinfo');
const exportCollection = require('./lib/exportCollection');
const importCollection = require('./lib/importCollection');
const initializeApp = require('./utils/initializeApp');
const packageJson = require('../package.json');

program.version(packageJson.version);

program
  .command('export <databaseURL> [serviceAccountConfig]')
  .description('Export document(s) / collection(s) from the specified database')
  .alias('e')
  .option(
    '-c, --collections <collections>',
    'specify a particular collection to export, or a comma separated list of collection names'
  )
  .option(
    '-d, --document <document>',
    'specify a particular document to export'
  )
  .option(
    '-o, --out <filePath>',
    'specify a location to write the exported data <filePath>'
  )
  .option(
    '-b, --bucket <bucketName>',
    'specify a google storage bucket to write to'
  )
  .option(
    '-g, --bucketOptions <bucketOptionsFilePath>',
    'specify a google storage bucket to write to <bucketOptionsFilePath>\n This file is required and configuration options can be found at: https://cloud.google.com/nodejs/docs/reference/storage/1.7.x/File#createWriteStream'
  )
  .action((databaseURL, serviceAccountConfig, options) => {
    initializeApp(databaseURL, serviceAccountConfig);

    const { collection = null, document = null } = options;

    if (document && !collection) {
      console.log(
        chalk.red(
          `Error: Please specify the collection that document ${chalk.cyan(
            document
          )} belongs to in-order to export it`
        )
      );
      process.exit(1);
    } else if (!document) {
      exportCollection(
        collection,
        Object.assign({ verbose: program.verbose }, options)
      );
    }
  });

program
  .command('import <databaseURL> [serviceAccountConfig]')
  .description('Import collection(s) into the specified <databaseURL>')
  .alias('i')
  .option(
    '-p, --filePath [filePath]',
    'specify the location of the collection information [filePath]'
  )
  .option(
    '-c, --collection [collection]',
    'specify the collection [collection]'
  )
  .option(
    '-f, --force [forceOverwrite]',
    'force overwrite a given collection [forceOverwrite]',
    false
  )
  .action((databaseURL, serviceAccountConfig, options) => {
    const {
      filePath = '',
      collection = options.filePath ? path.basename(options.filePath) : null,
      force = false,
    } = options;

    if (!filePath && !collection) {
      console.log(
        chalk.red(
          `Error: FilePath or collection required to perform import.
          Please check that you've supplied a filePath using -f or --filePath or
          alternatively a collection via -c or --collection`
        )
      );
      process.exit(1);
    }

    initializeApp(databaseURL, serviceAccountConfig);

    try {
      importCollection(
        filePath || path.resolve(process.cwd(), `${collection}.jsonl`),
        collection,
        {
          force,
          verbose: program.verbose,
        }
      );
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  });

program
  .option('--verbose', 'print additional logs')
  .option('--info', 'print environment debug info')
  .on('--help', () => {
    console.log();
    console.log(`    Only ${chalk.green('<databaseURL>')} is required.`);
    console.log();
    console.log(
      `    ${chalk.green(
        '[serviceAccountConfig]'
      )} is the path to the admin sdk service account configuration.
         Or it is alternatively set via the environmental variable $GOOGLE_APPLICATION_CREDENTIALS.
         See [Authentication Getting Started](https://cloud.google.com/docs/authentication/getting-started)
      `
    );
    console.log();
    console.log(
      `    For more information on how to obtain this config see:
    [Admin SDK setup](https://firebase.google.com/docs/admin/setup)`
    );
    console.log();
    console.log(
      `    If a document is given then a collection is also required.`
    );
    console.log();
    console.log(
      `    Usage:
           export|e <databaseURL> [serviceAccountConfig] [options]
           import|i <databaseURL> [serviceAccountConfig] [options]`
    );
    console.log();
    console.log(`    Export Options:`);
    console.log(`
           -c, --collection <collectionRef>    Name of the collection to export,
           -d, --document <documentRef>        Name of the document within a given collection to export,
           -o, --out <fileName>, <filePath>    Filename and path to write the exported data to. Path defaults to process.cwd()
    `);
    console.log();
    console.log(`    Import Options:`);
    console.log(`
           -c, --collection <collectionRef>    Name of the collection to export,
           -p, --filePath <filePath>           Path to the jsonl file to import,
           -f, --force <force>                 Force import without prompt of overwrite.
    `);
    console.log(
      `    If you have any problems, do not hesitate to file an issue:`
    );
    console.log(`    ${chalk.cyan('https://github.com/')}`);
    console.log();
  });

if (program.info) {
  console.log(chalk.bold.cyan('\nEnvironment Info:'));
  envinfo
    .run(
      {
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'npm', 'Yarn'],
        Browsers: ['Chrome', 'Edge', 'Internet Explorer', 'Firefox', 'Safari'],
        npmPackages: ['react', 'react-dom', 'react-scripts'],
      },
      {
        clipboard: false,
        duplicates: true,
        showNotFound: true,
      }
    )
    .then(console.log);
}

program.parse(process.argv);
