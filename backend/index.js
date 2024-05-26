require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const stream = require("stream");

const app = express();
const port = process.env.PORT || 3001;

// Initialize S3 client with Cloudflare R2 configuration
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

app.use(bodyParser.json());

const cacheDir = path.join(__dirname, "cache");

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const cacheFolderStructure = (folderKey, folderStructure) => {
  const cacheFilePath = path.join(
    cacheDir,
    `${folderKey.replace(/\//g, "_")}_structure.json`
  );
  fs.writeFileSync(
    cacheFilePath,
    JSON.stringify(folderStructure, null, 2),
    "utf-8"
  );
};

const getCachedFolderStructure = (folderKey) => {
  const cacheFilePath = path.join(
    cacheDir,
    `${folderKey.replace(/\//g, "_")}_structure.json`
  );
  if (fs.existsSync(cacheFilePath)) {
    return JSON.parse(fs.readFileSync(cacheFilePath, "utf-8"));
  }
  return null;
};

const cacheFileData = (fileKey, fileData) => {
  const cacheFilePath = path.join(cacheDir, fileKey);
  const dir = path.dirname(cacheFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(cacheFilePath, fileData, "utf-8");
};

const fetchAndCacheFile = async (bucketName, fileKey) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  const response = await client.send(command);
  const chunks = [];
  const passThrough = new stream.PassThrough();

  stream.pipeline(response.Body, passThrough, (err) => {
    if (err) {
      console.error("Pipeline error:", err);
      throw err;
    }
  });

  passThrough.on("data", (chunk) => chunks.push(chunk));
  await new Promise((resolve, reject) => {
    passThrough.on("end", resolve);
    passThrough.on("error", reject);
  });

  const fileData = Buffer.concat(chunks).toString();
  cacheFileData(fileKey, fileData);
};

const buildFolderStructure = (items, prefix) => {
  const structure = {
    label: path.basename(prefix),
    id: prefix,
    fileType: "folder",
    children: [],
  };

  const children = items.filter(
    (item) => item.Key.startsWith(prefix) && item.Key !== prefix
  );

  const folders = {};
  children.forEach((child) => {
    const relativePath = child.Key.replace(prefix, "");
    const segments = relativePath.split("/").filter(Boolean);
    if (segments.length > 1) {
      const folderName = segments[0] + "/";
      if (!folders[folderName]) {
        folders[folderName] = [];
      }
      folders[folderName].push(child);
    } else {
      structure.children.push({
        label: segments[0],
        id: child.Key,
        fileType: segments[0].split(".").pop(),
        children: [],
      });
    }
  });

  Object.keys(folders).forEach((folderName) => {
    structure.children.push(
      buildFolderStructure(folders[folderName], prefix + folderName)
    );
  });

  return structure;
};

const fetchAndCacheAllFiles = async (bucketName, folderKey) => {
  const listCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: folderKey,
  });

  const listResponse = await client.send(listCommand);

  // Fetch all files in the folder
  const filePromises = listResponse.Contents.map(async (item) => {
    const fileKey = item.Key;
    await fetchAndCacheFile(bucketName, fileKey);
  });

  await Promise.all(filePromises);

  // Build the folder structure
  return buildFolderStructure(listResponse.Contents, folderKey);
};

app.post("/list-folder", async (req, res) => {
  const { folderKey } = req.body;
  console.log("This is folder key", folderKey);
  if (!folderKey) {
    return res.status(400).send("folderKey parameter is required");
  }

  // Check if the folder structure is cached
  const cachedStructure = getCachedFolderStructure(folderKey);
  if (cachedStructure) {
    return res.json(cachedStructure);
  }

  // Fetch from R2 and cache it
  try {
    const folderStructure = await fetchAndCacheAllFiles(
      process.env.BUCKET_NAME,
      folderKey
    );

    // Cache folder structure
    cacheFolderStructure(folderKey, folderStructure);

    res.json(folderStructure);
  } catch (err) {
    console.error("Error listing folder:", err.message);
    res.status(500).send("Error listing folder");
  }
});

app.post("/get-file", async (req, res) => {
  const { fileKey } = req.body;
  if (!fileKey) {
    return res.status(400).send("fileKey parameter is required");
  }

  const cacheFilePath = path.join(cacheDir, fileKey);

  if (fs.existsSync(cacheFilePath)) {
    // Serve from cache
    const fileData = fs.readFileSync(cacheFilePath, "utf-8");
    res.json({ data: fileData });
  } else {
    // Fetch from R2 and cache it
    try {
      await fetchAndCacheFile(process.env.BUCKET_NAME, fileKey);
      const fileData = fs.readFileSync(cacheFilePath, "utf-8");
      res.json({ data: fileData });
    } catch (err) {
      console.error("Error fetching file:", err.message);
      res.status(500).send("Error fetching file");
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
