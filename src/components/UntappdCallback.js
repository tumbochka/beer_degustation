import React from "react";
import { useLocation } from "@reach/router"
import { parse } from "query-string"
import SignUp from "./SignUp";

const UntappdCallback = () => {
  const location = useLocation();
  const query = parse(location.search);
  const code = query.code;

  return (
    <SignUp code={code} />
    );
}

export default UntappdCallback;
