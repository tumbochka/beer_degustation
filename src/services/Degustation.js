import firebase from "firebase";

export const exportDegustationToGoogleSheet = (degustation) => {
  const saveDegustationToGoogle = firebase.functions().httpsCallable('saveDegustationToGoogle');
  return saveDegustationToGoogle({degustation: degustation});
}

export const rateBeer = (degustation, beer, user, rate, shout) => {
  const rateBeer = firebase.functions().httpsCallable('rateBeer');

  return rateBeer({
    degustationId: degustation.id,
    beerId: beer.id,
    userId: user.uid,
    rate: rate,
    shout: shout
  });
}
