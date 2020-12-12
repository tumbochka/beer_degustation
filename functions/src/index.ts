import * as functions from 'firebase-functions';
import * as rq from 'request';
import * as cors from 'cors';
import {
  exportDegustationToGoogle,
  fetchDegustationDataFromGoogleSheet,
  getDegustation,
  updateDegustation
} from "./degustationService";
import {checkInBeer, getBeerDetails, searchBeer} from "./untappdService";
import {BeerItem, Rate} from "./types";
import {getUser} from "./userService";
import {upload} from "./upload";
import {saveClientToken} from "./message";

const corsHandler = cors({origin: true});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const untappdAuthorize = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const {url, clientId, clientSecret, redirectUrl, code} = request.body.data;

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
    const {url, accessToken} = request.body.data;
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
    const {beer_name, brewery_name} = request.body.data;
    searchBeer(brewery_name, beer_name, (resp) => {
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
      .catch(e => {throw new functions.https.HttpsError("unknown", e.message)})
    ;
  });
});

export const rateBeer = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const {degustationId, beerId, userId, rate, shout} = request.body.data;

    getDegustation(degustationId)
      .then(degustation => {
        if (!degustation) {
          response.status(400).send("Degustation doesn't exist: " + degustationId);
        }
        getUser(userId).then(user => {
          if(!user) {
            response.status(400).send("User doesn't exist: " + userId);
          }
          const beer = degustation.beers.find((beerItem: BeerItem) => beerItem.id === beerId);
          if (!beer.rates) {
            beer.rates = [];
          }
          const rateIndex = beer.rates.findIndex((rateItem: Rate) => rateItem.user === userId);
          if (-1 === rateIndex) {
            beer.rates.push({user: userId, rate: rate, shout: shout});
            if (user.untappdAccessToken && beer.beer.bid) {
              checkInBeer(user.untappdAccessToken, beer.beer.bid, rate/2, shout)
            }
          } else {
            beer.rates[rateIndex] = {user: userId, rate: rate, shout: shout};
          }
          updateDegustation(degustationId, degustation)
            .then(updatedDegustation => {
              response.send({data: updatedDegustation});
            })
            .catch(e => {
              response.status(500).send(e.message);
            });
        })
      .catch(e => {
        response.status(500).send(e.message);
      });
      })
      .catch(e => {
        response.status(500).send(e.message);
      });
  });
});

export const registerUserForDegustation = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const {degustationId, userId} = request.body.data;
    getDegustation(degustationId)
      .then(degustation => {
        if (!degustation) {
          response.status(400).send("Degustation doesn't exist: " + degustationId);
        }
        getUser(userId).then(user => {
          if (!user) {
            response.status(400).send("User doesn't exist: " + userId);
          }
          if(!degustation.users.includes(userId)) {
            degustation.users.push(userId);
          }
          updateDegustation(degustationId, degustation)
            .then(updatedDegustation => {
              response.send({data: updatedDegustation});
            })
            .catch(e => {
              response.status(500).send(e.message);
            });
        })
          .catch(e => {
            response.status(500).send(e.message);
          });
      })
      .catch(e => {
        response.status(500).send(e.message);
      });
  })
});

export const setDegustationLeading = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const {degustationId, userId} = request.body.data;
    getDegustation(degustationId)
      .then(degustation => {
        if (!degustation) {
          response.status(400).send("Degustation doesn't exist: " + degustationId);
        }
        getUser(userId).then(user => {
          if (!user) {
            response.status(400).send("User doesn't exist: " + userId);
          }
          degustation.leading = userId;
          if(!degustation.users.includes(userId)) {
            degustation.users.push(userId);
          }
          updateDegustation(degustationId, degustation)
            .then(updatedDegustation => {
              response.send({data: updatedDegustation});
            })
            .catch(e => {
              response.status(500).send(e.message);
            });
        })
          .catch(e => {
            response.status(500).send(e.message);
          });
      })
      .catch(e => {
        response.status(500).send(e.message);
      });
  })
});

export const updateClientDegustation =  functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    if('POST' !== request.method) {
      response.status(400).send('Only POST allowed');
    }
    const {degustation} = request.body.data;
    updateDegustation(degustation.id, degustation)
      .then(() => {
        response.send({data: true});
      })
      .catch(e => {
        response.status(500).send(e.message);
      })
    ;
  });
});

export const uploadBeerPicture = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    if('POST' !== request.method) {
      response.status(400).send('Only POST allowed');
    }
    upload(request, response);
  });
});

export const addMessageToken = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
     const {token} = request.body.data;
     if(!token) {
       response.status(400).send('Token is missing');
     }
     saveClientToken(token)
       .then(() => {
         response.send({data: true});
       })
       .catch(e => {
        response.status(500).send(e.message);
      })
     ;
  });
});
