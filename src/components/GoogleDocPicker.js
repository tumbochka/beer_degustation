import React, {useState} from "react";

import GooglePicker from 'react-google-picker';

import config from "../config";
import {getSheetData} from "../services/GoogleSheetApi";

//qeh7X9boOseEuegdzVbY1eP7
const GoogleDocsPicker = () => {
  const [authToken, setAuthToken] = useState(null);

  const fetchGoogleSheet = async (data) => {
    if ('picked' === data.action) {
      const doc = data.docs[0];
      console.log(doc);
      console.log(await getSheetData(doc['id']));
    }
  }

  const parseGoogleDoc = data => {
    console.log(JSON.stringify(data, null, 2));
  }

  const parseError = error => console.log(error);

  return (
  <GooglePicker clientId={config.googleClientId}
              developerKey={config.googleDeveloperKey}
              scope={['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']}
              onChange={data => fetchGoogleSheet(data)}
              onAuthenticate={token => setAuthToken(token)}
              onAuthFailed={data => console.log('on auth failed:', data)}
              multiselect={false}
              navHidden={true}
              authImmediate={false}
              mimeTypes={['application/vnd.google-apps.spreadsheet']}
              query={'Дегустація'}
              viewId={'FOLDERS'}>
 </GooglePicker>
  )
};

export default GoogleDocsPicker;
