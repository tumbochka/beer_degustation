import {GoogleSpreadsheet} from 'google-spreadsheet';
import config from "../config";

export const getSheetData = async (sheetId) => {
  const doc = new GoogleSpreadsheet(sheetId);
  await doc.useServiceAccountAuth({
    client_email: config.googleServiceAccountEmail,
    private_key: config.googleServiceAccountKey
  });
  await doc.loadInfo();
  console.log(doc);
}
