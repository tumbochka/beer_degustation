import  React, { useEffect, useState } from "react";
import { auth, generateUserDocument } from "../firebase";
import Application from "../components/Application/Application";

const UserProvider = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(async userAuth => {
      const user = await generateUserDocument(userAuth);
      setUser(user);
    });
  });

  return(
    <div>
      <Application user = {user} />
    </div>
  );
};

export default UserProvider;
