"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const appPath = path.join(root, "app.js");
const brotliAppPath = path.join(root, "compressed-assets", "app.js.br.b64");
const brotliAppPartsDir = path.join(root, "compressed-assets", "app-br-parts");
const compressedAppPath = path.join(root, "compressed-assets", "app.js.gz.b64");
const compressedAppPartsDir = path.join(root, "compressed-assets", "app-js-parts");
function readCompressedApp() {
  if (fs.existsSync(brotliAppPath)) {
    return zlib.brotliDecompressSync(Buffer.from(fs.readFileSync(brotliAppPath, "utf8"), "base64")).toString("utf8");
  }
  if (fs.existsSync(brotliAppPartsDir)) {
    const encoded = fs.readdirSync(brotliAppPartsDir)
      .sort()
      .map((file) => fs.readFileSync(path.join(brotliAppPartsDir, file), "utf8"))
      .join("");
    return zlib.brotliDecompressSync(Buffer.from(encoded, "base64")).toString("utf8");
  }
  const encoded = fs.existsSync(compressedAppPath)
    ? fs.readFileSync(compressedAppPath, "utf8")
    : fs.readdirSync(compressedAppPartsDir)
      .sort()
      .map((file) => fs.readFileSync(path.join(compressedAppPartsDir, file), "utf8"))
      .join("");
  return zlib.gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
}
const source = fs.existsSync(appPath)
  ? fs.readFileSync(appPath, "utf8")
  : readCompressedApp();

const sandbox = {
  console,
  TextEncoder,
  Intl,
  Blob: function BlobStub() {},
  URL: { createObjectURL: () => "", revokeObjectURL: () => {} },
  document: {
    addEventListener: () => {},
    documentElement: { style: { setProperty: () => {} } },
    getElementById: () => ({
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      style: { setProperty: () => {} },
    }),
    querySelectorAll: () => [],
  },
  navigator: {},
  alert: (message) => { throw new Error(message); },
};

vm.createContext(sandbox);
vm.runInContext(`${source}
globalThis.__gv = {
  PRODUCTS, BOXES, PACKAGING_TYPES, DESIGN_TEMPLATES, state,
  buildSscc, buildTracePayload, shipmentItemFromData, prepressSpecJson,
  renderStandaloneProductIllustrationSvg, productVisualSvg, renderBoxFaceSvg,
  render3dPreview, renderPackingListHtml, renderInvoiceHtml,
  renderCsv, traceJson, productionFilename
};`, sandbox);

const gv = sandbox.__gv;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeData(productId, overrides = {}) {
  const product = gv.PRODUCTS.find((item) => item.id === productId);
  const packagingType = overrides.packagingType || product.packagingType || "master-carton";
  const packaging = gv.PACKAGING_TYPES[packagingType];
  const customBoxes = {
    "plastic-crate": { code: "CUSTOM", dimensions: "600 x 400 x 120 mm", w: 600, d: 400, h: 120 },
    "plastic-clamshell": { code: "CUSTOM", dimensions: "400 x 300 x 95 mm", w: 400, d: 300, h: 95 },
    "punnet-carton": { code: "CUSTOM", dimensions: "400 x 300 x 90 mm", w: 400, d: 300, h: 90 },
  };
  const box = overrides.boxCode ? gv.BOXES[overrides.boxCode] : customBoxes[packagingType] || gv.BOXES[product.box];
  const netWeight = overrides.netWeight || product.weight;
  const netWeightKg = Number(netWeight.match(/\d+/)[0]);
  const cartonCount = overrides.cartonCount || 1200;
  const data = {
    brand: "Golden Valley",
    productId: product.id,
    productName: product.en,
    productNameRu: product.ru,
    category: product.category,
    productPhoto: "",
    templateId: "minimal",
    template: gv.DESIGN_TEMPLATES.minimal,
    variety: product.variety,
    grade: "Premium",
    caliber: product.caliber,
    accent: product.accent,
    boxCode: box.code,
    box,
    packagingType,
    packaging,
    consumerPack: overrides.consumerPack || packaging.name,
    unitsPerCarton: overrides.unitsPerCarton || 1,
    netWeight,
    netWeightKg,
    cartonGrossWeightKg: netWeightKg + packaging.tareKg,
    cartonCount,
    totalNetKg: netWeightKg * cartonCount,
    batch: overrides.batch || `GV-${productId.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4)}-260709-001`,
    packingDate: "2026-07-09",
    harvestDate: "2026-07-09",
    temperature: product.temp,
    packedBy: "UTUMS GROUP LLC",
    exporter: "UTUMS GROUP LLC",
    importer: "BFG FIVE STAR FOODSTUFF TRADING LLC",
    origin: "Uzbekistan",
    destination: "Dubai, UAE",
    incoterms: "DAP Dubai, UAE",
    hsCode: product.hs,
    invoiceNo: "GV-INV-260709-001",
    currency: "USD",
    pricePerKg: overrides.pricePerKg || 2.4,
    gs1Prefix: "4781234",
    assets: [],
  };
  data.sscc = gv.buildSscc(data);
  data.tracePayload = gv.buildTracePayload(data);
  data.invoiceTotal = data.totalNetKg * data.pricePerKg;
  return data;
}

