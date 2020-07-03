import React, {useState}  from "react";
import { navigate } from "@reach/router"
import {getDegustations} from "../persistence/Persistence";

const Degustations = () => {
  const [degustations, setDegustations] = useState(null);

  const renderDegustations = () => {
    return degustations.map(degustation => {
      return (
        <div key={degustation.id}>
          {new Date(degustation.date.seconds * 1000).toDateString()} {degustation.title} {degustation.beers.length}
          <button onClick={() => {
            navigate('/Degustation', {state: {degustation: degustation}});
          }
        }>View</button>
        </div>
      );
    });
  }

  if (null === degustations) {
    getDegustations()
      .then(degustations => setDegustations(degustations));
  }
  return (

    <div>
      {degustations ?
        <div>
          <div>Date Title Beers count</div>
          <div>{renderDegustations()}</div>
        </div>
        :
        <div>"Loading..."</div>
      }
    </div>

  );
}

export default Degustations;
