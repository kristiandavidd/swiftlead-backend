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

const serviceAccount = {
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key,
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.database();

module.exports = { db };
