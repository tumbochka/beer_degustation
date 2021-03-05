import {firestore} from "../firebase";
import firebase from "firebase";

export const createUser = async (user, additionalData) => {
  if (!user) return;
  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    const { email,  photoURL } = user;
    try {
      await userRef.set({
        email,
        photoURL,
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user", error);
    }
  }
  return getUser(user.uid);
};

export const updateUser = async (user, additionalData) => {
  if (!user) return;
  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  if (snapshot.exists) {
    const { firstName, lastName, email,  photoURL, untappdName, untappdAccessToken } = user;
    try {
      await userRef.update({
        firstName,
        lastName,
        email,
        photoURL,
        untappdName,
        untappdAccessToken,
        ...additionalData
      });
    } catch (error) {
      console.error("Error updating user", error);
    }
  }
}

export const getUser = async (uid)   => {
  if (!uid) return null;
  try {
    const userDocument = await firestore.doc(`users/${uid}`).get();
    return {
      uid,
      ...userDocument.data()
    };
  } catch (error) {
    console.error("Error fetching user", error);
  }
};

export const getDegustations = async () => {
  try {
    const snapshot  = await firestore.collection('degustations').get();

    return snapshot.docs.map(doc => {
      return {
        ...doc.data(),
        ...{id: doc.id}
      };
    });
  } catch (error) {
    console.error("Error fetching degustations", error);
  }
}

export const updateDegustation = async (degustation) => {
  const updateClientDegustation = firebase.functions().httpsCallable('updateClientDegustation');
  console.log('updating', degustation);
  try {
    const updateDegustation = await updateClientDegustation({degustation: degustation});

    return updateDegustation.data;
  } catch (err) {
    console.error("Error updating degustation", err);
  }
}

export const getDegustation = async (degustationId) => {
  const doc = firestore.doc(`degustations/${degustationId}`);
  try {
    const degustation = await doc.get();
    return degustation;
  } catch (error) {
    console.error("Error updating degustation", error);
  }
}
