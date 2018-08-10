# Firebase - Cloud Firestore Utilities

[![npm](https://img.shields.io/npm/dt/@fanai/firestore-utils.svg)](https://www.npmjs.com/package/@fanai/firestore-utils)
[![David](https://img.shields.io/david/fanai-inc/firestore-utils.svg)](https://img.shields.io/david/fanai-inc/firestore-utils.svg)

While Cloud Firestore is in Beta these utility scripts provide a CLI and an optional javascript API for exporting collections and documents as well as importing those back into your Firestore database.

Currently, these utilities do not support the following features but hopefully they will be developed in the coming releases:

- Sub-collection isolated import (export is supported when path to subcollection is given)
- Individual document import
- Multi-collection import
- Sub-collection export on individual documents
- Pause/Resume for collection import for large collections _(current limit is **500** document batch writes)_

Single or multiple collections can be exported to your local file system which defaults to the current working directory or to a specified file or directory path via the usage of the `-o` flag. Alternatively, support exists for exporting to a Google Cloud Storage Bucket. In the case of sending to a Google bucket the data is base64 encoded prior to being sent.

## Overview

This CLI offers the capability to export collections from a specified Firestore database using the [admin SDK](https://firebase.google.com/docs/admin/setup).

### Usage

For both `import` and `export` a path to the service account configuration can be provided as the only required argument to either command. If this value is _NOT_ present then the application will look for the following environmental variable to generate a service config at runtime.

- `GOOGLE_APPLICATION_CREDENTIALS`

The above variable is required when a path to a service config is not specified. If you are running this in the context of a GCP then more can be found [here](https://cloud.google.com/docs/authentication/production).

For local development and testing of exported collections you can optionally set this variable like so:

`export GOOGLE_APPLICATION_CREDENTIALS=`path/to/local/service/config'`

In addition to providing a json configuration or exposing an environmental variable, you can use the `-s` flag which will cause the application to try and authenticate using Google Application Default Credentials to initialize Firebase. An example can be found below and additional information can be found here: [Firebase Admin Setup](https://firebase.google.com/docs/admin/setup).

```
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
```

#### Command Line

##### Export

```sh
export [path/to/serviceAccountConfig.json]
```

- `-c`, `--collections` `<collectionLookupPattern>` - The `c, collections` argument can be the name of a collection at the root of the db, or alternatively a glob pattern used to perform a lookup for collections within the specified Firestore database at the root level.
  <br /><br />If neither are provided the lookup is made againt '\*' so essentially all collections are exported. If a path to a subcollection is given, e.g. `collection/doc/subcollection` then a lookup for that subcollection is performed and, if found, only that subcollection will be exported. More information on supported glob patterns can be found in the [minimatch docs](https://github.com/isaacs/minimatch)<br /><br />
  If a glob is not supplied, and the CLI is used then all available collections at the root of the db are listed for selection prior to being exported.<br /><br />
- `-d`, `--document` `<documentPath>`- Specific document within a collection to export **NOTE**: If the document and collection are both provided then they will be concatenated and a lookup at that combined path will be used. For example, running `export -c someCollection -d someDocument` will result in a path lookup of `someCollection/someDocument`. So it is not a requirement to provide both options. Simply use `export -d someCollection/someDocument`.<br /><br />
- `-o`, `--out` `<filePath>`- Path to write out the contents of the exported collections. By default this is the current working directory. This path is also used with the Google Storage Bucket path if the `--bucket` option is supplied.<br /><br />
- `-b`, `--bucket` - Bucket name that the exported collections should be stored<br /><br />
- `-g`, `--bucketOptions` - Options for storing in Google storage. More can be found [here](https://cloud.google.com/nodejs/docs/reference/storage/1.7.x/File#createWriteStream)<br /><br />
- `-s`, `--defaultServiceAccount`, - If set then Firebase authentication will attempt to use the default credentials which are present when running within GCP. More information can be found [here](https://firebase.google.com/docs/admin/setup)<br /><br />
- `-q`, `--query`, Option allows for a query to be run against any returned documents from a given collection. The format of the query should be a comma separated list internally is split on that delimeter and each resulting index in the array should match the parameters described [here](https://cloud.google.com/nodejs/docs/reference/firestore/0.15.x/Query#where). More on queries can be found [here](https://cloud.google.com/nodejs/docs/reference/firestore/0.15.x/Query). _NOTE_ Currently compound queries are not supported.

##### Import

```sh
import [path/to/serviceAccountConfig.json]
```

- `-p`, `--filePath` `<filePath>` - Path to collection. If this is not specified then the collection argument is required. If collection is provided and not the file path then process.cwd() is used by default and the default file extension is .jsonl.
- `-c`, `--collection` `<collectionName>` - name of an individual collection to be imported.

Additional information on options and usage can be found by running `--help`

#### Javascript API

##### Export

```
const firestore = require('firestoreUtils');
// initialize with the admin sdk
firestore.initialize();

// export a named collection
firestore.exportCollection('collectionId');

// export all collections based on matching glob
firestore.exportCollection('collection*');

// export a single document within a given collection
firestore.exportDocument('collectionId/documentId');

// export a single document within a given subcollection
firestore.exportDocument(
  'collectionId/documentId/subCollectionId/subDocumentId',
);
```

## License

Firestore Utility CLI is open source software [licensed as Apache License, Version 2.0](https://github.com/fanai-inc/firestore-utils/blob/develop/LICENSE.md).
