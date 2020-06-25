import {searchBeer} from "./untappdService";
import {BeerItem} from "./types";

const functions = require('firebase-functions');
const admin = require("firebase-admin");
const { GoogleSpreadsheet } = require('google-spreadsheet');

export const fillUpDoc = async (docId: string) => {
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
    date: title.substring(0,5),
    beers:  new Array<BeerItem>()
  };

  const sheet = doc.sheetsByIndex[0]

  await sheet.loadCells('A1:H40');
  let name, brewery, notEmpty=true;
  for (let i=1; notEmpty; ++i) {
    name = sheet.getCell(i, 1);
    brewery = sheet.getCell(i, 2);
    if (name.value && brewery.value) {
      searchBeer(name.value, brewery.value, async  (beerItem) => {
        if (beerItem) {
          sheet.getCell(i, 0).value = beerItem.brewery.country_name;
          sheet.getCell(i, 3).value = beerItem.beer.beer_style;
          // sheet.getCell(i, 4).value = beerItem.beer.auth_rating;
          sheet.getCell(i, 5).value = beerItem.beer.beer_abv;
          sheet.getCell(i,7).value = beerItem.beer.beer_ibu;

          degustation.beers.push(beerItem);
          await sheet.saveUpdatedCells();
          const degustationRef = firestore.doc(`users/${docId}`);
          const snapshot = await degustationRef.get();
          if (snapshot.exists) {
            await degustationRef.update(degustation);
          } else {
            await degustationRef.create(degustation);
          }
        }
      });

    } else {
      notEmpty = false;
    }
  }
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
      volume: sheet.getCell(i, 8).value,
      beer: {
        beer_name: sheet.getCell(i, 2).value,
        beer_abv: sheet.getCell(i, 5).value,
        beer_ibu: sheet.getCell(i, 7).value,
        beer_style: sheet.getCell(i, 3).value,
        rating: sheet.getCell(i, 4).value,
        plato: sheet.getCell(i, 6).value,
      },
      "brewery": {
        "brewery_name": sheet.getCell(i, 1).value,
        "country_name": sheet.getCell(i, 0).value,
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
