import firebase from "firebase";
import config from "../config";

export const untappdAuthorize = (code, callback) => {
  const untappdAuthorize = firebase.functions().httpsCallable('untappdAuthorize');
  const callbackUrl = window.location.protocol + '//' + window.location.host + '/callback';
  untappdAuthorize({
    url: config.untappdAuthorizeUrl,
    clientId: config.untappdClientId,
    clientSecret: config.untappdClitntSecret,
    redirectUrl: callbackUrl,
    code: code
  }).then(result => {
    const data = JSON.parse(result.data);
    const accessToken = data.response.access_token;
    const userDetailsUrl = config.untappdApiUrl + 'user/info/';
    const untappdFetchUserDetails = firebase.functions().httpsCallable('untappdFetchUserDetails');
    untappdFetchUserDetails({
      url: userDetailsUrl,
      accessToken: accessToken
    }).then(result => {
      const data = JSON.parse(result.data);
      const untappdUser = data.response.user;

      callback({
        untappdEmail: untappdUser.settings.email_address,
        lastName: untappdUser.last_name,
        firstName: untappdUser.first_name,
        photoUrl: untappdUser.user_avatar_hd,
        untappdName: untappdUser.user_name,
        untappdAccessToken: accessToken
      });
    }).catch(error => {
      console.log('auth error');
      callback({error: error.message});
    });
  }).catch(error => {
    console.log('auth error');
    callback({error: error.message});
  });
}
