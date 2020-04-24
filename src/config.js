const config = {
  apiUrl:
    process.env.NODE_ENV === "production" ? window.location.origin : "http://" + window.location.hostname + ":5000"
};

export default config;
