import { v4 as uuidv4 } from 'uuid'

import {BeerItem, Degustation, Rate} from "./types";
import {sendNotificationToAllClients} from "./message";
import {getUser} from "./userService";
import {checkInBeer} from "./untappdService";
import {ValidationError} from "./validationError";

const functions = require('firebase-functions');
const admin = require("firebase-admin");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const {google} = require('googleapis');

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

export const createNewDegustation = async (date: Date, title: string, avatar: string, location: string) => {

  const folder = '1xV7naawxrTF0qsMq6eReSn6sBghUhWFf'; // 2022 -> change in 2023
  const templateId = '1QIyJoW9FzR8JXlYK3wiZtPUv9pYGO1jsYg2aMIzGbaM'; //template

  const auth = new google.auth.JWT({
    email: functions.config().google_service_account.email,
    key:  functions.config().google_service_account.key.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata'
    ]
  });

  const drive = google.drive({version: 'v3', auth});

  const response = await drive.files.copy({
    name: title,
    fileId: templateId,
    parents: [folder]
  });

  const id = response.data.id;

  const doc = new GoogleSpreadsheet(id);
  await doc.useServiceAccountAuth({
    client_email: functions.config().google_service_account.email,
    private_key:  functions.config().google_service_account.key.replace(/\\n/g, '\n')
  });

  let degDate = date;
  if(typeof date.getMonth !== 'function') {
    degDate = new Date(date);
  }

  await doc.updateProperties({ title: degDate.getMonth() + 1 + '-' + degDate.getDate() + ' ' + title});

  const degustation = {
    title: title,
    date: date,
    avatar: avatar,
    location: location,
    beers:  new Array<BeerItem>(),
    users: [],
    leading: null,
    id: id
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
  const firestore = admin.firestore();

  const degustationRef = firestore.doc(`degustations/${id}`);
  const snapshot = await degustationRef.get();
  if (snapshot.exists) {
    await degustationRef.update(degustation);
  } else {
    await degustationRef.create(degustation);
  }

  return degustation;
}

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
  let notEmpty=(sheet.getCell(1, 2).value || sheet.getCell(1, 32).value);
  for (let i=1; (i<50 && notEmpty); ++i, notEmpty=(sheet.getCell(i, 2).value || sheet.getCell(i, 32).value)) {
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

export const deleteBeerRate = async (
  degustationId: string,
  beerId: string,
  userId: string
): Promise<Degustation> => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }

  const firestore = admin.firestore();
  const user = await getUser(userId);
  if(!user) {
    throw new ValidationError("User doesn't exist: " + userId);
  }
  const degustationDocRef = firestore.doc(`degustations/${degustationId}`);

  return await firestore.runTransaction(async (transaction: any) => {
    const degustationDoc = await transaction.get(degustationDocRef);
    if (!degustationDoc.exists) {
      throw new ValidationError("Degustation doesn't exist: " + degustationId);
    }
    const degustation = degustationDoc.data();

    const beer = degustation.beers.find((beerItem: BeerItem) => beerItem.id === beerId);
    if(!beer) {
      throw new ValidationError("Beer doesn't exist: " + beerId);
    }
    if (!beer.rates) {
      beer.rates = [];
    }

    beer.rates = beer.rates.filter((rateItem: Rate) => rateItem.user !== userId);

    transaction.update(degustationDocRef, degustation);

    return degustation;
  });
}

