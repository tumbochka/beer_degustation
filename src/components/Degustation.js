import React, {useState} from "react";
import Beer from "./Beer";
import {Container, Button, Row, Col} from "react-bootstrap";
import {updateBeer, searchBeerOnUntappd, removeBeerFromDegustation} from "../services/Beer";
import {exportDegustationToGoogleSheet} from "../services/Degustation";
import AskBeerRate from "./AskBeerRate";
import AddBeer from "./AddBeer";

export const DEGUSTATION_TYPE_EDIT = 'edit';
export const DEGUSTATION_TYPE_TAKE_PART = 'take_part';

const Degustation = ({
    user,
    degustation,
    mode,
    sortCurrentDegustationBeers
  }) => {

  const [error, setError] = useState(null);
  const [beersToSelect, setBeersToSelect] = useState([]);
  const [beerToSelect, setBeerToSelect] = useState(null);
  const [mask, setMask] = useState(null);
  const [foundBeers, setFoundBeers] = useState([]);
  const [fetchingBeerDetails, setFetchingBeerDetails] = useState(false);
  const [beerToRate, setBeerToRate] = useState(null);
  const [beers, setBeers] = useState(degustation.beers);


  const pushToFoundBeers = beer => {
    if('object' == typeof beer) {
      const index = foundBeers.findIndex(updatedBeer => beer.id === updatedBeer.id);
      if (index >= 0) {
        foundBeers[index] = beer;
        setFoundBeers([...foundBeers]);
      } else {
        foundBeers.push(beer);
        setFoundBeers([...foundBeers]);
      }
    }
  }

  const searchAllBeersOnUntappd = async () => {
    setMask('Searching beers on Untappd');
    beers.forEach(async beer => {
      try {
        const searchBeers = await searchBeerOnUntappd(beer);
        if (!searchBeers || 0 === searchBeers.length) { // has'n found a beer
          pushToFoundBeers(beer);
        } else if (1 === searchBeers.length) { //found exactly one beer
          pushToFoundBeers({id: beer.id, ...searchBeers[0]});
        } else { // found several beers
          beersToSelect.push(searchBeers.map(searchBeer => {
            return {id: beer.id, originalBeer: beer, ...searchBeer}
          }));
        }
      } catch (e) {
        setError(e.message);
        pushToFoundBeers(beer);
      }
    });
  }

  const fetchAllBeersDetailsFromUntappd = () => {
    console.log('fetching beers details', fetchingBeerDetails);
    console.log('beers', beers.length);
    console.log('found beers', foundBeers.length);
    if (false === fetchingBeerDetails && beers.length === foundBeers.length) {

      setFetchingBeerDetails(true);
      setMask('Fetching beer details...');
      Promise.all(foundBeers.filter(beer => beer.beer.bid).map(beer => updateBeer(degustation, beer)))
        .then(() => {
          setFoundBeers([]);
          setMask(null);
          setFetchingBeerDetails(false);
        });
    }
  }

  const refreshBeers = (beers) => {
    setBeers([...beers]);
  }

  const renderBeers = () => {
    return beers.map(beer => {
      let onClick, caption;
      if(DEGUSTATION_TYPE_EDIT === mode) {
        onClick = () => {
          setBeers(removeBeerFromDegustation(degustation, beer).beers);
        };
        caption = 'Delete';
      } else if(DEGUSTATION_TYPE_TAKE_PART === mode) {
        onClick = () => {
          setBeerToRate(beer)
        };
        caption = 'Rate';
      }
      return (
        <Beer
          key={beer.id}
          beer={beer}
          onClick={onClick}
          onClickCaption={caption}
        />
      );
    });
  };

  const renderBeerForSelection = (beers) => {
    return beers.map(beer => {
      const onClick = () => {
            pushToFoundBeers(beer);
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
    setBeersToSelect(beersToSelect);
  }

  return (
    <div>
      {mask ? <div className="mask">{mask}</div> : ''}
      {error ? <div className="error">{error}</div> : ''}
      {beerToSelect
        ?
        <div>
          <div className="caption">
            <Col>Please select a beer</Col>
          </div>
          <div className="sub-caption">
            <Col>Original beer</Col>
            <Col>
              {beerToSelect[0].originalBeer.brewery.brewery_name + ' ' + beerToSelect[0].originalBeer.beer.beer_name}
            </Col>
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
          { beerToRate ? <AskBeerRate degustation={degustation} beer={beerToRate} user={user} />: ''}
          <div className="caption">
            Degustation: {degustation.date.seconds ? new Date(degustation.date.seconds * 1000).toDateString() : new Date(degustation.date).toDateString()}, {degustation.title}
            { DEGUSTATION_TYPE_EDIT === mode ? <Button onClick={searchAllBeersOnUntappd}>Update all beers from untappd</Button> :''}
          </div>
          {DEGUSTATION_TYPE_EDIT === mode ? <AddBeer degustation={degustation} refreshBeers={refreshBeers} /> : '' }
          <Container>
            <Row>
              <Col>Label</Col>
              <Col>Untappd ID</Col>
              <Col>Brewery</Col>
              <Col>Beer Name <div center="true"><Button onClick={()=>{
                sortCurrentDegustationBeers("beer.beer_name", "asc");
              }}>Sort</Button></div></Col>
              <Col>Style</Col>
              <Col>ABV <div center="true"><Button onClick={()=>{
                sortCurrentDegustationBeers("beer.beer_abv", "asc");
              }}>Sort</Button></div></Col>
              <Col>IBU</Col>
              <Col>Description</Col>
              <Col>Actions</Col>
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
