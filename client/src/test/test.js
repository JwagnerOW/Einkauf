// client/src/test/test.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const BACKEND = process.env.BACKEND_URL || "http://localhost:3000";
const FILE = path.resolve("C:\\Users\\dinar\\Pictures\\receipt.jpg"); // ACHTE auf doppelte Backslashes

async function run() {
  if (!fs.existsSync(FILE)) {
    console.error("Datei nicht gefunden:", FILE);
    process.exit(1);
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(FILE)); // ← echter Stream!

  const { data } = await axios.post(`${BACKEND}/receipts/image`, form, {
    headers: form.getHeaders(), // ← wichtig, setzt boundary korrekt
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  console.log(
    "OK:",
    data._id,
    "items:",
    data.items?.length,
    "total:",
    data.total
  );
}

run().catch((err) => {
  if (err.response) {
    console.error("HTTP", err.response.status, err.response.data);
  } else {
    console.error(err);
  }
  process.exit(1);
});
