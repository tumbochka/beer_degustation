import React, {useState} from "react";

import GooglePicker from 'react-google-picker';

import config from "../config";
import firebase from "firebase";
import Degustation from "./Degustation";

//qeh7X9boOseEuegdzVbY1eP7
const GoogleDocsPicker = () => {
  const [degustation, setDegustation] = useState(null);

  const fetchGoogleSheet = async (data) => {
    if ('picked' === data.action) {
      const doc = data.docs[0];
      const getDegustationDataFromGoogleSheet = firebase.functions().httpsCallable('getDegustationDataFromGoogleSheet');
      getDegustationDataFromGoogleSheet({
        id: doc['id']
      })
        .then(result => {
           setDegustation(result.data);
          })
      ;
    }
  }

  return (
    degustation ?
      <Degustation degustation={degustation} />
      :
  <GooglePicker clientId={config.googleClientId}
              developerKey={config.googleDeveloperKey}
              scope={['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']}
              onChange={data => fetchGoogleSheet(data)}
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
