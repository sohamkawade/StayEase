const qrcode = require("qrcode-terminal");
const express = require("express");
const cors = require("cors");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "stayEaseSession" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  }
});

let isClientReady = false;

client.on("qr", (qr) => {
  console.log("Scan this QR code from WhatsApp - Linked Devices:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  isClientReady = true;
});

client.on("disconnected", () => {
  isClientReady = false;
  setTimeout(() => client.initialize().catch(() => {}), 3000);
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failed:", msg);
  isClientReady = false;
});

client.initialize().catch((err) => {
  if (err.message.includes("EBUSY")) {
    setTimeout(() => client.initialize().catch(() => {}), 5000);
  } else {
    console.error("Error initializing:", err.message);
  }
});

app.post("/send-message", async (req, res) => {
  if (!isClientReady) {
    return res.status(503).json({ success: false, msg: "WhatsApp client is not ready yet." });
  }

  let { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ success: false, msg: "Phone number and message are required." });
  }

  phone = phone.toString().trim();
  if (phone.startsWith("+")) phone = phone.substring(1);
  if (!phone.startsWith("91")) phone = "91" + phone;

  try {
    await client.sendMessage(`${phone}@c.us`, message);
    res.status(200).json({ success: true, msg: `Message sent to ${phone}` });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ success: false, msg: "Failed to send message." });
  }
});

app.listen(5000, () => console.log("WhatsApp sender server running on port 5000"));
