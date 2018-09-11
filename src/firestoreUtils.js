'use strict';

const chalk = require('chalk');
const program = require('commander');
const path = require('path');
const envinfo = require('envinfo');
const exportCollection = require('./lib/exportCollection');
const exportDocument = require('./lib/exportDocument');
const importCollection = require('./lib/importCollection');
const initializeApp = require('./utils/initializeApp');
const packageJson = require('../package.json');

program.version(packageJson.version);

program
  .command('export [serviceAccountConfig]')
  .description(
    'Export document(s) / collection(s) from the specified Firestore database'
  )
  .alias('e')
  .option(
    '-c, --collections <collectionRef>',
    `specify a particular collection or collections to export.
                                             This can be either a path to a subcollection, i.e. col/doc/subcollection
                                             or a specified glob pattern to match collections located at the root of the db.

                                             Glob pattern documentation can be found at https://github.com/isaacs/minimatch

     `
  )
  .option(
    '-d, --document <documentPath>',
    'specify a path to a particular document within a given collection to export'
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
    `specify a google storage bucket to write to <bucketOptionsFilePath>
                                             This file is required and configuration options can be found at:
                                             https://cloud.google.com/nodejs/docs/reference/storage/1.7.x/File#createWriteStream

    `
  )
  .option(
    '-s, --defaultServiceAccount',
    `If set then Firebase authentication will attempt to use the default credentials
                                             which are present when running within GCP.
                                             More information can be found at: https://firebase.google.com/docs/admin/setup

    `
  )
  .option(
    '-q, --query <queryString>',
    `run query on returned documents from a given collection.
                                             Format should be a comma separated list which each index corresponding to the
                                             parameters described here: https://cloud.google.com/nodejs/docs/reference/firestore/0.15.x/Query#where
                                             More on queries can be found here: https://cloud.google.com/nodejs/docs/reference/firestore/0.15.x/Query
    `
  )
  .action((serviceAccountConfig, options) => {
    initializeApp(serviceAccountConfig, options);

    const { collections = null, document = null } = options;
    const mergedOptions = Object.assign(
      { verbose: program.verbose, cli: true },
      options
    );

    if (document && collections) {
      console.log(
        chalk.yellow(
          `Warning: both a document and collection were provided, if you want to export
       a document please provide a path like collection/doc. If you would like to export a
       subcollection then you only need to use the -c flag and provide a path to that subcollection.

       Attempting to lookup a document at the following path: ${chalk.magenta(
         collections + '/' + document
       )}
      `
        )
      );
    }

    if (document) {
      exportDocument(
        collections ? `${collections}/${document}` : document,
        mergedOptions
      );
    } else {
      exportCollection(collections, mergedOptions);
    }
  });

program
  .command('import [serviceAccountConfig]')
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
  .action((serviceAccountConfig, options) => {
    const {
      filePath = '',
      collection = options.filePath ? path.parse(filePath).name : null,
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

    initializeApp(serviceAccountConfig, options);

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
    console.log(
      `    Only ${chalk.green(
        '[serviceAccountConfig]'
      )} is required if not set as an environmental variable.`
    );
    console.log();
    console.log(
      `    ${chalk.green(
        '[serviceAccountConfig]'
      )} is the path to the admin sdk service account configuration.
         Or it is alternatively set via the environmental variable ${chalk.green(
           '$GOOGLE_APPLICATION_CREDENTIALS'
         )}
         See [Authentication Getting Started](${chalk.cyan(
           'https://cloud.google.com/docs/authentication/getting-started'
         )})
      `
    );
    console.log();
    console.log(
      `    For more information on how to obtain this config see:
    [Admin SDK setup](${chalk.cyan(
      'https://firebase.google.com/docs/admin/setup'
    )})`
    );
    console.log();
    console.log(
      `    If a document is given then a collection is also required.`
    );
    console.log();
    console.log(
      `    Usage:
           ${chalk.magenta(
             'export|e <databaseURL> [serviceAccountConfig] [options]'
           )}
           ${chalk.magenta(
             'import|i <databaseURL> [serviceAccountConfig] [options]'
           )}`
    );
    console.log();
    console.log(`    Export Options:`);
    console.log(`
           -c, --collections <collectionLookupPattern>      Glob pattern used to find matches against collections in a given database,
           -d, --document <documentRef>                     Name of the document within a given collection to export,
           -o, --out <fileName>, <filePath>                 Filename and path to write the exported data to. Path defaults to process.cwd(),
           -s, --defaultServiceAccount                      Flag that tells the application to lookup the default service account credentials
           -b, --bucket                                     Name of the Google Cloud Bucket to export the collections/documents to
           -g, --bucketOptions <bucketOptionsFilePath>      Additional options for bucket storage ${chalk.cyan(
             'https://cloud.google.com/nodejs/docs/reference/storage/1.7.x/File#createWriteStream'
           )}
           -q, --query <queryString>                        Glob pattern used for lookup of specific collections
    `);
    console.log();
    console.log(`    Import Options:`);
    console.log(`
           -c, --collection <collectionRef>                 Name of the collection to export,
           -p, --filePath <filePath>                        Path to the jsonl file to import,
           -f, --force <force>                              Force import without prompt of overwrite.
    `);
    console.log(
      `    If you have any problems, do not hesitate to file an issue:`
    );
    console.log(
      `    ${chalk.cyan('https://github.com/fanai-inc/firestore-utils/issues')}`
    );
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
