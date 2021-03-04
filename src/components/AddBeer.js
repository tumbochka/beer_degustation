import React, {useState, useEffect} from "react";
import {Form, Button, Col, Row} from "react-bootstrap";
import Beer from "./Beer";
import {fetchBeerDetails, searchBeerOnUntappd, updateBeer} from "../services/Beer";
import {searchOnUntappd} from "../services/Beer";

const AddBeer = ({degustation, refreshBeers}) => {
    const [beer, setBeer] = useState(null);
    const [foundBeers, setFoundBeers] = useState([]);
    const [isSearching, setSearching] = useState(false);
    const [formDisabled, setFormDisabled] = useState(false);
    const [values, setValues] = useState({
        beerName: '',
        breweryName: '',
        beerIbu: 0,
        beerAbv: 0,
        beerStyle: '',
        beerPlato: 0,
        beerVolume: 0,
        search: '',
    });

    useEffect(() => {
        const timeOutId = setTimeout(() => search(), 500);
        return () => clearTimeout(timeOutId);
    }, [values.search]);

    const valuesToBeer = (newValues) => {
        beer.beer.beer_name = newValues.beerName;
        beer.beer.beer_abv = newValues.beerAbv;
        beer.beer.beer_ibu = newValues.beerIbu;
        beer.beer.beer_style = newValues.beerStyle;
        beer.beer.plato = newValues.beerPlato;
        beer.volume = newValues.beerVolume;
        beer.brewery.brewery_name = newValues.breweryName;
        setBeer(beer);
    }

    const beerToValues = (beer) => {
        values.breweryName = beer.brewery.brewery_name;
        values.beerVolume = beer.volume;
        values.beerPlato = beer.beer.plato;
        values.beerStyle = beer.beer.beer_style;
        values.beerAbv = beer.beer.beer_abv;
        values.beerName = beer.beer.beer_name;
        values.beerIbu = beer.beer.beer_ibu;
        setValues(values);
    }

    const clearValues = () => {
        setValues({
            beerName: '',
            breweryName: '',
            beerIbu: 0,
            beerAbv: 0,
            beerStyle: '',
            beerPlato: 0,
            beerVolume: 0,
            search: ''
        });
    }


    const handleInputChange = e => {
        const {name, value} = e.target;
        setValues({...values, [name]: value});
        valuesToBeer({...values, [name]: value});
    }

    const newBeer = () => {
        const newBeer = {
            id: null,
            checkin_count: null,
            volume: null,
            picture: null,
            beer: {
                bid: null,
                beer_name:  null,
                beer_label: null,
                beer_abv:  null,
                beer_ibu:  null,
                beer_description: null,
                beer_style:  null,
                rating: null,
                plato:  null,
                rating_score: null
            },
            brewery: {
                brewery_id: null,
                brewery_name:  null,
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

    const search = () => {
        if(isSearching) {
            return;
        }
        if(values.search && values.search.length > 3) {
            setSearching(true);
            if(isNaN(values.search)) {
                searchOnUntappd(values.search)
                    .then(beers => {
                        setFoundBeers(beers);
                        console.log('found beers', beers);
                        setSearching(false);
                    })
                    .catch(e => {
                        setSearching(false);
                    });
            } else {
                fetchBeerDetails(values.search)
                    .then(beer => {
                        if(beer) {
                            setFoundBeers([beer]);
                            console.log('found beer', beer);
                        }
                        setSearching(false);
                    })
            }
        }
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
                    console.log('found beers', beers);
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
                setBeer(foundBeer);
                beerToValues(foundBeer);
                setFoundBeers([]);
            };

            return (
                <Beer
                    key={foundBeer.beer.uid}
                    beer={foundBeer}
                    buttons={ [{ onClick: onClick, onClickCaption: "Select"}] }
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
                            Search
                        </Form.Label>
                        <Col >
                            <Form.Control
                                type="text"
                                name="search"
                                disabled={formDisabled}
                                value={values.search}
                                onChange={e=>handleInputChange(e)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                    <Form.Label column sm="1">
                        Brewery Name
                    </Form.Label>
                        <Col sm="5">
                    <Form.Control
                        type="text"
                        name="breweryName"
                        disabled={formDisabled}
                        value={values.breweryName}
                        onChange={e => {
                            handleInputChange(e);
                            const value = e.target.value;
                            setTimeout(() => {
                                if(beer.brewery.brewery_name === value) {
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
                        name="beerName"
                        disabled={formDisabled}
                        value={values.beerName}
                        onChange={e => {
                            handleInputChange(e);
                            const value = e.target.value;
                            setTimeout(() => {
                                if(beer.beer.beer_name === value) {
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
                        name="beerAbv"
                        disabled={formDisabled}
                        value={values.beerAbv}
                        onChange={handleInputChange}
                    />
                        </Col>
                    <Form.Label column sm="1">
                        ibu
                    </Form.Label>
                    <Col sm="2">
                    <Form.Control
                        type="number"
                        name="beerIbu"
                        disabled={formDisabled}
                        value={values.beerIbu}
                        onChange={handleInputChange}
                    />
                    </Col>
                    <Form.Label column sm="1">
                        volume
                    </Form.Label>
                        <Col sm="2">
                    <Form.Control
                        type="number"
                        name="beerVolume"
                        disabled={formDisabled}
                        value={values.beerVolume}
                        onChange={handleInputChange}
                    />
                        </Col>
                    <Form.Label column sm="1">
                        Plato
                    </Form.Label>
                        <Col sm="2">
                    <Form.Control
                        type="number"
                        name="beerPlato"
                        disabled={formDisabled}
                        value={values.beerPlato}
                        onChange={handleInputChange}
                    />
                        </Col>

                    </Form.Group>

                   <Form.Group as={Row}>
                    <Form.Label column sm="1">
                        Style
                    </Form.Label>
                       <Col sm="4">
                    <Form.Control
                        type="text"
                        name="beerStyle"
                        disabled={formDisabled}
                        value={values.beerStyle}
                        onChange={handleInputChange}
                    />
                       </Col>
                    </Form.Group>
                </Form>
                <Button onClick={() => {
                    setFormDisabled(true);
                    degustation.beers.push(beer);
                    console.log('before update', degustation.beers);
                    updateBeer(degustation, beer)
                      .then(degustation => {
                          refreshBeers(degustation.beers);
                          console.log('after update', degustation.beers);
                          newBeer();
                          clearValues();
                          setFormDisabled(false);
                      });

                }}>Add</Button>
                <Button onClick={() => {
                    newBeer();
                    clearValues();
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
};


export default AddBeer;
