import React, {useState} from "react";

import GooglePicker from 'react-google-picker';

import config from "../config";
import firebase from "firebase";
import Degustation from "./Degustation";
import {navigate} from "@reach/router";
import {Button} from "react-bootstrap";

//qeh7X9boOseEuegdzVbY1eP7
const DegustationSelector = () => {
  const [degustation, setDegustation] = useState(null);
  const [mask, setMask] = useState(null);

  const fetchGoogleSheet = async (data) => {
    if ('picked' === data.action) {
      const doc = data.docs[0];
      const getDegustationDataFromGoogleSheet = firebase.functions().httpsCallable('getDegustationDataFromGoogleSheet');
      setMask('Importing...');
      getDegustationDataFromGoogleSheet({
        id: doc['id']
      })
        .then(result => {
           setDegustation({id: doc['id'], ...result.data});
           setMask(null);
          })
      ;
    }
  }

  return (
    <div>
      {mask ? <div>{mask}</div> : ''}
      <Button onClick={() => {navigate('/Degustations')}}>Degustations List</Button>
      {
        degustation ?
          <div>
            <Button onClick={() => {navigate('/DegustationSelector')}}>Import another</Button>
            <Degustation degustation={degustation}/>
          </div>
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
      }
    </div>
  )
};

export default DegustationSelector;