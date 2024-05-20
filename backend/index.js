require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

const app = express();
app.use(bodyParser.json())
const port = process.env.PORT || 3005;

const cdnEndpoint = process.env.R2_ENDPOINT;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;

const client = new S3Client({
    region: 'auto',
    endpoint: cdnEndpoint,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey,
    },
  });


  
  app.post('/save-folder-data', async (req, res) => {
    const baseFolderKey = 'Replit-Clone/base'; // Base key without language
    const language = req.body.language; // Get the language from the request body
  
    if (!language) {
      return res.status(400).send('Language parameter is required');
    }
  
    const folderPrefix = `${baseFolderKey}-${language}/`; // Construct the prefix with the language
    const outputDir = path.join(__dirname, 'downloaded-files', `base-${language}`); // Directory to store downloaded files
  
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    try {
      // List all objects within the folder
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folderPrefix,
      });
  
      const listResponse = await client.send(listCommand);
  
      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        return res.status(404).send('No objects found in the specified folder.');
      }
  
      // Fetch each object and save the data locally
      await Promise.all(
        listResponse.Contents.map(async (object) => {
          const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: object.Key,
          });
  
          const response = await client.send(getCommand);
  
          if (response.Body) {
            const relativePath = object.Key.replace(folderPrefix, ''); // Remove prefix from the key to get relative path
            const outputPath = path.join(outputDir, relativePath); // Full path to save the file locally
  
            // Ensure the directory for the file exists
            const outputDirPath = path.dirname(outputPath);
            if (!fs.existsSync(outputDirPath)) {
              fs.mkdirSync(outputDirPath, { recursive: true });
            }
  
            // Stream the response data to a file
            const passThrough = new stream.PassThrough();
            stream.pipeline(response.Body, passThrough, (err) => {
              if (err) {
                console.error('Pipeline error:', err);
                throw err;
              }
            });
  
            const writeStream = fs.createWriteStream(outputPath);
            passThrough.pipe(writeStream);
  
            await new Promise((resolve, reject) => {
              writeStream.on('finish', resolve);
              writeStream.on('error', reject);
            });
  
            console.log(`File downloaded successfully to ${outputPath}`);
          }
        })
      );
  
      res.send('Folder data saved successfully.');
    } catch (err) {
      console.error('Error fetching objects:', err.message);
      res.status(500).send('Error fetching objects');
    }
  });

app.listen(port ,() => {
    console.log(`Backend listening on port ${port}`)
})