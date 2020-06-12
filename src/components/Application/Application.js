import React from "react";
import { Router } from "@reach/router";
import SignIn from "../Auth/SignIn/SignIn";
import SignUp from "../User/SignUp/SignUp";
import ProfilePage from "../User/ProfilePage/ProfilePage";
import PasswordReset from "../Auth/PasswordReset/PasswordReset";
import UntappdCallback from "../UntappdCallback/UntappdCallback";
import Edit from "../User/Edit/Edit";
import GoogleDocsPicker from "../Beer/GoogleDocSync/GoogleDocPicker";
import GoogleSheet from "../Beer/GoogleDocSync/GoogleSheet";
function Application(prop) {
  const user = prop.user;

  return (
    user && user.email ?
      <Router>
        <ProfilePage user={user} path="/" />
        <Edit user={user} path="Edit" />
        <GoogleDocsPicker path="GoogleDocsPicker" />
        <GoogleSheet path="GoogleSheet" />
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
