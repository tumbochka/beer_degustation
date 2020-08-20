import {Request} from "firebase-functions";

export const upload = async (req: Request) => {
  // Require gcloud
  const { Storage } = require('@google-cloud/storage');
  //  Enable Storage
  const storage = new Storage({ projectId: 'beer-degustation', keyFilename: './service-account.json' });
  // Reference an existing bucket.
  //
  const bucket = await storage.bucket('gs://beer-degustation.appspot.com');
  const stream = require('stream');

  const image = req.body.image;
  const mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
  const fileName = req.body.file;
  const base64EncodedImageString = image.replace(/^data:image\/\w+;base64,/, '')
  const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
  const bufferStream = new stream.PassThrough();
  bufferStream.end(imageBuffer);

  // Define file and fileName
  const file = bucket.file('images/' + fileName);
  bufferStream.pipe(file.createWriteStream({
    metadata: {
      contentType: mimeType
    },
    public: true,
    validation: "md5"
  }))
    .on('error', function (err: any) {
      console.log('error from image upload', err);
    })
    .on('finish', function () {
      // The file upload is complete.
      file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      }).then((signedUrls: any) => {
        // signedUrls[0] contains the file's public URL
        return signedUrls[0]
      });
    });
}
