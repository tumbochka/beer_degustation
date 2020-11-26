const admin = require("firebase-admin");

export const sendNotificationToAllClients= async (data: any) => {
  const tokens = await getClientTokens();
  sendNotificationToClient(tokens, data);
};

export const sendNotificationToClient = (tokens: any, data: any) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }
  const messaging = admin.messaging();
  // Send a message to the devices corresponding to the provided
  // registration tokens.
  messaging
    .sendMulticast({ tokens, data })
    .then((response:any) => {
      // Response is an object of the form { responses: [] }
      const successes = response.responses.filter((r: any) => r.success === true)
        .length;
      const failures = response.responses.filter((r: any)  => r.success === false)
        .length;
      console.log(
        'Notifications sent:',
        `${successes} successful, ${failures} failed`
      );
    })
    .catch((error: any) => {
      console.log('Error sending message:', error);
    });
};

export const saveClientToken = async (token: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }
  const firestore = admin.firestore();

  const tokenRef = firestore.doc(`clientTokens/${token}`);

  const snapshot = await tokenRef.get();
  if (!snapshot.exists) {
    await tokenRef.create({token: token});
  }
};

export const getClientTokens = async () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }
  const firestore = admin.firestore();
  const tokenRef = firestore.collection('clientTokens/');
  const snapshot = await tokenRef.get();

  const tokens = new Array<string>();

  snapshot.forEach((doc:any) => {
    console.log('doc', doc);
    tokens.push(doc.token);
  });

  return tokens;
};
