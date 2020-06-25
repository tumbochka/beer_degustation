import React from "react";
import { useLocation } from "@reach/router"
import { parse } from "query-string"
import UserProfile from "./UserProfile";

const UntappdCallback = ({user}) => {
  const location = useLocation();
  const query = parse(location.search);
  const code = query.code;

  return (
    <UserProfile code={code} user={user} />
    );
}

export default UntappdCallback;
