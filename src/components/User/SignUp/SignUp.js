import React, { useState } from "react";
import { Link } from "@reach/router";
import {createUser} from "../../../persistence/Persistence";
import {createUserWithEmailAndPassword} from "../../../auth/Email";
import config from "../../../config";
import {signInWithGoogle} from "../../../auth/Google";
import firebase from "firebase";

const SignUp = (data) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [untappdName, setUntappdName] = useState("");
  const [untappdAccessToken, setUntappdAccessToken] = useState("");
  const [isLadle, setIsLadle] = useState("");
  const [code, setCode] = useState(data.code ? data.code : null);
  const [error, setError] = useState(null);
  const [isAuthRequestSent, setAuthRequestSent] = useState(false);

  const createUserWithEmailAndPasswordHandler = async (event) => {
    event.preventDefault();
    try{
      const {user} = await createUserWithEmailAndPassword(email, password)
        .catch(error => {
          setError("Error creating user: "+ error.message);
        });
      createUser(user, {firstName, lastName, photoURL, untappdName, untappdAccessToken, isLadle});
    }
    catch(error){
      setError('Error Signing up with email and password: ' + error.message);
    }

    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhotoURL("");
    setUntappdName("");
    setUntappdAccessToken("");
    setIsLadle("");
  };

  const onChangeHandler = event => {
    const { name, value } = event.currentTarget;
    if (name === "userEmail") {
      setEmail(value);
    } else if (name === "userPassword") {
      setPassword(value);
    } else if (name === "firstName") {
      setFirstName(value);
    } else if (name === "lastName") {
      setLastName(value);
    } else if (name === "photoURL") {
      setPhotoURL(value);
    } else if (name === 'untappdName') {
      setUntappdName(value);
    }
  };

  const populateDataFromUntappd = (event) => {
    event.preventDefault();

    const callbackUrl = window.location.protocol + '//' + window.location.host + '/callback';
    const authenticateUrl =
      `${config.untappdAuthenticateUrl}?client_id=${encodeURIComponent(config.untappdClientId)}&client_secret=${encodeURIComponent(config.untappdClitntSecret)}&response_type=code&redirect_url=${callbackUrl}`;
    window.location.replace(authenticateUrl);
  }

  if (code) { // untapped callback returned code - performing authorization
    const untappdAuthorize = firebase.functions().httpsCallable('untappdAuthorize');
    const callbackUrl = window.location.protocol + '//' + window.location.host + '/callback';
    if (false === isAuthRequestSent) {
      console.log(code);
      setAuthRequestSent(true);
      untappdAuthorize({
        url: config.untappdAuthorizeUrl,
        clientId: config.untappdClientId,
        clientSecret: config.untappdClitntSecret,
        redirectUrl: callbackUrl,
        code: code
      }).then(result => {
        const data = JSON.parse(result.data);
        const accessToken = data.response.access_token;
        const userDetailsUrl = config.untappdApiUrl + 'user/info/';
        const untappdFetchUserDetails = firebase.functions().httpsCallable('untappdFetchUserDetails');
        untappdFetchUserDetails({
          url: userDetailsUrl,
          accessToken: accessToken
        }).then(result => {
          const data = JSON.parse(result.data);
          const untappdUser = data.response.user;
          console.log(untappdUser);
          setEmail(untappdUser.settings.email_address);
          setLastName(untappdUser.last_name);
          setFirstName(untappdUser.first_name)
          setPhotoURL(untappdUser.user_avatar_hd);
          setUntappdName(untappdUser.user_name);
          setUntappdAccessToken(accessToken);
        }).catch(error => {
          console.log('auth error');
          setError(error.message);
        });
      }).catch(error => {
        console.log('auth error');
        setError(error.message);
      });
    }
    setCode(null);
  }

  return (
    <div className="mt-8">
      <h1 className="text-3xl mb-2 text-center font-bold">Sign Up</h1>
      <div className="border border-blue-400 mx-auto w-11/12 md:w-2/4 rounded py-8 px-4 md:px-8">
        {error !== null && (
          <div className="py-4 bg-red-600 w-full text-white text-center mb-3">
            {error}
          </div>
        )}
        <form className="">
          <label htmlFor="firstName" className="block">
            First Name:
          </label>
          <input
            type="text"
            className="my-1 p-1 w-full "
            name="firstName"
            value={firstName}
            placeholder="E.g: Eugene"
            id="firstName"
            onChange={event => onChangeHandler(event)}
          />
          <label htmlFor="lastName" className="block">
            Last Name:
          </label>
          <input
            type="text"
            className="my-1 p-1 w-full "
            name="lastName"
            value={lastName}
            placeholder="E.g: Sodin"
            id="lastName"
            onChange={event => onChangeHandler(event)}
          />
          <label htmlFor="userEmail" className="block">
            Email:
          </label>
          <input
            type="email"
            className="my-1 p-1 w-full"
            name="userEmail"
            value={email}
            placeholder="E.g: eugene@gmail.com"
            id="userEmail"
            onChange={event => onChangeHandler(event)}
          />
          <label htmlFor="userPassword" className="block">
            Password:
          </label>
          <input
            type="password"
            className="mt-1 mb-3 p-1 w-full"
            name="userPassword"
            value={password}
            placeholder="Your Password"
            id="userPassword"
            onChange={event => onChangeHandler(event)}
          />
          <label htmlFor="photoURL" className="block">
            Photo Url:
          </label>
          <input
            type="text"
            className="my-1 p-1 w-full "
            name="photoURL"
            value={photoURL}
            id="lastName"
            onChange={event => onChangeHandler(event)}
          />
          <label htmlFor="photoURL" className="block">
            Untappd Name:
          </label>
          <input
            type="text"
            className="my-1 p-1 w-full "
            name="untappdName"
            value={untappdName}
            id="untappdName"
            onChange={event => onChangeHandler(event)}
          />
          <button onClick={event => populateDataFromUntappd(event)}>
            Populate user data from Untappd
          </button>
          <button
            className="bg-green-400 hover:bg-green-500 w-full py-2 text-white"
            onClick={event => {
              createUserWithEmailAndPasswordHandler(event);
            }}
          >
            Sign up
          </button>
        </form>
        <p className="text-center my-3">or</p>
        <button
          className="bg-red-500 hover:bg-red-600 w-full py-2 text-white"
          onClick={signInWithGoogle}
        >
          Sign In with Google
        </button>
        <p className="text-center my-3">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
export default SignUp;
