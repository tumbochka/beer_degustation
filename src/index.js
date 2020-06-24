import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";

import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-social/bootstrap-social.css";
import "font-awesome/css/font-awesome.css";
import "./index.scss";

export const history = createBrowserHistory();

const app = (
  <App />
);

ReactDOM.render(app, document.getElementById("root"));
