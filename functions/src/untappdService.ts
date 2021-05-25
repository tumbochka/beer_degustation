import * as rq from 'request';
import {BeerItem} from "./types";
import {getUser} from "./userService";

const functions = require('firebase-functions');

// export const search(sesrch: string, callback: (beers: Array<BeerItem>) => void) => {
export const search = (searchStr: string, callback: (beers: Array<BeerItem>) => void) => {
  const untappdConfig = functions.config().untappd;
  const requestOptions = {
    url: untappdConfig.api_url + 'search/beer',
    qs: {
      client_id: untappdConfig.client_id,
      client_secret: untappdConfig.client_secret,
      q: searchStr
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
export const searchBeer = async (breweryName: string, beerName: string, userId: string|null, callback: (beers: Array<BeerItem>) => void) => {
  const untappdConfig = functions.config().untappd;
  const user = userId ? await getUser(userId) : null;
  let requestOptions;
  if(user && user.untappdAccessToken) {
    requestOptions = {
      url: untappdConfig.api_url + 'search/beer',
      qs: {
        access_token: user.untappdAccessToken,
        q: breweryName + ' ' + beerName
      }
    };
  } else {
    requestOptions = {
      url: untappdConfig.api_url + 'search/beer',
      qs: {
        client_id: untappdConfig.client_id,
        client_secret: untappdConfig.client_secret,
        q: breweryName + ' ' + beerName
      }
    };
  }

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
