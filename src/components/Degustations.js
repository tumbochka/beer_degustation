import React from "react";
import { navigate } from "@reach/router"

const Degustations = ({
  Degustations
}) => {
  const renderDegustations = (Degustations) => {
    return Degustations.map(degustation => {
      return (
        <div>
          {degustation.date} {degustation.title} {degustation.beers.length}
        </div>
      );
    });
  }

  const viewDegustation = (id) => {

  }

  return (
    <div>
      <div>Date Title Beers count</div>
      <div>{renderDegustations()}</div>

    </div>
  );
}

export default Degustations;
