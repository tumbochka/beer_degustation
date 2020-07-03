import React, {useState} from "react";
import Beer from "./Beer";
import firebase from "firebase";

const Degustation = ({
    degustation
  }) => {

  const [error, setError] = useState(null);

  const beers = degustation.beers;

  const updateBeerDetailsFromUntappd = (beer) => {
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

          }
        })
      ;
    } else {
      setError('Please fill up the brewery name and the beer name');
    }
  }

  const renderBeers = () => {
    return beers.map(beer => {
      return (
        <Beer
          beer={beer}
          onSelection={null}
        />
      );
    });
  };

  return (

    <div>
      {error ? <div>{error}</div> : ''}
      <div>Degustation: {degustation.date}, {degustation.title}</div>
      <div>{renderBeers()}</div>
    </div>
  );
}

export default Degustation;
