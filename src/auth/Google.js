import * as firebase from "firebase";
import {auth} from "../firebase";

const provider = new firebase.auth.GoogleAuthProvider();

export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};
