const config = {
  apiUrl:
    process.env.NODE_ENV === "production" ? window.location.origin : "http://" + window.location.hostname + ":5000",
  untappdApiUrl: "https://api.untappd.com/v4/",
  untappdAuthenticateUrl: "https://untappd.com/oauth/authenticate/",
  untappdAuthorizeUrl: "https://untappd.com/oauth/authorize/",
  untappdClientId: process.env.REACT_APP_UNTAPPD_CLIENT_ID,
  untappdClitntSecret: process.env.REACT_APP_UNTAPPD_CLIENT_SECRET,
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  googleDeveloperKey: process.env.REACT_APP_GOOGLE_DEVELOPER_KEY,
  googleServiceAccountEmail: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
  googleServiceAccountKey: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY
};

export default config;
