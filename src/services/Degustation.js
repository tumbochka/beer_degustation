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
  export const sortBeers = (beers, fieldName, direction) =>{
    return beers.sort(function(a, b){
      console.log("a", resolvePath(a, fieldName));
      console.log("b", resolvePath(b, fieldName));
      if (resolvePath(a, fieldName)<resolvePath(b, fieldName) && direction === 'asc') {
          return -1;
      }
      if (resolvePath(a, fieldName)>resolvePath(b, fieldName) && direction === 'asc') {
          return 1;
          }
        if (resolvePath(a, fieldName)>resolvePath(b, fieldName) && direction === 'desc') {
            return -1;
        }
        if (resolvePath(a, fieldName)<resolvePath(b, fieldName) && direction === 'desc') {
            return 1;
        }


      return 0;



    })




}

export const exportAllRates = (degustation) => {
  const exportAllRates = firebase.functions().httpsCallable('exportAllRates');
  return exportAllRates({degustationId: degustation.id});
};


const resolvePath = (object, path, defaultValue) => path
    .split(/[\.\[\]\'\"]/)
    .filter(p => p)
    .reduce((o, p) => o ? o[p] : defaultValue, object)

