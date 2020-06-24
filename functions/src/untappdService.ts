import * as rq from 'request';
import {BeerItem} from "./types";

const functions = require('firebase-functions');


export const searchBeer = (breweryName: string, beerName: string, callback: (item: BeerItem | null) => void) => {
  const untappdConfig = functions.config().untappd;
  const requestOptions = {
    url: untappdConfig.api_url + 'search/beer',
    qs: {
      client_id: untappdConfig.client_id,
      client_secret: untappdConfig.client_secret,
      q: breweryName + ' ' + beerName
    }
  };

  rq(requestOptions, (err, resp, body) => {
    if (!err){
      const response = JSON.parse(body).response;
      if (response.beers.count>0) {
        callback(response.beers.items);
      }
    }
    callback(null);
  });
}
