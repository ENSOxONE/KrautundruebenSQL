const fs = require("fs-extra");
const path = require("path");

const source = path.join(__dirname, "..", "src", "www");
const destination = path.join(__dirname, "..", "dist", "www");

fs.copy(source, destination)
  .then(() => console.log("✅ Copied www folder to dist"))
  .catch((err) => console.error("❌ Error copying www folder:", err));
