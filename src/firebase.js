// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDs42kUWGtEpwneo0cAUAGi8lUKpVD3Iik",
  authDomain: "beer-degustation.firebaseapp.com",
  databaseURL: "https://beer-degustation.firebaseio.com",
  projectId: "beer-degustation",
  storageBucket: "beer-degustation.appspot.com",
  messagingSenderId: "1058720130453",
  appId: "1:1058720130453:web:7dc1000cd81db0be68829c"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();

firestore.enablePersistence().catch(err => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a a time.
    console.log('persistance failed');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the
    // features required to enable persistence
    console.log('persistance not available');
  }
});


