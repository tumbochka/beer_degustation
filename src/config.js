const config = {
  apiUrl:
    process.env.NODE_ENV === "production" ? window.location.origin : "http://" + window.location.hostname + ":5000",
  untappdApiUrl: "https://api.untappd.com/v4/",
  untappdAuthenticateUrl: "https://untappd.com/oauth/authenticate/",
  untappdAuthorizeUrl: "https://untappd.com/oauth/authorize/",
  untappdClientId: "21A86E4A8453F99FAEA02AB681E869114EE6F52C",
  untappdClitntSecret: "F5B38868AE44D884D7FF063807C144CFBB906A89"
};

export default config;
