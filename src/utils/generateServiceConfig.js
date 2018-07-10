// prettier-ignore
module.exports = {
  "project_id": `${process.env.FIREBASE_PROJECT}`,
  "private_key": JSON.parse(`"${process.env.FIREBASE_PRIVATE_KEY}"`),
  "client_email": `firebase-adminsdk-${process.env.FIREBASE_EMAIL_ID}@${
    process.env.FIREBASE_PROJECT
  }.iam.gserviceaccount.com`,
};
