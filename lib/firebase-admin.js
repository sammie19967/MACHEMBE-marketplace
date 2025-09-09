// lib/firebase-admin.js (server only)
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY env missing. Paste your service account private key into .env.local');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // if the key in .env contains escaped newlines, convert them to real newlines
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;
