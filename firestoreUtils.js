'use strict';

const exportCollection = require('./src/lib/exportCollection');
const exportDocument = require('./src/lib/exportDocument');
const importCollection = require('./src/lib/importCollection');
const initialize = require('./src/utils/initializeApp');

module.exports = {
  exportCollection,
  exportDocument,
  importCollection,
  initialize,
};
