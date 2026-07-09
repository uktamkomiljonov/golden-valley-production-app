"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const compressedAppPath = path.join(root, "compressed-assets", "app.js.gz.b64");
const compressedAppPartsDir = path.join(root, "compressed-assets", "app-js-parts");
const files = [
  "index.html",
  "styles.css",
  "README.md",
  "sample-apricot-run.json",
];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

if (fs.existsSync(path.join(root, "app.js"))) {
  fs.copyFileSync(path.join(root, "app.js"), path.join(dist, "app.js"));
} else if (fs.existsSync(compressedAppPath)) {
  const zlib = require("zlib");
  const compressed = Buffer.from(fs.readFileSync(compressedAppPath, "utf8"), "base64");
  fs.writeFileSync(path.join(dist, "app.js"), zlib.gunzipSync(compressed));
} else if (fs.existsSync(compressedAppPartsDir)) {
  const zlib = require("zlib");
  const encoded = fs.readdirSync(compressedAppPartsDir)
    .sort()
    .map((file) => fs.readFileSync(path.join(compressedAppPartsDir, file), "utf8"))
    .join("");
  fs.writeFileSync(path.join(dist, "app.js"), zlib.gunzipSync(Buffer.from(encoded, "base64")));
} else {
  throw new Error("Missing app.js and compressed app asset");
}

console.log(`Built Golden Valley static app to ${path.relative(root, dist)}`);
