//purpose of firebase-admin sdk
//https://firebase.googleblog.com/2016/11/bringing-firebase-to-your-server.html

const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

module.exports = { admin, db };
