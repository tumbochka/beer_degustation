import {getDegustation, updateDegustation} from "./degustationService";
import {BeerItem, Degustation} from "./types";

export const upload = (req: any, resp: any) => {
  const Busboy = require('busboy');
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('../key/beer-degustation-firebase-adminsdk-7kx3n-29d82c679a.json'))
    });
  }

  const busboy = new Busboy({headers: req.headers});
  const tmpdir = os.tmpdir();

  const fields = new Map();

  const files: any[] = [];

  busboy.on('field', (fieldname: string, val: any) => {
    // TODO(developer): Process submitted field values here
    fields.set(fieldname, val);
  });

  const fileWrites: any[] = [];

  busboy.on('file', (fieldname: string, file: any, filename: string, encoding: string, mimetype: string) => {
    const filepath = path.join(tmpdir, filename);
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    fileWrites.push(new Promise((resolve, reject) => {
      file.on('end', () => writeStream.end());
      writeStream.on('finish', () => {
        fs.readFile(filepath, (err: any, buffer: Buffer) => {
          const size = Buffer.byteLength(buffer);
          if (err) {
            reject(err);
          }

          files.push({
            fieldname,
            originalname: filename,
            encoding,
            mimetype,
            buffer,
            size,
          });

          try {
            fs.unlinkSync(filepath);
          } catch (error) {
            reject(error);
          }

          resolve();
        });
      });
      writeStream.on('error', reject);
    }));
  });

  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on('finish', async () => {
    await Promise.all(fileWrites);
    files.forEach(file => {
      const bucket = admin.storage().bucket('gs://beer-degustation.appspot.com');
      const fileToStore = bucket.file('images/beer.jpg');
      const options = { resumable: true, metadata: { contentType: file.mimetype } }
      fileToStore.save(file.buffer, options)
        .then(() => {
          return fileToStore.getSignedUrl({
            action: 'read',
            expires: '03-09-2500'
          })
        })
        .then((urls: any) => {
          const degustationId = fields.get('degustation');
          const beerId = fields.get('beer');
          const userId = fields.get('user');
          if (!degustationId || !beerId || !userId) {
            resp.status(400).send("Degustation, beer and user must be present in request");
          }
          getDegustation(degustationId)
            .then((degustation: Degustation) => {
              if(!degustation) {
                resp.status(400).send("Degistation doesn't exist: " + degustationId);
              }
              const beer = degustation.beers.find((beerItem: BeerItem) => beerItem.id === beerId);
              if (userId !== degustation.leading) {
                resp.status(400).send("The provided user is not leading");
              }
              if(!beer) {
                resp.status(400).send("Beer doesn't exist: " + beerId);
              } else {
                beer.picture = urls[0];
                updateDegustation(degustationId, degustation)
                  .then(updatedDegustation => {
                    resp.send({data: updatedDegustation});
                  })
                  .catch(e => {
                    resp.status(500).send(e.message);
                  });
              }
            })
            .catch(e => resp.status(500).send(e.message));

        })
    });
  });

  busboy.end(req.rawBody);
}

