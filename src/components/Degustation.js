import React, {useState} from "react";
import Beer from "./Beer";
import firebase from "firebase";
import {updateDegustation} from "../persistence/Persistence";


const Degustation = ({
    degustation
  }) => {

  const [error, setError] = useState(null);
  const [selectBeer, setSelectBeer] = useState(null);

  const beers = degustation.beers;

  const updateBeer = (beer, beerId) => {
    const getBeerDetailsFromUntappd = firebase.functions().httpsCallable('getBeerDetailsFromUntappd');
    getBeerDetailsFromUntappd({
      bid: beerId
    })
      .then(result => {
        const beerFromUntappd = result.data;
        console.log(beerFromUntappd);
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
      })

  }

  const updateBeerDetailsFromUntappd = (beer) => {
    console.log(degustation);
    if(beer.brewery.brewery_name && beer.beer.beer_name) {
      const searchBeerOnUntappd = firebase.functions().httpsCallable('searchBeerOnUntappd');
      searchBeerOnUntappd({
        beer_name: beer.beer.beer_name,
        brewery_name: beer.brewery.brewery_name
      })
        .then(result => {
          const beers = result.data;
          if (! beers || 0 === beers.length) {
            setError("Can't find beer: " + beer.brewery.brewery_name + ' ' + beer.beer.beer_name);
          } else if (1 === beers.length) {
            updateBeer(beer, beers[0].beer.bid);
          } else {
            setSelectBeer(beers.map(beerItem => {return {id: beer.id, ...beerItem}}));
          }
        })
      ;
    } else {
      setError('Please fill up the brewery name and the beer name');
    }
  }

  const exportDegustationToGoogleSheet = () => {
    const saveDegustationToGoogle = firebase.functions().httpsCallable('saveDegustationToGoogle');
    saveDegustationToGoogle({degustation: degustation});
  }

  const renderBeers = () => {
    return beers.map(beer => {
      return (
        <div key={beer.id}>
          <Beer beer={beer} />
          {beer.beer.bid ? '' : <button
            onClick={() => updateBeerDetailsFromUntappd(beer)}>Update from Untappd</button>}
        </div>
      );
    });
  };

  const renderBeerForSelection = (beers) => {
    return beers.map(beer => {
      return (
        <div key={beer.id}>
          <Beer beer={beer} />
          <button onClick={() => {
            updateBeer(beer, beer.beer.bid);
            setSelectBeer(null);
          }}>Select</button>}
        </div>
      );
    });
  }

  return (

    <div>
      {error ? <div>{error}</div> : ''}
      {selectBeer
        ?
        <div>
          <div>Please select a beer</div>
          {renderBeerForSelection(selectBeer)}
        </div>
        :
        <div>
          <div>Degustation: {degustation.date.seconds ? new Date(degustation.date.seconds * 1000).toDateString() : new Date(degustation.date).toDateString()}, {degustation.title}</div>
          <div>{renderBeers()}</div>
          <button onClick={exportDegustationToGoogleSheet}>Export to Google</button>
        </div>
      }
    </div>
  );
}

export default Degustation;