export const rateDegustationBeer = async (
  degustationId: string,
  beerId: string,
  userId: string,
  rate: number,
  shout: string
): Promise<Degustation> => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }

  const firestore = admin.firestore();

  const user = await getUser(userId);
  if(!user) {
    throw new ValidationError("User doesn't exist: " + userId);
  }

  const degustationDocRef = firestore.doc(`degustations/${degustationId}`);

  let beer: BeerItem|null;
  const updatedDegustation =  await firestore.runTransaction(async (transaction: any) => {
    const degustationDoc = await transaction.get(degustationDocRef);
    if (!degustationDoc.exists) {
      throw new ValidationError("Degustation doesn't exist: " + degustationId);
    }
    const degustation = degustationDoc.data();
    beer = degustation.beers.find((beerItem: BeerItem) => beerItem.id === beerId);
    if (!beer) {
      throw new ValidationError("Beer doesn't exist: " + beerId);
    }
    if (!beer.rates) {
      beer.rates = [];
    }
    console.log('Rating beer', beer);
    const rateIndex = beer.rates.findIndex((rateItem: Rate) => rateItem.user === userId);
    if (-1 === rateIndex) {
      beer.rates.push({user: userId, rate: rate, shout: shout});
    } else {
      beer.rates[rateIndex] = {user: userId, rate: rate, shout: shout};
    }

    transaction.update(degustationDocRef, degustation);


    return degustation;
  });

  beer = updatedDegustation.beers.find((beerItem: BeerItem) => beerItem.id === beerId);

  if (user.untappdAccessToken && beer?.beer?.bid) {
    console.log('Untapping', beer)
    checkInBeer(user.untappdAccessToken, beer.beer.bid.toString(), rate / 2, shout);
  }

  if(beer?.beer?.bid) {
    console.log('Setting to google', beer);
    await setRateToGoogle(
        updatedDegustation,
        beer.beer.bid,
        userId,
        user.untappdName ? user.untappdName : user.firstName,
        rate
    );
  }

  return updatedDegustation;
}

export const setAllRatesToGoogle = async (degustation: Degustation) => {
  const doc = new GoogleSpreadsheet(degustation.id);
  await doc.useServiceAccountAuth({
    client_email: functions.config().google_service_account.email,
    private_key:  functions.config().google_service_account.key.replace(/\\n/g, '\n')
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0]

  await sheet.loadCells('A1:AG50');
  const beerMap = new Map<number, number>();
  for (let i=1, notEmpty=true; (i<50 && notEmpty); ++i, notEmpty=(sheet.getCell(i, 2).value || sheet.getCell(i, 32).value)) {
    beerMap.set(Number(sheet.getCell(i, 32).value), i);
  }

  const userMap = new Map<string, any>();
  const exportRate = async (beer: BeerItem, rate: Rate) => {
    let user: any;
    user = userMap.get(rate.user);
    if(!user) {
      user = await getUser(rate.user);
      userMap.set(rate.user, user);
    }
    if(!degustation.users.includes(rate.user)) {
      degustation.users.push(rate.user);
      await updateDegustation(degustation.id, degustation);
    }
    const y = beerMap.get(beer.beer.bid);

    if(y) {
      const index = degustation.users.findIndex(cuser => cuser === rate.user);
      if(index !== -1) {
        const x = 10 + index;
        functions.logger.log(x, y, Number(rate.rate));
        sheet.getCell(y, x).value = Number(rate.rate);
        sheet.getCell(0, x).value = user.untappdName ? user.untappdName : user.firstName;
      }
    }
  }
  const exportBeerRates = async (beer: BeerItem) => {
    await Promise.all(beer.rates.map((rate) => exportRate(beer, rate)));
  }

  await Promise.all(degustation.beers.map(degustationBeer => exportBeerRates(degustationBeer)));
  functions.logger.log('Saving');
  await sheet.saveUpdatedCells();
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
    if(!degustation.users.includes(userId)) {
      degustation.users.push(userId);
      await updateDegustation(degustation.id, degustation);
    }
    const index = degustation.users.findIndex(user => user === userId);
    if(index !== -1) {
      const x = 10 + index;
      sheet.getCell(y, x).value = Number(rate);
      sheet.getCell(0, x).value = userName;
      await sheet.saveUpdatedCells();
    }
  }
}

const double = (num: any) => {
  const res = parseFloat(num);

  return isNaN(res) ? null : res;
}
