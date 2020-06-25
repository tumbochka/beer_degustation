import React from "react";
import Beer from "./Beer";

const Degustation = ({
    degustation
  }) => {

  const beers = degustation.beers;

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
      <div>Degustation: {degustation.date}, {degustation.title}</div>
      <div>{renderBeers()}</div>
    </div>
  );
}

export default Degustation;
