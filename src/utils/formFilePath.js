'use strict';

const padDate = require('./padDate');

const formFilePath = () => {
  const date = new Date();
  // build the storage path which defaults to firebase/yyyy/mm/dd/UTCtimestamp
  return `firebase/${date.getUTCFullYear()}/${padDate(
    date.getUTCMonth() + 1
  )}/${padDate(date.getUTCDate())}/${date.toISOString()}`;
};

module.exports = formFilePath;
