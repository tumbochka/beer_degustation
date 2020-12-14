import React, {useState} from "react";
import {Form, Button, Col, Row} from "react-bootstrap";
import Beer from "./Beer";
import {searchBeerOnUntappd} from "../services/Beer";

const AddBeer = ({degustation, refreshBeers}) => {
    const [beer, setBeer] = useState(null);
    const [foundBeers, setFoundBeers] = useState([]);
    const [isSearching, setSearching] = useState(false);

    const newBeer = () => {
        const newBeer = {
            id: null,
            checkin_count: null,
            volume: null,
            picture: null,
            beer: {
                bid: null,
                beer_name: null,
                beer_label: null,
                beer_abv: null,
                beer_ibu: null,
                beer_description: null,
                beer_style: null,
                rating: null,
                plato: null,
                rating_score: null
            },
            brewery: {
                brewery_id: null,
                brewery_name: null,
                brewery_slug: null,
                brewery_label: null,
                country_name: null,
            },
        };

        setBeer(newBeer);
    }

    if(null === beer) {
        newBeer();
    }

    const searchBeer = () => {
        if(isSearching) {
            return;
        }
        if(beer.beer.beer_name && beer.beer.beer_name.length > 3 && beer.brewery.brewery_name && beer.brewery.brewery_name.length > 3) {
            setSearching(true);
            searchBeerOnUntappd(beer)
                .then(beers => {
                    setFoundBeers(beers);
                    setSearching(false);
                })
                .catch(e => {
                    setSearching(false);
                });
        }
    }

    const renderFoundBeers = (beers) => {
        return beers.map(foundBeer => {
            const onClick = () => {
                beer.beer = foundBeer.beer;
                beer.brewery = foundBeer.brewery;
                setBeer(beer);
                setFoundBeers([]);
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

    return(
        <div>
        {beer !== null ?
            <div>
                <h3>Add beer</h3>
                <Form>
                    <Form.Group as={Row}>
                    <Form.Label column sm="1">
                        Brewery Name
                    </Form.Label>
                        <Col sm="5">
                    <Form.Control
                        type="text"
                        value={beer.brewery.brewery_name}
                        onChange={e => {
                            const value = e.target.value;
                            beer.brewery.brewery_name = value;
                            setTimeout(() => {
                                if(beer.brewery.brewery_name == value) {
                                    searchBeer();
                                }
                            }, 500);

                        }}
                    />
                        </Col>
                    <Form.Label column sm="1">
                        Beer Name
                    </Form.Label>
                        <Col sm="5">
                    <Form.Control
                        type="text"
                        value={beer.beer.beer_name}
                        onChange={e => {
                            const value = e.target.value;
                            beer.beer.beer_name = value;
                            setTimeout(() => {
                                if(beer.beer.beer_name == value) {
                                    searchBeer();
                                }
                            }, 500);

                        }}
                    />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                    <Form.Label column sm="1">
                        Abv
                    </Form.Label>
                        <Col sm="2">
                    <Form.Control
                        type="number"
                        value={beer.beer.beer_abv}
                        onChange={e => {
                            beer.beer.beer_abv = e.target.value;
                        }}
                    />
                        </Col>
                    <Form.Label column sm="1">
                        ibu
                    </Form.Label>
                    <Col sm="2">
                    <Form.Control
                        type="number"
                        value={beer.beer.beer_ibu}
                        onChange={e => {
                            beer.beer.beer_ibu = e.target.value;
                        }}
                    />
                    </Col>
                    <Form.Label column sm="1">
                        volume
                    </Form.Label>
                        <Col sm="2">
                    <Form.Control
                        type="number"
                        value={beer.volume}
                        onChange={e => {
                            beer.volume = e.target.value;
                        }}
                    />
                        </Col>
                    <Form.Label column sm="1">
                        plato
                    </Form.Label>
                        <Col sm="2">
                    <Form.Control
                        type="number"
                        value={beer.beer.plato}
                        onChange={e => {
                            beer.beer.plato = e.target.value;
                        }}
                    />
                        </Col>

                    </Form.Group>

                   <Form.Group as={Row}>
                    <Form.Label column sm="1">
                        beer_style
                    </Form.Label>
                       <Col sm="4">
                    <Form.Control
                        type="text"
                        value={beer.beer.beer_style}
                        onChange={e => {
                            beer.beer.beer_style = e.target.value;
                        }}
                    />
                       </Col>
                    </Form.Group>
                </Form>
                <Button onClick={() => {
                    degustation.beers.push(beer);
                    refreshBeers();
                    newBeer();
                }}>Add</Button>
                <Button onClick={() => {
                    newBeer();
                }}>Clear</Button>

                { foundBeers.length > 0 ?
                    <div>
                    <h4> Select a beer</h4>
                        { renderFoundBeers(foundBeers) }
                    </div>
                    : ''
                }
            </div>
            : ''
        }
        </div>
    )
}

export default AddBeer;
