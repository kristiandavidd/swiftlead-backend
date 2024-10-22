// require('dotenv').config();
// const path = require('path');

// const admin = require('firebase-admin');
// const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;

// admin.initializeApp({
//     credential: admin.credential.cert(require(path.resolve(serviceAccountPath))),
//     databaseURL: process.env.FIREBASE_DB_URL,
// });

// const db = admin.database();

// module.exports = { db };

// railway config
require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.database();

module.exports = { db };
