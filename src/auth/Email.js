import {auth} from "../firebase";

export const signInWithEmailAndPassword = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password).catch(error => {
    console.error("Error signing in with password and email", error);
    throw error;
  });
}

export const createUserWithEmailAndPassword = (email, password) => {
  return auth.createUserWithEmailAndPassword(email, password).catch(error => {
    console.error("Error creating user with password and email", error);
    throw error;
  });
}

export const sendPasswordResetEmail = (email) => {
  return auth.sendPasswordResetEmail(email).catch(error => {
    console.error("Error sending reset email", error);
    throw error;
  });
}
