import React, {useState}  from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import DatePicker from "react-datepicker";
import {updateDegustation} from "../persistence/Persistence";

import "react-datepicker/dist/react-datepicker.css";

const DegustationProperties = ({degustation}) => {
  const [formDisabled, setFormDisabled] = useState(false);
  const [editDegustationProperties, setEditDegustationProperties] = useState(false);
  const [degustationValues, setDegustationValues] = useState({
    title: degustation.title,
    location: degustation.location ?? '',
    avatar: degustation.avatar ?? '',
    date: degustation.date ?
      (degustation.date.seconds ? new Date(degustation.date.seconds * 1000) : new Date(degustation.date))
      : new Date()
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
                selected={degustationValues.date}
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
          if(degustationValues.date) {
            degustationValues.date = degustationValues.date.toISOString();
          }
          updateDegustation({...degustation, ...degustationValues})
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
          Degustation Properties
        </Button>
      </div>
    }
  </div>

};

export default DegustationProperties;
