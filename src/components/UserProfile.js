/** @jsx jsx */
import React, {useState} from "react";
import {auth} from "../firebase";
import { css, jsx } from '@emotion/core';
import {Link} from "@reach/router";
import config from "../config";
import {untappdAuthorize} from "../services/Untappd";
import {updateUser} from "../persistence/Persistence";
import {Container, Row, Col, Button} from "react-bootstrap";

const UserProfile = (data) => {
  const [isAuthRequestSent, setAuthRequestSent] = useState(false);
  const [error, setError] = useState(null);
  const {photoURL, firstName, lastName, untappdName, email} = data.user;
  const code = data.code;
  const logoPath = photoURL ?
    photoURL :
    'https://res.cloudinary.com/dqcsk8rsc/image/upload/v1577268053/avatar-1-bitmoji_upgwhc.png';

  const populateDataFromUntappd = (event) => {
    event.preventDefault();
    const callbackUrl = window.location.protocol + '//' + window.location.host + '/callback';
    const authenticateUrl =
      `${config.untappdAuthenticateUrl}?client_id=${encodeURIComponent(config.untappdClientId)}&client_secret=${encodeURIComponent(config.untappdClitntSecret)}&response_type=code&redirect_url=${callbackUrl}`;
    window.location.replace(authenticateUrl);
  }

  if(code && !isAuthRequestSent) {
    setAuthRequestSent(true);
    untappdAuthorize(code, (result) => {
      if (result.error) {
        setError(result.error);
      } else {
        updateUser(data.user, result);
      }
      setAuthRequestSent(false);
    });
  }

  return (
    <div>
      {error !== null && (
        <div>
          {error}
        </div>
      )}
      <Container>
        <Row>
          <Col>
        <div
          css={css`
          background: url(${logoPath})  no-repeat center center;
          backgroundSize: cover;
          height: 200px;
          width: 200px;
        `}
        ></div>
          </Col>
        </Row>
          <Row>
            <Col>{firstName}</Col>
            <Col>{lastName}</Col>
          <Col>{untappdName}</Col>
            <Col>{email}</Col>
          </Row>


      <Row>
        <Col>
        <Link to="Edit" state={{ user: data.user}}>Edit User Profile</Link>
        </Col>
        <Col>
          <Link to="DegustationSelector"> Import a degustation</Link>
        </Col>
        <Col>
          <Link to="Degustations"> View degustations</Link>
        </Col>
        <Col>
          <Button onClick={event => populateDataFromUntappd(event)}>
            Populate user data from Untappd
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
        <Button onClick = {() => {auth.signOut()}}>Sign out</Button>
        </Col>
      </Row>
      </Container>
    </div>

  )
};
export default UserProfile;
