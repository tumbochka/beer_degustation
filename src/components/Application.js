import React from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import UserProfile from "./UserProfile";
import PasswordReset from "./PasswordReset";
import UntappdCallback from "./UntappdCallback";
import UserEdit from "./Edit";
import GoogleDocsPicker from "./GoogleDocPicker";

function Application(prop) {
  const user = prop.user;

  return (
    user && user.email ?
      <Router>
        <UserProfile user={user} path="/" />
        <UserEdit user={user} path="Edit" />
        <GoogleDocsPicker path="GoogleDocsPicker" />

      </Router>
      :
      <Router>
        <SignUp path="signUp" />
        <SignIn path="/" />
        <PasswordReset path = "passwordReset" />
        <UntappdCallback path="callback" />
      </Router>

  );
}
export default Application;
