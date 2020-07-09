import React from "react";

const Beer = ({
  beer
 }) => {

  return (
    <div>
      <div>
        <img src={beer.beer.beer_label} />
      </div>
      <div>
        {beer.beer.bid} {beer.brewery.brewery_name} {beer.beer.beer_name} {beer.beer.beer_style} {beer.beer.beer_abv} {beer.beer.beer_ibu}
      </div>
      <div>
        {beer.beer.beer_description}
      </div>

    </div>
  );
}

export default Beer;
