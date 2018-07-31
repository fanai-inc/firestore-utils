# Firebase - Cloud Firestore Utilities

While Cloud Firestore is in Beta these utility scripts provide a CLI for exporting collections and documents as well as importing those back into your Firestore database.

Currently, these utilities do not support the following features:

- Sub-collection isolated export/import
- Individual document export/import
- Multi-collection import
- Document/Sub-collection instance export
- Pause/Resume for collection import for large collections _(current limit is **500** document batch writes)_

Multiple collections can be exported to your local file system or to a Google Cloud Storage Bucket. In the case of sending to a Google bucket the data is base64 encoded prior to being sent.

## Overview

This CLI offers the capability to export collections from a specified Firestore database using the [admin SDK](https://firebase.google.com/docs/admin/setup).

### Usage

For both `import` and `export` a path to the service account configuration can be provided as the second argument to either command. If this value is _NOT_ present then the application will look for the following environmental variable to generate a service config at runtime.

- `GOOGLE_APPLICATION_CREDENTIALS`

The above variable is required when a path to a service config is not specified. If you are running this in the context of a GCP then more can be found [here](https://cloud.google.com/docs/authentication/production).

For local development and testing of exported collections you can optionally set this variable like so:

`export GOOGLE_APPLICATION_CREDENTIALS=`path/to/local/service/config'`

Additionally, you can use the `-s` flag which will cause the application to try and authenticate using Google Application Default Credentials to initialize Firebase. An example can be found below and additional information can be found here: [Firebase Admin Setup](https://firebase.google.com/docs/admin/setup).

```
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});
```

#### Supported Commands

##### Export

```sh
export <databaseURL> [path/to/serviceAccountConfig.json]
```

- `-c`, `--collections` `<collectionLookupPattern>` - Glob pattern used to perform a lookup for collections within the specified Firestore database. More information on supported glob patterns can be found in the [minimatch docs](https://github.com/isaacs/minimatch)<br />
  If a glob is not supplied, then a list of all available collections located at `<databaseURL>` will be listed for selection within the CLI.
- `-d`, `--document` `<documentID>`- Specific document within a collection to export **NOTE**: if document is provided then the `<collectionName>` is also required. (This feature is currently not supported).
- `-o`, `--out` `<filePath>`- Path to write out the contents of the exported collections. By default this is the current working directory. This path is also used with the Google Storage Bucket path if the `--bucket` option is supplied.
- `-b`, `--bucket` - Bucket name that the exported collections should be stored
- `-g`, `--bucketOptions` - Options for storing in Google storage. More can be found [here](https://cloud.google.com/nodejs/docs/reference/storage/1.7.x/File#createWriteStream)
- `-s`, `--defaultServiceAccount`, - If set then Firebase authentication will attempt to use the default credentials which are present when running within GCP. More information can be found [here](https://firebase.google.com/docs/admin/setup)

##### Import

```sh
import <databaseURL> [path/to/serviceAccountConfig.json]
```

- `-p`, `--filePath` `<filePath>` - Path to collection. If this is not specified then the collection argument is required. If collection is provided and not the file path then process.cwd() is used by default and the default file extension is .jsonl.
- `-d`, `--databaseURL` `<databaseURL>` - Database to perform the import on.
- `-c`, `--collection` `<collectionName>` - name of an individual collection to be imported.

Additional information on options and usage can be found by running `--help`

## License

Firestore Utility CLI is open source software [licensed as Apache License, Version 2.0](https://github.com/fanai-inc/firestore-utils/blob/develop/LICENSE.md).
