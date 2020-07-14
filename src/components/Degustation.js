import React, {useState} from "react";
import Beer from "./Beer";
import {Container, Button, Row, Col} from "react-bootstrap";
import {updateBeer, updateBeerDetailsFromUntappd} from "../services/Beer";
import {exportDegustationToGoogleSheet} from "../services/Degustation";

const Degustation = ({
    degustation
  }) => {

  const [error, setError] = useState(null);
  const [beersToSelect, setBeersToSelect] = useState([]);
  const [beerToSelect, setBeerToSelect] = useState(null);
  const [mask, setMask] = useState(null);
  const [updatedBeers, setUpdatedBeers] = useState([]);
  const [fetchingBeerDetails, setFetchingBeerDetails] = useState(false);

  const beers = degustation.beers;

  const pushToUpdatedBeers = beer => {
    if('object' == typeof beer) {
      const index = updatedBeers.findIndex(updatedBeer => beer.id === updatedBeer.id);
      if (index >= 0) {
        updatedBeers[index] = beer;
      } else {
        updatedBeers.push(beer);
      }

      setUpdatedBeers(updatedBeers);
    }
  }

  const fetchAllBeersFromUntappd = async () => {
    setMask('Searching beers on Untappd');
    beers.forEach(async beer => {
      try {
        const searchBeers = await updateBeerDetailsFromUntappd(degustation, beer);
        if (!searchBeers || 0 === searchBeers.length) { // has'n found a beer
          pushToUpdatedBeers(beer);
        } else if (1 === searchBeers.length) { //found exactly one beer
          pushToUpdatedBeers({id: beer.id, ...searchBeers[0]});
        } else { // found several beers
          beersToSelect.push(searchBeers.map(searchBeer => {
            return {id: beer.id, ...searchBeer}
          }));
        }
      } catch (e) {
        pushToUpdatedBeers(beer);
      }
    });
  }

  const fetchAllBeersDetailsFromUntappd = () => {
    if (false === fetchingBeerDetails && beers.length === updatedBeers.length) {
      setFetchingBeerDetails(true);
      setMask('Fetching beer details...');
      console.log(updatedBeers.filter(beer => beer.beer.bid));
      Promise.all(updatedBeers.filter(beer => beer.beer.bid).map(beer => updateBeer(degustation, beer)))
        .then(() => {
          setUpdatedBeers([]);
          setMask(null);
          setFetchingBeerDetails(false);
        });
    }
  }

  const renderBeers = () => {
    return beers.map(beer => {
      return (
        <Beer
          key={beer.id}
          beer={beer}
        />
      );
    });
  };

  const renderBeerForSelection = (beers) => {
    return beers.map(beer => {
      const onClick = () => {
            pushToUpdatedBeers(beer);
            setBeerToSelect(null);
          };

      return (
        <Beer
          key={beer.beer.uid}
          beer={beer}
          onClick={onClick}
          onClickCaption="Select"
        />
      );
    });
  }

  fetchAllBeersDetailsFromUntappd();

  if(beersToSelect.length > 0 && !beerToSelect) {
    setBeerToSelect(beersToSelect.pop());
  }

  return (

    <div>
      {mask ? <div>{mask}</div> : ''}
      {error ? <div>{error}</div> : ''}
      {beerToSelect
        ?
        <div>
          <div className="caption">
            <Col>Please select a beer</Col>
          </div>
          <Container>
            <Row>
              <Col>Label</Col>
              <Col>Untappd ID</Col>
              <Col>Brewery</Col>
              <Col>Beer Name</Col>
              <Col>Style</Col>
              <Col>ABV</Col>
              <Col>IBU</Col>
              <Col>Description</Col>
              <Col>Actions</Col>
            </Row>
            {renderBeerForSelection(beerToSelect)}
          </Container>
        </div>
        :
        <div>
          <div className="caption">
            Degustation: {degustation.date.seconds ? new Date(degustation.date.seconds * 1000).toDateString() : new Date(degustation.date).toDateString()}, {degustation.title}
            <Button onClick={fetchAllBeersFromUntappd}>Update all beers from untappd</Button>
          </div>
          <Container>
            <Row>
              <Col>Label</Col>
              <Col>Untappd ID</Col>
              <Col>Brewery</Col>
              <Col>Beer Name</Col>
              <Col>Style</Col>
              <Col>ABV</Col>
              <Col>IBU</Col>
              <Col>Description</Col>
            </Row>
            {renderBeers()}
          </Container>
          <Button onClick={() => {
            setMask('Exporting degustation data to google sheet');
            exportDegustationToGoogleSheet(degustation)
              .then(() => setMask(null));
          }}>Export to Google</Button>
        </div>
      }
    </div>
  );
}

export default Degustation;
