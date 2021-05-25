import { v4 as uuidv4 } from 'uuid'

import {BeerItem, Degustation, Rate} from "./types";
import {sendNotificationToAllClients} from "./message";
import {getUser} from "./userService";
import {checkInBeer} from "./untappdService";

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

  await sheet.loadCells('A1:AG50');

  degustation.beers.forEach((beer, index) => {
    const i = index + 1;
    sheet.getCell(i, 0).value = beer.brewery.country_name;
    sheet.getCell(i, 1).value = beer.brewery.brewery_name;
    sheet.getCell(i, 2).value = beer.beer.beer_name;
    sheet.getCell(i, 3).value = beer.beer.beer_style;
    sheet.getCell(i, 4).value = beer.beer.rating_score;
    sheet.getCell(i, 5).value = beer.beer.beer_abv;
    sheet.getCell(i, 6).value = beer.beer.plato;
    sheet.getCell(i,7).value = beer.beer.beer_ibu;
    sheet.getCell(i,8).value = beer.volume ? beer.volume.toString().replace('.', ',') : '';
    sheet.getCell(i, 32).value = beer.beer.bid;
  });

  await sheet.saveUpdatedCells();
};

export const fetchDegustationDataFromGoogleSheet = async (docId: string) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
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
    beers:  new Array<BeerItem>(),
    users: [],
    leading: null
  };

  const sheet = doc.sheetsByIndex[0]

  await sheet.loadCells('A1:AG50');
  for (let i=1, notEmpty=true; (i<50 && notEmpty); ++i, notEmpty=(sheet.getCell(i, 2).value || sheet.getCell(i, 32).value)) {
    const beerItem = {
      volume: double(sheet.getCell(i, 8).value),
      id: uuidv4(),
      beer: {
        bid: sheet.getCell(i, 32).value,
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

export const getDegustation = async (degustationId: string): Promise<Degustation> => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }

  const firestore = admin.firestore();

  const degustationDoc = await firestore.doc(`degustations/${degustationId}`).get();

  return degustationDoc.data();
}

export const updateDegustation = async (degustationId: string, degustation: Degustation) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }

  degustation.beers = degustation.beers.map(beer => {
    if(!beer.id) {
      beer.id = uuidv4();
    }
    return beer;
  });

  const firestore = admin.firestore();
  const degustationRef = firestore.doc(`degustations/${degustationId}`);
  await degustationRef.update(degustation);

  const message = {data: degustation, title: 'Degustation', body: 'Degustation update'};
  await sendNotificationToAllClients(message);

  return degustation;
}

export const rateDegustationBeer = async (
  degustationId: string,
  beerId: string,
  userId: string,
  rate: number,
  shout: string
): Promise<Degustation> => {
  const degustation = await getDegustation(degustationId);
  if(!degustation) {
    throw new ValidationError("Degustation doesn't exist: " + degustationId);
  }
  const user = await getUser(userId);
  if(!user) {
    throw new ValidationError("User doesn't exist: " + userId);
  }

  const beer = degustation.beers.find((beerItem: BeerItem) => beerItem.id === beerId);
  if(!beer) {
    throw new ValidationError("Beer doesn't exist: " + beerId);
  }
  if (!beer.rates) {
    beer.rates = [];
  }
  const rateIndex = beer.rates.findIndex((rateItem: Rate) => rateItem.user === userId);
  if (-1 === rateIndex) {
    beer.rates.push({user: userId, rate: rate, shout: shout});
    if (user.untappdAccessToken && beer.beer.bid) {
      checkInBeer(user.untappdAccessToken, beer.beer.bid.toString(), rate/2, shout)
    }
  } else {
    beer.rates[rateIndex] = {user: userId, rate: rate, shout: shout};
  }

  await setRateToGoogle(
    degustation,
    beer.beer.bid,
    userId,
    user.untappdName ? user.untappdName : user.firstName,
    rate
  );

  return await updateDegustation(degustationId, degustation);
}

const setRateToGoogle = async (degustation: Degustation, beerId: number, userId: string, userName: string, rate: number) => {
  const doc = new GoogleSpreadsheet(degustation.id);
  await doc.useServiceAccountAuth({
    client_email: functions.config().google_service_account.email,
    private_key:  functions.config().google_service_account.key.replace(/\\n/g, '\n')
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0]

  await sheet.loadCells('A1:AG50');

  let y = null;
  for (let i=1, notEmpty=true; (i<50 && notEmpty); ++i, notEmpty=(sheet.getCell(i, 2).value || sheet.getCell(i, 32).value)) {
    if(sheet.getCell(i, 32).value === beerId) {
      y = i;
      break;
    }
  }
  if(y) {
    const index = degustation.users.findIndex(user => user === userId);
    if(index !== -1) {
      const x = 10 + index;
      sheet.getCell(y, x).value = rate.toString().replace('.',',');
      sheet.getCell(0, x).value = userName;
      await sheet.saveUpdatedCells();
    }
  }
}

const double = (num: any) => {
  const res = parseFloat(num);

  return isNaN(res) ? null : res;
}
