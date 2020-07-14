import firebase from "firebase";

export const exportDegustationToGoogleSheet = (degustation) => {
  const saveDegustationToGoogle = firebase.functions().httpsCallable('saveDegustationToGoogle');
  return saveDegustationToGoogle({degustation: degustation});
}
