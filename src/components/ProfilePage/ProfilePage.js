/** @jsx jsx */
import React from "react";
import {auth} from "../../firebase";
import { css, jsx } from '@emotion/core';

const ProfilePage = (data) => {
    const {photoURL, displayName, email} = data.user;
  const logoPath = photoURL ?
    photoURL :
    'https://res.cloudinary.com/dqcsk8rsc/image/upload/v1577268053/avatar-1-bitmoji_upgwhc.png';
  return (
    <div className = "mx-auto w-11/12 md:w-2/4 py-8 px-4 md:px-8">
      <div className="flex border flex-col items-center md:flex-row md:items-start border-blue-400 px-3 py-4">
        <div
          css={css`
          background: url(${logoPath})  no-repeat center center;
          backgroundSize: cover;
          height: 200px;
          width: 200px;
        `}
        ></div>

        <div className = "md:pl-4">
          <h2 className = "text-2xl font-semibold">{displayName}</h2>
          <h3 className = "italic">{email}</h3>
        </div>
      </div>
      <button className = "w-full py-3 bg-red-600 mt-4 text-white" onClick = {() => {auth.signOut()}}>Sign out</button>
    </div>
  )
};
export default ProfilePage;
