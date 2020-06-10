import React from "react";
import { useLocation } from "@reach/router"
import { parse } from "query-string"
import config from "../../config";
import SignUp from "../SignUp/SignUp";
import firebase from "firebase";

const UntappdCallback = () => {
  const location = useLocation();
  const query = parse(location.search);
  const code = query.code;
  if (code) {
    const untappdAuthorize = firebase.functions().httpsCallable('untappdAuthorize');
    const callbackUrl = window.location.protocol + '//' + window.location.host + '/callback';
    untappdAuthorize({
      url: config.untappdAuthorizeUrl,
      clientId: config.untappdClientId,
      clientSecret: config.untappdClitntSecret,
      redirectUrl: callbackUrl,
      code: code
    }).then(result => {
      console.log(result);
      const accessToken = result.access_token;
      const userDetailsUrl = config.untappdApiUrl + 'user/info/';
      const untappdFetchUserDetails = firebase.functions().httpsCallable('untappdFetchUserDetails');
      untappdFetchUserDetails({
        url: userDetailsUrl,
        accessToken: accessToken
      }).then(result => {
        console.log(result);
        const untappdUser = result.response.user;
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
    }).catch(error => {
      return (
        <SignUp externalError ={error.message} />
      );
    });
  } else {
    return (
      <SignUp externalError = "Untapped auth error" />
    );
  }

}

export default UntappdCallback;
