import React, {useState}  from "react";
import {getDegustation, getDegustations} from "../persistence/Persistence";
import Degustation from "./Degustation";
import {navigate} from "@reach/router";
import {Container, Row, Col, Button} from "react-bootstrap";
import {sortBeers} from "../services/Degustation";
import {jsx} from "@emotion/core";
import firebase from "../../firebase.json";

const Degustations = ({user}) => {
  const [degustations, setDegustations] = useState(null);
  const [degustation, setDegustation] = useState(null);
  const refreshDegustation = async () => {
      if (degustation) {
          const newDegustation = await getDegustation(degustation.id);
          setDegustation(newDegustation);
      }
  };
  const renderDegustations = () => {
    return degustations.map(degustation => {
      return (
        <Row key={degustation.id}>
          <Col>
            {degustation.date.seconds ? new Date(degustation.date.seconds * 1000).toDateString() : new Date(degustation.date).toDateString()}
          </Col><Col>
            {degustation.title}
          </Col><Col>
            {degustation.beers.length}
          </Col><Col>
            <Button onClick={() => {
                setDegustation(degustation);
              }
            }>View</Button>
          </Col>
            <Col>
                <Button onClick={() => {
                    const registerUserForDegustation = firebase.functions().httpsCallable('registerUserForDegustation');
                    registerUserForDegustation({degustationId:degustation.id, userId:user.id });
                    setDegustation(degustation);
                }}>
                    Join degustation
                </Button>
            </Col>
        </Row>
      );
    });
  }

  const sortCurrentDegustationBeers = (fieldName, direction) => {
      if(degustation) {
          setDegustation({...degustation, beers: sortBeers(degustation.beers, fieldName, direction)});
      }
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
          <Degustation degustation={degustation} user={user} sortCurrentDegustationBeers={sortCurrentDegustationBeers}/>
          <Button onClick={() => {setDegustation(null)}}>Close</Button>
        </div> : (
            degustations ?
              <div>

              <div className="table-action">
                  <Button onClick={() => {navigate('/DegustationSelector')}}>Import degustation</Button>
              </div>

                <Container>
              <Row>
                <Col>Date</Col><Col> Title</Col><Col> Beers count</Col><Col>Actions</Col>
              </Row>
              {renderDegustations()}
            </Container>
              </div>
            :
            <div>"Loading..."</div>
          )
      }
    </div>

  );
}

export default Degustations;


