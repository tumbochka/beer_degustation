import React from "react";
import { useLocation } from "@reach/router"
import { parse } from "query-string"
import config from "../../config";
import SignUp from "../SignUp/SignUp";

const UntappdCallback = () => {
  const location = useLocation();
  const query = parse(location.search);
  const code = query.code;
  if(code) {
    const authorizeUrl =
      `${config.untappdAuthorizeUrl}?client_id=${encodeURIComponent(config.untappdClientId)}&client_secret=${encodeURIComponent(config.untappdClitntSecret)}&response_type=code&redirect_url=callback&code=${encodeURIComponent(code)}`;
    fetch(authorizeUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
      .then(data => {
        const accessToken = data.access_token;
        fetch(`${config.untappdApiUrl}user/info/?access_token=${encodeURIComponent(accessToken)}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            }
          })
          .then(data => {
            const untappdUser = data.response.user;
            const user = {
              email: untappdUser.email_address,
              firstName: untappdUser.first_name,
              lastName: untappdUser.lastName,
              photoUrl: untappdUser.user_avatar_hd,
              untappdName: untappdUser.user_name,
              untappdAccessToken: accessToken
            }
            return (
              <SignUp user={user} />
            )
          })
          .catch(error => {
            return (
              <SignUp externalError ={error.message} />
            );
          })
      });
  } else {
    return (
      <SignUp externalError = "Untapped auth error" />
    );
  }
}

export default UntappdCallback;
