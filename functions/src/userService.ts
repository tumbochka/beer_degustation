const admin = require("firebase-admin");

export const getUser = async (userId: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }

  const firestore = admin.firestore();

  const userDoc = await firestore.doc(`users/${userId}`).get();

  return userDoc.data();
}
