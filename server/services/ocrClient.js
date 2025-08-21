const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const OCR_URL = process.env.OCR_URL || "http://127.0.0.1:8884/tesseract";

async function ocrImage(filePath) {
  const form = new FormData();
  form.append(
    "options",
    JSON.stringify({
      languages: ["deu"],
      ocrEngineMode: 1,
      pageSegmentationMethod: 6,
    }),
    { contentType: "application/json" }
  );
  form.append("file", fs.createReadStream(filePath));

  const res = await axios.post(OCR_URL, form, {
    headers: form.getHeaders(),
    timeout: 60000,
    validateStatus: () => true,
    responseType: "json",
  });

  // akzeptiere beide Varianten: {stdout: "..."} ODER {data:{stdout:"..."}}
  const stdout =
    (res.data && res.data.stdout) ||
    (res.data && res.data.data && res.data.data.stdout) ||
    "";

  if (!res.status || res.status >= 300) {
    throw new Error(
      `OCR HTTP ${res.status}: ${JSON.stringify(res.data).slice(0, 200)}`
    );
  }

  return String(stdout || "");
}

module.exports = { ocrImage };
