const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

const safeFileName = (fileName) => {
  const originalFileName = String(fileName);
  const normalizedFileName = path.basename(originalFileName);

  if (
    normalizedFileName !== originalFileName ||
    !/^[a-zA-Z0-9_-]+\.json$/.test(normalizedFileName)
  ) {
    throw new Error("Invalid file name");
  }

  return normalizedFileName;
};

const readJSONFile = (fileName) => {
  const fullPath = path.join(dataDir, safeFileName(fileName));
  if (!fs.existsSync(fullPath)) return [];
  return JSON.parse(fs.readFileSync(fullPath, "utf8") || "[]");
};

const writeJSONFile = (fileName, data) => {
  const fullPath = path.join(dataDir, safeFileName(fileName));
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
};

module.exports = { readJSONFile, writeJSONFile };
