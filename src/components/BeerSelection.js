import React from "react";
import Beer from "./Beer";

const BeerSelection = (data) => {
  const beers = data.beers;

  const onSelection = () => {};

  const renderBeers = () => {
    return beers.map(beer => {
      return (
        <Beer
          beer={beer}
          onSelection={onSelection()}
        />
      );
    });
  };

  return (
    <div>
      <div>Please select a beer</div>
      <div>{renderBeers()}</div>
    </div>
  );
}

export default BeerSelection;
