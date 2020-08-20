import * as rq from 'request';
import {BeerItem} from "./types";

const functions = require('firebase-functions');


export const searchBeer = (breweryName: string, beerName: string, callback: (beers: Array<BeerItem>) => void) => {
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
      callback(response.beers.items.concat(response.homebrew.items));
    }
    callback([]);
  });
}

export const getBeerDetails = (bid: string, callback: (beer: BeerItem | null) => void) => {
  const untappdConfig = functions.config().untappd;
  const requestOptions = {
    url: untappdConfig.api_url + 'beer/info/' + bid,
    qs: {
      client_id: untappdConfig.client_id,
      client_secret: untappdConfig.client_secret
    }
  };

  rq(requestOptions, (err, resp, body) => {
    if (!err){
      const response = JSON.parse(body).response;
      if (response.beer) {
        callback(response.beer);
      }
    }
    callback(null);
  });
}

export const checkInBeer = (userAccessToken: string, beerId: string, rating: number, shout:string = "") => {
  const untappdConfig = functions.config().untappd;
  const date = new Date();
  const requestOptions = {
    url: untappdConfig.api_url + 'checkin/add',
    qs: {
      access_token: userAccessToken,
    },
    form: {
      gmt_offset: date.getTimezoneOffset() / 60,
      timezone: 'EEST',
      bid: beerId,
      shout: shout,
      rating: rating
    }
  };
console.log(requestOptions);
  rq.post(requestOptions, (err, resp, body) => {
    console.log(body);
    if(err) {
      console.log(err.message);
    }
  });
}
