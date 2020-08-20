import React, {useState} from "react";
import {Form, Button, Col, Row} from "react-bootstrap";
import {rateBeer} from "../services/Degustation";

const AskBeerRate = ({degustation, user, beer}) => {
  const [mask, setMask] = useState(null);
  const [rate, setRate] = useState(0);
  const [shout, setShout] = useState('');
  return (
    <div className='popup'>
      <strong>{mask ? mask : ''}</strong>
      Please rate beer {beer.brewery.brewery_name} {beer.beer.beer_name} <br />
      <strong>Current rate is {rate}</strong>
      <Form>
        <Form.Group as={Row}>
          <Col>
            <Form.Control
              type="range"
              tooltip='on'
              step={0.5}
              min={0}
              max={10}
              value={rate}
              onChange={(e) => {setRate(e.target.value)} }
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Col>
            <Form.Control
              type="text"
              value={shout}
              onChange={(e) => {setShout(e.target.value)}}
            />
          </Col>
        </Form.Group>
      </Form>
      <Button  onClick={() => {
        setMask('In progress...')
        rateBeer(degustation, beer, user, rate, shout)
          .then(() => setMask(null))
          .catch(e => setMask('Error: ' + e.message))
        ;
      }} >Rate!</Button>
    </div>
  );
}

export default AskBeerRate;
