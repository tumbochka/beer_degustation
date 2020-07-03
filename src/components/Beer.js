import React from "react";

const Beer = ({
  beer,
  onSelection,
  onSelectionText
 }) => {

  const renderSelectButton = () => {
    if(onSelection) {
      return (
        <div>
          <button onClick={onSelection}>{onSelectionText}</button>
        </div>
      );
    }
  }

  return (
    <div>
      <div>
        <img src={beer.beer.beer_label} />
      </div>
      <div>
        {beer.beer.bid} {beer.brewery.brewery_name} {beer.beer.beer_name} {beer.beer.beer_style} {beer.beer.beer_abv} {beer.beer.beer_ibu}
      </div>
      <div>
        {beer.beer_description}
      </div>

      {renderSelectButton()}

    </div>
  );
}

export default Beer;
