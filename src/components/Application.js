import React from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import UserProfile from "./UserProfile";
import UntappdCallback from "./UntappdCallback";
import UserEdit from "./UserEdit";
import GoogleDocsPicker from "./GoogleDocPicker";
import Degustations from "./Degustations";
import Degustation from "./Degustation";

function Application(prop) {
  const user = prop.user;

  return (
    user && user.email ?
      <Router>
        <UserProfile user={user} path="/" />
        <UserEdit user={user} path="Edit" />
        <GoogleDocsPicker path="GoogleDocsPicker" />
        <Degustations path="Degustations" />
        <Degustation path="Degustation" />
        <UntappdCallback user={user} path="callback" />
      </Router>
      :
      <Router>
        <SignIn path="/" />
      </Router>

  );
}
export default Application;
