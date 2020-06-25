/** @jsx jsx */
import React, {useState} from "react";
import {auth} from "../firebase";
import { css, jsx } from '@emotion/core';
import {Link} from "@reach/router";
import config from "../config";
import {untappdAuthorize} from "../services/Untappd";
import {updateUser} from "../persistence/Persistence";

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
    <div className = "mx-auto w-11/12 md:w-2/4 py-8 px-4 md:px-8">
      {error !== null && (
        <div className="py-4 bg-red-600 w-full text-white text-center mb-3">
          {error}
        </div>
      )}
      <div className="flex border flex-col items-center md:flex-row md:items-start border-blue-400 px-3 py-4">
        <div
          css={css`
          background: url(${logoPath})  no-repeat center center;
          backgroundSize: cover;
          height: 200px;
          width: 200px;
        `}
        ></div>

        <div className = "md:pl-4">
          <h2 className = "text-2xl font-semibold">{firstName}</h2>
          <h2 className = "text-2xl font-semibold">{lastName}</h2>
          <h2 className = "text-2xl font-semibold">{untappdName}</h2>
          <h3 className = "italic">{email}</h3>
        </div>
      </div>
      <div>
        <Link to="Edit" state={{ user: data.user}}>Edit User Profile</Link>
      </div>
      <div>
        <Link to="GoogleDocsPicker"> Import a degustation</Link>
      </div>
      <div>
      <button onClick={event => populateDataFromUntappd(event)}>
        Populate user data from Untappd
      </button>
      </div><div>
      <button className = "w-full py-3 bg-red-600 mt-4 text-white" onClick = {() => {auth.signOut()}}>Sign out</button>
    </div>
    </div>
  )
};
export default UserProfile;
