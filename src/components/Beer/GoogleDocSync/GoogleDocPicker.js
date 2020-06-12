import React from "react";

import GooglePicker from 'react-google-picker';
import config from "../../../config";

//qeh7X9boOseEuegdzVbY1eP7
const GoogleDocsPicker = () => {
    const fetchGoogleScheet = (data) => {
    // const files = data[google.picker.Response.DOCUMENTS];
    if ('picked' === data.action) {
      const doc = data.docs[0];
      const id=doc['id'];
      console.log(doc);
    }
  }
  return (
  <GooglePicker clientId={config.googleClientId}
              developerKey={config.googleDeveloperKey}
              scope={['https://www.googleapis.com/auth/drive']}
              onChange={data => fetchGoogleScheet(data)}
              // onAuthenticate={token => setToken(token)}
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
