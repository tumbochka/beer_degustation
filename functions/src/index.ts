import * as functions from 'firebase-functions';
import * as rq from 'request';
import * as cors from 'cors';
import {
  exportDegustationToGoogle,
  fetchDegustationDataFromGoogleSheet,
  getDegustation,
  updateDegustation
} from "./degustationService";
import {getBeerDetails, searchBeer} from "./untappdService";
import {BeerItem, Rate} from "./types";

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
    response.send({error: err});
   } else {
    response.send({data: body});
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
    response.send({error: err});
   } else {
    response.send({data: body});
   }
  });
 })
});

export const getDegustationDataFromGoogleSheet = functions.https.onRequest((request, response) => {
 corsHandler(request, response, () => {
  const docId = request.body.data.id;
  fetchDegustationDataFromGoogleSheet(docId)
    .then(degustation => {
     response.send({data: degustation});
   })
    .catch(e => {
     response.send({error: e.message})
    });
 })
});

export const searchBeerOnUntappd = functions.https.onRequest((request, response) => {
 corsHandler(request, response, () => {
  const beerName = request.body.data.beer_name;
  const breweryName = request.body.data.brewery_name;
  searchBeer(breweryName, beerName, (resp) => {
   response.send({data: resp});
  });
 });
});

export const getBeerDetailsFromUntappd = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const bid = request.body.data.bid;
    getBeerDetails(bid, (beer) => {
      response.send({data: beer});
    })
  });
});

export const saveDegustationToGoogle = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const degustation = request.body.data.degustation;
    exportDegustationToGoogle(degustation.id, degustation)
      .then(() => response.send({data: true}))
      .catch(e => response.send({error: e.message}))
    ;
  });
});

export const rateBeer  = functions.https.onRequest((request, response) => {
 corsHandler(request, response, () => {
  const degustationId = request.body.data.degustationId;
  const beerId = request.body.data.beerId;
  const userId = request.body.data.userId;
  const rate = request.body.data.rate;

  getDegustation(degustationId)
    .then(degustation => {
      if(!degustation) {
        throw new Error("Degustation doesn't exist");
      }
      const beer = degustation.beers.find((beerItem: BeerItem) => beerItem.id === beerId);
      if (!beer.rates) {
        beer.rates = [];
      }
      const rateIndex = beer.rates.findIndex((rateItem: Rate) => rateItem.user === userId);
      if (-1 === rateIndex) {
       beer.rates.push({user: userId, rate: rate});
      } else {
       beer.rates[rateIndex] = {user: userId, rate: rate};
      }
      updateDegustation(degustationId, degustation)
        .then(updatedDegustation => {
          response.send({data: updatedDegustation});
        })
        .catch(e => {
          response.send({error: e.message})
        });
    })
    .catch(e => {
      response.send({error: e.message})
    });
 });
});
