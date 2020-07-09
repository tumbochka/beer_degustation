import { v4 as uuidv4 } from 'uuid'

import {BeerItem, Degustation} from "./types";

const functions = require('firebase-functions');
const admin = require("firebase-admin");
const { GoogleSpreadsheet } = require('google-spreadsheet');

export const exportDegustationToGoogle = async (docId: string, degustation: Degustation) => {
  const doc = new GoogleSpreadsheet(docId);

  await doc.useServiceAccountAuth({
    client_email: functions.config().google_service_account.email,
    private_key:  functions.config().google_service_account.key.replace(/\\n/g, '\n')
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0]

  await sheet.loadCells('A1:H40');

  degustation.beers.forEach((beer, index) => {
    console.log(beer);
    const i = index + 1;
    sheet.getCell(i, 0).value = beer.brewery.country_name;
    sheet.getCell(i, 3).value = beer.beer.beer_style;
    sheet.getCell(i, 4).value = beer.beer.rating_score;
    sheet.getCell(i, 5).value = beer.beer.beer_abv;
    sheet.getCell(i,7).value = beer.beer.beer_ibu;
  });

  await sheet.saveUpdatedCells();
};

export const fetchDegustationDataFromGoogleSheet = async (docId: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }
  const firestore = admin.firestore();
  const doc = new GoogleSpreadsheet(docId);

  await doc.useServiceAccountAuth({
    client_email: functions.config().google_service_account.email,
    private_key:  functions.config().google_service_account.key.replace(/\\n/g, '\n')
  });

  await doc.loadInfo();
  const title = doc.title;

  const degustation = {
    title: title.substring(5),
    date: new Date( new Date().getFullYear() + '-' + title.substring(0,5)),
    beers:  new Array<BeerItem>()
  };

  const sheet = doc.sheetsByIndex[0]

  await sheet.loadCells('A1:I50');
  for (let i=1, notEmpty=true; (i<50 && notEmpty); ++i, notEmpty=sheet.getCell(i, 2).value) {
    const beerItem = {
      volume: double(sheet.getCell(i, 8).value),
      id: uuidv4(),
      beer: {
        beer_name: sheet.getCell(i, 2).value,
        beer_abv: double(sheet.getCell(i, 5).value),
        beer_ibu: double(sheet.getCell(i, 7).value),
        beer_style: sheet.getCell(i, 3).value,
        rating: double(sheet.getCell(i, 4).value),
        plato: double(sheet.getCell(i, 6).value),
      },
      brewery: {
        brewery_name: sheet.getCell(i, 1).value,
        country_name: sheet.getCell(i, 0).value,
      }
    };
    degustation.beers.push(<BeerItem>beerItem);
  }
  const degustationRef = firestore.doc(`degustations/${docId}`);
  const snapshot = await degustationRef.get();
  if (snapshot.exists) {
    await degustationRef.update(degustation);
  } else {
    await degustationRef.create(degustation);
  }

  return degustation;
}

export const getDegustation = async (degustationId: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }

  const firestore = admin.firestore();

  const degustationDoc = await firestore.doc(`degustations/${degustationId}`).get();

  return degustationDoc.data();
}

export const updateDegustation = async (degustationId: string, degustation: Degustation) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }

  const firestore = admin.firestore();
  const degustationRef = firestore.doc(`degustations/${degustationId}`);
  await degustationRef.update(degustation);

  return degustation;
}

const double = (num: any) => {
  const res = parseFloat(num);

  return isNaN(res) ? null : res;
}
