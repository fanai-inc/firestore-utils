const firestore = require('./firestoreUtils');
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
