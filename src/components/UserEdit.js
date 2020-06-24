import React, {useState} from "react";
import { navigate } from "@reach/router"
import {updateUser} from "../persistence/Persistence";

const UserEdit = (data) => {
  const user = data.user;

  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoURL, setPhotoURL] = useState(user.photoURL);
  const [untappdName, setUntappdName] = useState(user.untappdName);
  const [error, setError] = useState(null);

  const updateUserHandler = async (event) => {
    event.preventDefault();
    try{
      updateUser(user, {firstName, lastName, photoURL, untappdName});
      await navigate('/');
    }
    catch(error){
      setError('Error updating: ' + error.message);
    }
  };

  const onChangeHandler = event => {
    const { name, value } = event.currentTarget;
    if (name === "userEmail") {
      setEmail(value);
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
          <button
            className="bg-green-400 hover:bg-green-500 w-full py-2 text-white"
            onClick={event => {
              updateUserHandler(event);
            }}
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserEdit;
