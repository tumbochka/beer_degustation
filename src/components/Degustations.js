import React, {useState}  from "react";
import {getDegustations} from "../persistence/Persistence";
import Degustation from "./Degustation";
import {navigate} from "@reach/router";

const Degustations = () => {
  const [degustations, setDegustations] = useState(null);
  const [degustation, setDegustation] = useState(null);

  const renderDegustations = () => {
    return degustations.map(degustation => {
      return (
        <div key={degustation.id}>
          {new Date(degustation.date.seconds * 1000).toDateString()} {degustation.title} {degustation.beers.length}
          <button onClick={() => {
            setDegustation(degustation);
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
      {
        degustation ?
        <div>
          <Degustation degustation={degustation} />
          <button onClick={() => {setDegustation(null)}}>Close</button>
        </div> : (
            degustations ?
            <div>
              <button onClick={() => {navigate('/DegustationSelector')}}>Import another</button>
              <div>Date Title Beers count</div>
              <div>{renderDegustations()}</div>
            </div>
            :
            <div>"Loading..."</div>
          )
      }
    </div>

  );
}

export default Degustations;
