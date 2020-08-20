import  React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import Application from "./components/Application";
import {createUser} from "./persistence/Persistence";

const App = () => {
  const [user, setUser] = useState(null);
  const [previousUserAuth, setPreviousUserAuth] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(async userAuth => {
      if(userAuth !== previousUserAuth) {
        setPreviousUserAuth(userAuth);
        const user = await createUser(userAuth);
        console.log('Token ID changed: ', user);
        setUser(user);
      }
    });
  });

  return(
    <div>
      <Application user = {user} />
    </div>
  );
};

export default App;