assert(gv.PRODUCTS.length >= 155, "Expected at least 155 products");

const cherry = makeData("cherry");
const peach = makeData("peach", { batch: "GV-PEACH-260709-001" });
const pink = makeData("pink-paradise-tomato", { packagingType: "plastic-crate", consumerPack: "Plastic crate bulk tomatoes" });

assert(gv.renderStandaloneProductIllustrationSvg(cherry).includes("data-product-art=\"cherry\""), "Cherry illustration should be product-specific");
assert(gv.productVisualSvg(cherry, 0, 0, 60).includes("data-product-art=\"cherry\""), "Fallback visual should use generated illustration");
assert(pink.boxCode === "CUSTOM" && pink.box.dimensions === "600 x 400 x 120 mm", "Plastic crate products should use custom dimensions");

const threeD = gv.render3dPreview(cherry);
assert((threeD.match(/carton-face/g) || []).length === 6, "3D preview should render six carton faces");
assert((threeD.match(/face-texture/g) || []).length === 6, "3D preview should render six SVG textures");
assert(threeD.includes("data:image/svg+xml"), "3D preview should embed SVG face textures");
assert(!/pallet/i.test(threeD), "3D preview should not include pallet stacking preview");
assert(gv.renderBoxFaceSvg(pink, "front", 300, 100).includes("<svg x="), "Panel artwork should use bounded logo SVGs");

gv.state.shipmentItems = [gv.shipmentItemFromData(cherry), gv.shipmentItemFromData(peach), gv.shipmentItemFromData(pink)];
const packing = gv.renderPackingListHtml(cherry, false);
const invoice = gv.renderInvoiceHtml(cherry, false);
const csv = gv.renderCsv(cherry);
const trace = gv.traceJson(cherry);

assert(packing.includes("Cherries") && packing.includes("Peaches") && packing.includes("Pink Paradise"), "Packing list should include all shipment products");
assert(packing.includes("Plastic crate"), "Packing list should include non-carton packaging");
assert(invoice.includes("Total invoice amount") && invoice.includes("Peaches"), "Invoice should include all shipment products and total");
assert(csv.split("\n").filter(Boolean).length === 4, "CSV should include header and three shipment rows");
assert(trace.shipment_items.length === 3, "Trace JSON should include three shipment items");
assert(gv.prepressSpecJson(cherry).spot_colors.length === 4, "Prepress spec should include spot colors");
assert(gv.productionFilename("svg", cherry) === "GoldenValley_Cherry_2kg.svg", "Production filename should remain predictable");

console.log("production checks passed");
