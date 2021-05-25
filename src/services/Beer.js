import firebase from "firebase";
import {updateDegustation} from "../persistence/Persistence";


export const updateBeer = async (degustation, beer) => {
  const getBeerDetailsFromUntappd = firebase.functions().httpsCallable('getBeerDetailsFromUntappd');
  const result = await getBeerDetailsFromUntappd({
    bid: beer.beer.bid
  });

  const beerFromUntappd = result.data;

  if(beerFromUntappd) {
    degustation.beers = degustation.beers.map(beerItem => {
      if(beerItem.id === beer.id) {
        beerItem.brewery = beerFromUntappd.brewery;
        beerItem.beer = {...beerItem.beer,
          bid: beerFromUntappd.bid,
          beer_abv: beerFromUntappd.beer_abv,
          beer_name: beerFromUntappd.beer_name,
          beer_label: beerFromUntappd.beer_label,
          beer_ibu: beerFromUntappd.beer_ibu,
          beer_description: beerFromUntappd.beer_description,
          beer_style: beerFromUntappd.beer_style,
          rating_score: beerFromUntappd.rating_score
        }
      }
      return beerItem;
    });

    return await updateDegustation(degustation);
  }

  return degustation;
}

export const fetchBeerDetails = async (bid) => {
  const getBeerDetailsFromUntappd = firebase.functions().httpsCallable('getBeerDetailsFromUntappd');
  const result =  await getBeerDetailsFromUntappd({
    bid: bid
  });
  if(result && result.data) {
    const beerFromUntappd = result.data;
    const beerItem = {};
    beerItem.brewery = beerFromUntappd.brewery;
    beerItem.beer = {
      bid: beerFromUntappd.bid,
      beer_abv: beerFromUntappd.beer_abv,
      beer_name: beerFromUntappd.beer_name,
      beer_label: beerFromUntappd.beer_label,
      beer_ibu: beerFromUntappd.beer_ibu,
      beer_description: beerFromUntappd.beer_description,
      beer_style: beerFromUntappd.beer_style,
      rating_score: beerFromUntappd.rating_score
    }

    return beerItem;
  }

  return null;

}

//export const searchOnUntappd = search =>
export const searchOnUntappd = search => {
  return new Promise((resolve, reject) => {
    const searchOnUntappd = firebase.functions().httpsCallable('searchOnUntappd');
    searchOnUntappd({
      searchStr: search
    })
        .then(result => {
          const beers = result.data;
          if (!beers || 0 === beers.length) {
            reject("Can't find beer: " + search);
          } else {
            resolve(beers);
          }
        })
  })
}

export const searchBeerOnUntappd = (beer, user) => {
  return new Promise((resolve, reject) => {
    if(beer.beer.bid) {
      resolve([beer]);
    } else {
      if (!beer.brewery.brewery_name || !beer.beer.beer_name) {
        reject('Please fill up the brewery name and the beer name');
      }
      const searchBeerOnUntappd = firebase.functions().httpsCallable('searchBeerOnUntappd');
      searchBeerOnUntappd({
        beer_name: beer.beer.beer_name,
        brewery_name: beer.brewery.brewery_name,
        userId: user.uid,
      })
        .then(result => {
          const beers = result.data;
          if (!beers || 0 === beers.length) {
            reject("Can't find beer: " + beer.brewery.brewery_name + ' ' + beer.beer.beer_name);
          } else {
            resolve(beers);
          }
        })
    }
  });
}

export const removeBeerFromDegustation = (degustation, beer) => {
  degustation.beers = degustation.beers.filter(filterBeer => {
    if(filterBeer.id && beer.id) {
      return filterBeer.id !== beer.id;
    }
    if(filterBeer.beer && beer.beer) {
      if(filterBeer.beer.bid && beer.beer.bid) {
        return filterBeer.beer.bid !== beer.beer.bid;
      }
      return filterBeer.beer.name !== beer.beer.name;
    }
    return false;
  });
  updateDegustation(degustation);
  return degustation;
}
