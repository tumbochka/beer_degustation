import  React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import Application from "./components/Application/Application";
import {createUser} from "./persistence/Persistence";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(async userAuth => {
      const user = await createUser(userAuth);
      setUser(user);
    });
  });

  return(
    <div>
      <Application user = {user} />
    </div>
  );
};

export default App;
