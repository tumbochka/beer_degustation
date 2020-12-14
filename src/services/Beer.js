import firebase from "firebase";
import {updateDegustation} from "../persistence/Persistence";

export const updateBeer = (degustation, beer) => {
  const getBeerDetailsFromUntappd = firebase.functions().httpsCallable('getBeerDetailsFromUntappd');
  getBeerDetailsFromUntappd({
    bid: beer.beer.bid
  })
    .then(result => {
      const beerFromUntappd = result.data;
      console.log('beer from untappd', beerFromUntappd);
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
        updateDegustation(degustation);
    }})
}

export const searchBeerOnUntappd = beer => {
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
        brewery_name: beer.brewery.brewery_name
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
  degustation.beers = degustation.beers.filter(filterBeer => filterBeer.id !== beer.id);

  return degustation;
}
