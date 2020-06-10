import * as functions from 'firebase-functions';
import * as rq from 'request';
import * as cors from 'cors';

const corsHandler = cors({origin: true});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const untappdAuthorize = functions.https.onRequest((request, response) => {
 corsHandler(request, response, () => {
  const data = request.body.data;
  const url = data.url;
  const clientId = data.clientId;
  const clientSecret = data.clientSecret;
  const redirectUrl = data.redirectUrl;
  const code = data.code;

  const options = {
   url: url,
   qs: {
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    redirect_url: redirectUrl,
    response_type: 'code'
   }
  }

  rq(options, (err, resp, body) => {
   if (err) {
    response.send(err);
   } else {
    response.send(body);
   }
  });
 })
});

export const untappdFetchUserDetails = functions.https.onRequest((request, response) => {
 corsHandler(request, response, () => {
  const url = request.body.data.url;
  const accessToken = request.body.data.accessToken;
  const options = {
   url: url,
   qs: {
    access_token: accessToken
   }
  }

  rq(options, (err, resp, body) => {
   if (err) {
    response.send(err);
   } else {
    response.send(body);
   }
  });
 })
});
