import React, {useState}  from "react";
import {getDegustation, getDegustations, updateDegustation} from "../persistence/Persistence";
import Degustation, {DEGUSTATION_TYPE_EDIT, DEGUSTATION_TYPE_TAKE_PART} from "./Degustation";
import {navigate, useMatch} from "@reach/router";
import {Container, Row, Col, Button} from "react-bootstrap";
import {sortBeers} from "../services/Degustation";

import firebase from "firebase";
import AddDegustation from "./AddDegustation";
// import {onMessageListener} from "../firebase";



const Degustations = ({user}) => {
  const [degustations, setDegustations] = useState(null);
  const [degustation, setDegustation] = useState(null);
  const [degustationMode, setDegustationMode] = useState(null);

      const match = useMatch('/Degustations/:degustationId/:mode');
      if (degustations && match && !degustation) {
          setDegustation(degustations.find(degustation => degustation.id === match.degustationId));
          setDegustationMode(match.mode);
      }

  if(degustation){
      window.history.replaceState(null, `Degustation ${degustationMode}`, `/Degustations/${degustation.id}/${degustationMode}`);
  }
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
                setDegustationMode(DEGUSTATION_TYPE_EDIT);
              }
            }>Edit</Button>
          </Col>
            <Col>
                <Button onClick={async () => {
                    const registerUserForDegustation = firebase.functions().httpsCallable('registerUserForDegustation');
                    registerUserForDegustation({degustationId:degustation.id, userId:user.uid })
                        .then(result => setDegustation(result.data));

                    setDegustationMode(DEGUSTATION_TYPE_TAKE_PART);
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
        const sortedDegustation = {...degustation, beers: sortBeers(degustation.beers, fieldName, direction)};
        setDegustation(sortedDegustation);
        if(DEGUSTATION_TYPE_EDIT === degustationMode) {
          updateDegustation(sortedDegustation);
        }
      }
    }

    if (null === degustations) {
        getDegustations()
            .then(degustations =>
            {
                const sortedDegustations = degustations.sort((a, b) =>  {
                    const date1 = (a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date));
                    const date2 = (b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date));
                    return (date2 - date1);
                });
                setDegustations(sortedDegustations);
            });
    }


  // onMessageListener()
  //   .then((payload) => {
  //     const {body, data} = payload.data;
  //     if ('Degustation update' === body) {
  //       setDegustation(data);
  //     }
  //   })
  //   .catch((err) => {console.log('Message error', err)});

  return (

    <div>
      {
        degustation ?
        <div>
          <Degustation degustation={degustation} user={user} mode={degustationMode} sortCurrentDegustationBeers={sortCurrentDegustationBeers}/>
          <Button onClick={() => {
              setDegustation(null);
              navigate('/Degustations');
          }}>Close</Button>
        </div> : (
            degustations ?
              <div>
              <AddDegustation />
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


