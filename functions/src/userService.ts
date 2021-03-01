const admin = require("firebase-admin");

export const getUser = async (userId: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }

  const firestore = admin.firestore();

  const userDoc = await firestore.doc(`users/${userId}`).get();

  return userDoc.data();
}
