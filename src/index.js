import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";

import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-social/bootstrap-social.css";
import "font-awesome/css/font-awesome.css";
import "./index.scss";

export const history = createBrowserHistory();

const app = (
  <Router history={history}>
    <App />
  </Router>
);

ReactDOM.render(app, document.getElementById("root"));
