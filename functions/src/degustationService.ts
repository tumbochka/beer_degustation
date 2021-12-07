import { v4 as uuidv4 } from 'uuid'

import {BeerItem, Degustation, Rate} from "./types";
import {sendNotificationToAllClients} from "./message";
import {getUser} from "./userService";
import {checkInBeer} from "./untappdService";

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

  const folder = '1GJh7OAqzh8i0yCqRcj-dMvuK9tA9KYLD'; // 2021 -> change in 2022
  const templateId = '1QIyJoW9FzR8JXlYK3wiZtPUv9pYGO1jsYg2aMIzGbaM'; //template

  const auth = new google.auth.JWT({
    email: 'degustator@beer-degustation.iam.gserviceaccount.com',
    key:  '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJgGPfUbFq4jQk\\nyGJOHTAenP1RxfehhqWhu1Cb4ry3q58Gl8bQU841RP1Z6ox0EUTqRuliwHiGOe3c\\nHmQAXFdcncuMASZYc1J5H3s8GCqiwpmyysltUHkrgcWLW8X3h2KP9SVJCprRY9K/\\nuaj6osW9lIbM/bNh1wDjubAMcM325UQJ1v/zQgs35EtIlLYoM+fJJcrJj/J21nWx\\n+G9F1iqkfAulhWPLDSmatVaYMFwRA0bjA92+iTpVze60oth+X2SZG7my2BiMvVaZ\\nVuPv8lJFS1bACkaMxcqb1n84ALhAU4+kDkLBM/5ZifiHwoouXb/nuq8gMwMPrSTH\\nnxzyF9MzAgMBAAECggEAALcSKzJ990nZSYa4TAG7c/yYhzQ8xr9Flgk8vJaKPK79\\nPhTddjzBMrZ+cCiMllqDN/uD+TuDDFfYDY6kK/q+gVWGB8LvZpwE/WHDGlH3ZqcQ\\nCJRoXiC23lDG//7KU4rrG7Bj3G002vuAxUQ+l0fyfOLQSvQRqdl2yRvg5DAPAah6\\n6Lb4WeoCmFRbFGeC/5pf1FL/hRjoswtWpowmILxLUzKWbqNr+6sGZFm7zwPHaabq\\nkUdS/oZbemHFno//aqgcZO2YaGdWMAoOVjhg6BemK8HlTOeplk0MpgNq9zr9t6wB\\nd5zuG1JlEV/AsWc4RE0dk/ugPH+0gxXUPVoI+cKNUQKBgQDuqkW8seRdbLyt5KHp\\nk3/jE+LZyIgFBIPUs57qWoB/4xDGfT/AcOVNsmO1cnFWW23LCNV0gbzxwMOiBrnw\\nEiPhtybRVKwEX54LKUC6nOipHHsmQ9Q4gNLdnoFz4zLFePbmy+SwqxqimzR7eEFS\\nZPoj4mwF5XSxAZcXElwGTEpL/wKBgQDYIxl6OK5O5IYlCQsnKWZNXAoCHv0lDICs\\npMUHYJNd4V6ZZnVA6ACOxZtkf++g0O64G/OU6Xkl+MugFzepB58Y2lQJQlqxBunr\\ncPuKkgFXt2/ZwK/hacaAeS4n4d2b8FOBxRQf/PGxuEBO2wc2wo793vK9z3YeS7xp\\nxSVVi8cIzQKBgQCGidXmGSHyyGlUXZ4oXc2p5Hvs6O5EZdcrAFaFJZ9qeEXsno5h\\nnUKmGfm7P1hEpiWuXrx1gO1SGqgtnj0S6CbyBp0LQ//0NzKQeCDVEb7WFggV+gaY\\nE4bLB59SBLGKQDZuxGGWdd397CAZuiCYofOgZvMeH8s4PP0/NEpMApWfYQKBgBL8\\neld3NTCu+G22bqlhBKCVDjgDet9PStpfmwM745YinwnAq1opRytDhpP8fRNWZzH7\\nGpmhLMg+I70LbRNHHR20yB8MGiVk4xWQljgk/UM0VPn+6DRX810DyB8uwyXYpa1H\\nn63zrVOcSOHkcazIyIDand44pDqjEokEDXSHU9OdAoGAV5yw1dMA1Saxt5FHwwOT\\n7dTgsUYOhsOMe6uYF4lh80tbRtgKPo3cL6mLV7pNTkT7StyNNYDbzjClxj1WX3kn\\nys77VepkjNu7f0yCAsbReiE9+B8/6jZcKfMjNhkbVPOwDchuhPjeUmnC2iNKPov7\\n1difzVCNOKCnli9UQZyPlDI=\\n-----END PRIVATE KEY-----\\n'.replace(/\\n/g, '\n'),
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
    client_email: 'degustator@beer-degustation.iam.gserviceaccount.com',
    private_key:  '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJgGPfUbFq4jQk\\nyGJOHTAenP1RxfehhqWhu1Cb4ry3q58Gl8bQU841RP1Z6ox0EUTqRuliwHiGOe3c\\nHmQAXFdcncuMASZYc1J5H3s8GCqiwpmyysltUHkrgcWLW8X3h2KP9SVJCprRY9K/\\nuaj6osW9lIbM/bNh1wDjubAMcM325UQJ1v/zQgs35EtIlLYoM+fJJcrJj/J21nWx\\n+G9F1iqkfAulhWPLDSmatVaYMFwRA0bjA92+iTpVze60oth+X2SZG7my2BiMvVaZ\\nVuPv8lJFS1bACkaMxcqb1n84ALhAU4+kDkLBM/5ZifiHwoouXb/nuq8gMwMPrSTH\\nnxzyF9MzAgMBAAECggEAALcSKzJ990nZSYa4TAG7c/yYhzQ8xr9Flgk8vJaKPK79\\nPhTddjzBMrZ+cCiMllqDN/uD+TuDDFfYDY6kK/q+gVWGB8LvZpwE/WHDGlH3ZqcQ\\nCJRoXiC23lDG//7KU4rrG7Bj3G002vuAxUQ+l0fyfOLQSvQRqdl2yRvg5DAPAah6\\n6Lb4WeoCmFRbFGeC/5pf1FL/hRjoswtWpowmILxLUzKWbqNr+6sGZFm7zwPHaabq\\nkUdS/oZbemHFno//aqgcZO2YaGdWMAoOVjhg6BemK8HlTOeplk0MpgNq9zr9t6wB\\nd5zuG1JlEV/AsWc4RE0dk/ugPH+0gxXUPVoI+cKNUQKBgQDuqkW8seRdbLyt5KHp\\nk3/jE+LZyIgFBIPUs57qWoB/4xDGfT/AcOVNsmO1cnFWW23LCNV0gbzxwMOiBrnw\\nEiPhtybRVKwEX54LKUC6nOipHHsmQ9Q4gNLdnoFz4zLFePbmy+SwqxqimzR7eEFS\\nZPoj4mwF5XSxAZcXElwGTEpL/wKBgQDYIxl6OK5O5IYlCQsnKWZNXAoCHv0lDICs\\npMUHYJNd4V6ZZnVA6ACOxZtkf++g0O64G/OU6Xkl+MugFzepB58Y2lQJQlqxBunr\\ncPuKkgFXt2/ZwK/hacaAeS4n4d2b8FOBxRQf/PGxuEBO2wc2wo793vK9z3YeS7xp\\nxSVVi8cIzQKBgQCGidXmGSHyyGlUXZ4oXc2p5Hvs6O5EZdcrAFaFJZ9qeEXsno5h\\nnUKmGfm7P1hEpiWuXrx1gO1SGqgtnj0S6CbyBp0LQ//0NzKQeCDVEb7WFggV+gaY\\nE4bLB59SBLGKQDZuxGGWdd397CAZuiCYofOgZvMeH8s4PP0/NEpMApWfYQKBgBL8\\neld3NTCu+G22bqlhBKCVDjgDet9PStpfmwM745YinwnAq1opRytDhpP8fRNWZzH7\\nGpmhLMg+I70LbRNHHR20yB8MGiVk4xWQljgk/UM0VPn+6DRX810DyB8uwyXYpa1H\\nn63zrVOcSOHkcazIyIDand44pDqjEokEDXSHU9OdAoGAV5yw1dMA1Saxt5FHwwOT\\n7dTgsUYOhsOMe6uYF4lh80tbRtgKPo3cL6mLV7pNTkT7StyNNYDbzjClxj1WX3kn\\nys77VepkjNu7f0yCAsbReiE9+B8/6jZcKfMjNhkbVPOwDchuhPjeUmnC2iNKPov7\\n1difzVCNOKCnli9UQZyPlDI=\\n-----END PRIVATE KEY-----\\n'.replace(/\\n/g, '\n')
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

  beer.rates = beer.rates.filter((rateItem: Rate) => rateItem.user !== userId);

  return await updateDegustation(degustationId, degustation);
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
