import React from "react";
import { Router } from "@reach/router";
import SignIn from "../SignIn/SignIn";
import SignUp from "../SignUp/SignUp";
import ProfilePage from "../ProfilePage/ProfilePage";
import PasswordReset from "../PasswordReset/PasswordReset";
import UntappdCallback from "../UntappdCallback/UntappdCallback";
function Application(prop) {
  const user = prop.user;

  return (
    user && user.email ?
      <ProfilePage user={user} />
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
