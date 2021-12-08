import React, {useState}  from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import DatePicker from "react-datepicker";
import {createDegustation} from "../persistence/Persistence";

import "react-datepicker/dist/react-datepicker.css";
import {instance} from "firebase-functions/lib/providers/database";

const AddDegustation = () => {
  const [formDisabled, setFormDisabled] = useState(false);
  const [editDegustationProperties, setEditDegustationProperties] = useState(false);
  const [degustationValues, setDegustationValues] = useState({
    location:  '',
    avatar: '',
    date: new Date()
  });

  const handleInputChange = e => {
    const {name, value} = e.target;
    setDegustationValues({...degustationValues, [name]: value});
  }

  const handleDateChange = date => {
    setDegustationValues({...degustationValues, date: date})
  }

  return <div>
    {editDegustationProperties ?
      <div>
        <Form>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              Degustation Date
            </Form.Label>
            <Col>
              <DatePicker
                selected={('string' === typeof degustationValues.date  ? new Date(degustationValues.date) : degustationValues.date)}
                onChange={handleDateChange}
                disabled={formDisabled}
              />
            </Col>
            <Col> </Col>
            <Col> </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              Degustation Title
            </Form.Label>
            <Col>
              <Form.Control
                type="text"
                name="title"
                value={degustationValues.title}
                onChange={handleInputChange}
                disabled={formDisabled}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              Degustation Avatar
            </Form.Label>
            <Col>
              <Form.Control
                type="text"
                name="avatar"
                value={degustationValues.avatar}
                onChange={handleInputChange}
                disabled={formDisabled}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              Degustation Location
            </Form.Label>
            <Col>
              <Form.Control
                type="text"
                name="location"
                value={degustationValues.location}
                onChange={handleInputChange}
                disabled={formDisabled}
              />
            </Col>
          </Form.Group>
        </Form>
        <Button onClick={() => {
          setFormDisabled(true);
          createDegustation(
              degustationValues.date instanceof Date ?  degustationValues.date.toISOString(): degustationValues.date,
              degustationValues.title,
              degustationValues.avatar,
              degustationValues.location
          )
            .then(() => {
              setEditDegustationProperties(false);
              window.location.reload();
            })
            .finally(() => {
              setFormDisabled(false);
            })
          ;
        }}>
          Save
        </Button>
        <Button onClick={() => {
          setEditDegustationProperties(false);
        }}>Cancel</Button>
      </div>

      :
      <div>
        <Button onClick={() => {
          setEditDegustationProperties(true);
        }}>
          New Degustation
        </Button>
      </div>
    }
  </div>

};

export default AddDegustation;
