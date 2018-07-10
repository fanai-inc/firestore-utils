# Firebase - Cloud Firestore Utilities

While Cloud Firestore is in Beta these utility scripts provide a CLI for exporting collections and documents as well as importing those back into your Firestore database.

Currently, these utilities do not support the following features:

- Sub-collection isolated export/import
- Individual document export/import
- Multi-collection import
- Document/Sub-collection instance export
- Pause/Resume for collection import for large collections _(current limit is **500** document batch writes)_

## Overview

This CLI offers the capability to export collections from a specified Firestore database using the [admin SDK](https://firebase.google.com/docs/admin/setup).

### Usage

For both `import` and `export` a path to the service account configuration can be provided as the second argument to either command. If this value is not present then the application will look for the following environmental variables to generate a service config at runtime. The following environmental variables are required.

- `FIREBASE_PROJECT`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_EMAIL_ID`

The above correspond to values in the service config with the exception of the `FIREBASE_EMAIL_ID` which is the value `<your-email-id>` in the below string which can also be found in the service config. For local development it might be easier to set these values up in an .env file which will be imported automatically if in an environment other than production, i.e. the process.env.NODE_ENV !== production.

`firebase-adminsdk-<your-email-id>@<your-project-id>.iam.gserviceaccount.com`

#### Supported Commands

##### Export

```sh
export <databaseURL> [path/to/serviceAccountConfig.json]
```

OR

```sh
e <databaseURL> [path/to/serviceAccountConfig.json]
```

- `-c`, `--collection` `<collectionName>` - name of an individual collection to be exported.
  If not supplied then a list of all available collections located at `<databaseURL>` will be listed for selection.
- `-d`, `--document` `<documentID>`- Specific document within a collection to export **NOTE**: if document is provided then the `<collectionName>` is also required. (This feature is currently not supported).
- `-o`, `--out` `<path>`- Path to write out the contents of the exported collections. By default this is the current working directory.

##### Import

```sh
import <databaseURL> [path/to/serviceAccountConfig.json]
```

OR

```sh
i <databaseURL> [path/to/serviceAccountConfig.json]
```

- `-p`, `--filePath` `<filePath>` - Path to collection. If this is not specified then the collection argument is required. If collection is provided and not the file path then process.cwd() is used by default and the default file extension is .jsonl.
- `-d`, `--databaseURL` `<databaseURL>` - Database to perform the import on.
- `-c`, `--collection` `<collectionName>` - name of an individual collection to be imported.

Additional information on options and usage can be found by running `--help`

## License

Firestore Utility CLI is open source software [licensed as Apache License, Version 2.0](https://github.com/fanai-inc/firestore-utils/blob/develop/LICENSE.md).
