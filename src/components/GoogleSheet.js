import React, {useState} from "react";

import ReactGoogleSheets from 'react-google-sheets';
import config from "../config";
import GoogleDocsPicker from "./GoogleDocPicker";

const GoogleSheet = (data) => {
  const [isLoaded, setLoaded] = useState(false);
    return(
      data.id ?
      <ReactGoogleSheets
        clientId={config.googleClientId}
        apiKey={config.googleDeveloperKey}
        spreadsheetId={data.id}
        afterLoading={() => setLoaded(true)}
      >
        {isLoaded ?
          console.log('Your sheet data : ', this.props.getSheetsData('')) :
          <div>Loading...</div>
        }
      </ReactGoogleSheets> :
        <GoogleDocsPicker />
    );
}

export default GoogleSheet;
