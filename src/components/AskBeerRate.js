import React, {useState} from "react";
import {Form, Button, Col, Row} from "react-bootstrap";
import {rateBeer} from "../services/Degustation";
import {getDegustation} from "../persistence/Persistence";

const AskBeerRate = ({degustation, user, beer, refreshBeers, onClose}) => {
  const [mask, setMask] = useState(null);
  const [rate, setRate] = useState(0);
  const [shout, setShout] = useState('');
  return (
    <div className='modal-dialog'>
      <div className='modal-content'>
        <div className='modal-header'>
          <h5 className="modal-title">
            {mask ? mask : <span>Please rate beer {beer.brewery.brewery_name} {beer.beer.beer_name}</span> }
          </h5>
        </div>
        <div className='modal-body'>
          <strong>Current rate is {rate}</strong>
          <Form>
            <Form.Group as={Row}>
              <Col>
                <Form.Control
                  type="range"
                  tooltip='on'
                  step={0.5}
                  min={0.5}
                  max={10}
                  value={rate}
                  onChange={(e) => {
                    setRate(e.target.value)
                  }}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Col>
                <Form.Control
                  type="text"
                  value={shout}
                  onChange={(e) => {
                    setShout(e.target.value)
                  }}
                />
              </Col>
            </Form.Group>
          </Form>
        </div>
        <div className='modal-footer'>
          <Button onClick={() => {
            setMask('In progress...')
            rateBeer(degustation, beer, user, rate, shout)
              .then(() => {
                getDegustation(degustation.id)
                    .then((freshDegustation) => {
                      refreshBeers(freshDegustation.beers);
                      setMask(null);
                      onClose();
                    });
              })
              .catch(e => setMask('Error: ' + e.message))
            ;
          }}>Rate!</Button> <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default AskBeerRate;
