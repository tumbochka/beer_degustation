import {firestore} from "../firebase";

export const createUser = async (user, additionalData): User => {
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

export const getDegustations = () => {

}
