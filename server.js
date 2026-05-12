const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json({ limit: "5mb" }));
 
// CORS — Admin Panel থেকে connect করতে দেয়
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
 
// ============================================================
// Railway Variables এ এগুলো দিন (একবারই)
// ============================================================
const VERIFY_TOKEN = "mehedi_bot_2024";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mehedi2024";
 
// ============================================================
// Config files
// ============================================================
const CONFIG_FILE = path.join(__dirname, "config.json");
const KEYS_FILE = path.join(__dirname, "keys.json");
 
// Default bot config
const DEFAULT_CONFIG = {
  bot_on: true,
  saved_messages: [
    { label:"🛍️ অর্ডার", intent:"customer অর্ডার দিতে চাইছে বা কিছু কিনতে চাইছে", reply:"আলহামদুলিল্লাহ! 🌸 কোন কম্বোটি নিতে চান?\n\nকম্বোর তালিকা দেখতে লিখুন 'কম্বো দেখাও' 🌿\nডেলিভারি চার্জ সম্পূর্ণ ফ্রি ✅" },
    { label:"🚚 ডেলিভারি", intent:"customer ডেলিভারি বা পাঠানো নিয়ে জিজ্ঞেস করছে", reply:"আলহামদুলিল্লাহ! 🌸 আমরা সারা বাংলাদেশে হোম ডেলিভারি দিয়ে থাকি।\n\n📦 ডেলিভারি চার্জ সম্পূর্ণ ফ্রি ✅\n🏙️ ঢাকার মধ্যে: ২-৩ কার্যদিবস\n🗺️ ঢাকার বাইরে: ৩-৫ কার্যদিবস\n💳 পেমেন্ট: ক্যাশ অন ডেলিভারি" },
    { label:"🌿 সংরক্ষণ", intent:"customer মেহেদী কিভাবে রাখবে বা সংরক্ষণ নিয়ে জিজ্ঞেস করছে", reply:"মেহেদী সংরক্ষণের নিয়ম 🌿\n\n✅ ডিপ ফ্রিজে রাখুন (৩-৬ মাস)\n✅ ব্যবহারের ১ ঘন্টা আগে বের করুন\n✅ নরমাল ফ্রিজে (১ মাস)\n❌ রোদে বা গরমে রাখবেন না" },
    { label:"🛍️ একটা নেব", intent:"customer একটা বা একটি নিতে চাইছে", reply:"অবশ্যই! 🌸 একটা নিলেও ডেলিভারি ফ্রি ✅\n\nকোন কম্বোটি নিতে চান? লিখুন 'কম্বো দেখাও' 🌿" },
    { label:"🛍️ দুইটা নেব", intent:"customer দুইটা বা দুটা নিতে চাইছে", reply:"অবশ্যই! 🌸 দুইটা নিলে আরো ভালো!\n\nকোন কোন কম্বো নিতে চান?\nলিখুন 'কম্বো দেখাও' 👉 ডেলিভারি ফ্রি ✅" },
  ],
  combos: [
    { id:1, name:"কম্বো ১", price:350, details:"৫ পিস হাতের অর্গানিক মেহেদী 🌿 সাইজ ২০-২২ গ্রাম", image_url:"", reply:"✨ কম্বো ১ — মাত্র ৩৫০ টাকা\n📦 ৫ পিস হাতের অর্গানিক মেহেদী 🌿\n🚚 ডেলিভারি চার্জ ফ্রি ✅\n\nনিতে চাইলে আপনার নামটা জানাবেন? 🌸" },
    { id:2, name:"কম্বো ২", price:380, details:"৪ পিস হাতের + ১ পিস নখের অর্গানিক মেহেদী 💅", image_url:"", reply:"✨ কম্বো ২ — মাত্র ৩৮০ টাকা\n📦 ৪ পিস হাতের + ১ পিস নখের 💅\n🚚 ডেলিভারি চার্জ ফ্রি ✅\n\nনিতে চাইলে আপনার নামটা জানাবেন? 🌸" },
    { id:3, name:"কম্বো ৩", price:480, details:"৬ পিস হাতের অর্গানিক মেহেদী + ১ পিস ফ্রি 🎁", image_url:"", reply:"✨ কম্বো ৩ — মাত্র ৪৮০ টাকা\n📦 ৬ পিস + ১ পিস ফ্রি 🎁\n🚚 ডেলিভারি চার্জ ফ্রি ✅\n\nনিতে চাইলে আপনার নামটা জানাবেন? 🌸" },
    { id:4, name:"কম্বো ৪", price:520, details:"৫ পিস হাতের + ১ পিস নখের + ১ পিস ফ্রি 🎁💅", image_url:"", reply:"✨ কম্বো ৪ — মাত্র ৫২০ টাকা\n📦 ৫ পিস + নখ + ১ পিস ফ্রি 🎁\n🚚 ডেলিভারি চার্জ ফ্রি ✅\n\nনিতে চাইলে আপনার নামটা জানাবেন? 🌸" },
    { id:5, name:"কম্বো ৫", price:348, details:"Large ৩ পিস অর্গানিক মেহেদী + ১ পিস গিফট 🎁✨", image_url:"", reply:"✨ কম্বো ৫ — মাত্র ৩৪৮ টাকা\n📦 Large ৩ পিস + ১ পিস গিফট 🎁\n🚚 ডেলিভারি চার্জ ফ্রি ✅\n\nনিতে চাইলে আপনার নামটা জানাবেন? 🌸" },
  ],
};
 
// Default keys
const DEFAULT_KEYS = {
  page_access_token: process.env.PAGE_ACCESS_TOKEN || "",
  anthropic_api_key: process.env.ANTHROPIC_API_KEY || "",
};
 
function loadConfig() {
  try { if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")); } catch(e) {}
  return { ...DEFAULT_CONFIG };
}
 
function loadKeys() {
  try { if (fs.existsSync(KEYS_FILE)) return JSON.parse(fs.readFileSync(KEYS_FILE, "utf8")); } catch(e) {}
  return { ...DEFAULT_KEYS };
}
 
function saveConfig(data) {
  try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2)); return true; } catch(e) { return false; }
}
 
function saveKeys(data) {
  try { fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2)); return true; } catch(e) { return false; }
}
 
if (!fs.existsSync(CONFIG_FILE)) saveConfig(DEFAULT_CONFIG);
if (!fs.existsSync(KEYS_FILE)) saveKeys(DEFAULT_KEYS);
 
// Auth middleware
function auth(req, res, next) {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  next();
}
 
// ============================================================
// Admin APIs
// ============================================================
 
// Bot config নেওয়া
app.get("/admin/config", auth, (req, res) => res.json(loadConfig()));
 
// Bot config update
app.post("/admin/config", auth, (req, res) => {
  if (saveConfig(req.body)) { console.log("✅ Config updated"); res.json({ success: true }); }
  else res.status(500).json({ error: "Save failed" });
});
 
// API Keys নেওয়া (masked)
app.get("/admin/keys", auth, (req, res) => {
  const keys = loadKeys();
  res.json({
    page_access_token_set: !!keys.page_access_token,
    anthropic_api_key_set: !!keys.anthropic_api_key,
    page_access_token_preview: keys.page_access_token ? keys.page_access_token.substring(0, 10) + "..." : "",
    anthropic_api_key_preview: keys.anthropic_api_key ? keys.anthropic_api_key.substring(0, 10) + "..." : "",
  });
});
 
// API Keys update
app.post("/admin/keys", auth, (req, res) => {
  const current = loadKeys();
  const updated = {
    page_access_token: req.body.page_access_token || current.page_access_token,
    anthropic_api_key: req.body.anthropic_api_key || current.anthropic_api_key,
  };
  if (saveKeys(updated)) { console.log("✅ API Keys updated"); res.json({ success: true }); }
  else res.status(500).json({ error: "Save failed" });
});
 
// ============================================================
// Sessions
// ============================================================
const sessions = {};
const delay = ms => new Promise(r => setTimeout(r, ms));
 
// ============================================================
// Facebook helpers
// ============================================================
async function sendText(to, text) {
  const keys = loadKeys();
  try {
    await axios.post(
      "https://graph.facebook.com/v18.0/me/messages",
      { recipient: { id: to }, message: { text } },
      { params: { access_token: keys.page_access_token } }
    );
  } catch(e) { console.error("sendText:", e.response?.data || e.message); }
}
 
async function sendImage(to, url) {
  const keys = loadKeys();
  try {
    await axios.post(
      "https://graph.facebook.com/v18.0/me/messages",
      { recipient: { id: to }, message: { attachment: { type: "image", payload: { url, is_reusable: true } } } },
      { params: { access_token: keys.page_access_token } }
    );
  } catch(e) { console.error("sendImage:", e.response?.data || e.message); }
}
 
// ============================================================
// Claude AI — intent বোঝে
// ============================================================
async function findMatch(userMessage, config) {
  const keys = loadKeys();
  const comboList = config.combos.map(c => `id ${c.id}: "${c.name}" (${c.price} টাকা)`).join("\n");
  const savedList = config.saved_messages.map((m, i) => `index ${i}: ${m.intent}`).join("\n");
 
  try {
    const res = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 80,
        messages: [{
          role: "user",
          content: `Customer message: "${userMessage}"\n\nSaved replies:\n${savedList}\n\nCombos:\n${comboList}\n\nJSON only:\n{"type":"saved"|"combo"|"combo_list"|"none","index":number,"combo_id":number}`
        }],
      },
      { headers: { "x-api-key": keys.anthropic_api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" } }
    );
    const clean = res.data.content[0].text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch(e) { return { type: "none" }; }
}
 
// ============================================================
// Combo list পাঠানো
// ============================================================
async function sendAllCombos(to, config) {
  await sendText(to, "আমাদের সব কম্বো দেখুন 🌸 ডেলিভারি চার্জ সম্পূর্ণ ফ্রি ✅");
  await delay(600);
  for (const c of config.combos) {
    if (c.image_url) { await sendImage(to, c.image_url); await delay(500); }
    await sendText(to, `✨ ${c.name} — মাত্র ${c.price} টাকা\n📦 ${c.details}`);
    await delay(900);
  }
  await sendText(to, "কোন কম্বোটি নিতে চান? 💚");
}
 
// ============================================================
// Address flow
// ============================================================
async function handleAddressFlow(senderId, text, session) {
  if (session.state === "addr_name") {
    session.data.name = text;
    await sendText(senderId, "সম্পূর্ণ ঠিকানা লিখুন (গ্রাম, থানা, জেলা সহ) 📍");
    session.state = "addr_address"; return true;
  }
  if (session.state === "addr_address") {
    session.data.address = text;
    await sendText(senderId, "মোবাইল নম্বরটা দিন 📞");
    session.state = "addr_phone"; return true;
  }
  if (session.state === "addr_phone") {
    session.data.phone = text;
    await sendText(senderId,
      `আপনার তথ্য নেওয়া হয়েছে ✅\n\n🎯 ${session.data.combo}\n👤 নাম: ${session.data.name}\n📍 ঠিকানা: ${session.data.address}\n📞 নম্বর: ${session.data.phone}\n\nশীঘ্রই confirm করা হবে ইনশাআল্লাহ 🌸`
    );
    console.log(`\n🛍️ অর্ডার তথ্য:\nকম্বো: ${session.data.combo}\nনাম: ${session.data.name}\nঠিকানা: ${session.data.address}\nনম্বর: ${session.data.phone}\n`);
    session.state = null; session.data = {}; return true;
  }
  return false;
}
 
// ============================================================
// Main handler
// ============================================================
async function handleMessage(senderId, text) {
  const config = loadConfig();
  if (!config.bot_on) return;
  text = (text || "").trim();
  if (!text) return;
 
  if (!sessions[senderId]) sessions[senderId] = { state: null, data: {} };
  const session = sessions[senderId];
 
  if (session.state?.startsWith("addr_")) {
    if (await handleAddressFlow(senderId, text, session)) return;
  }
 
  const match = await findMatch(text, config);
 
  if (match.type === "combo_list") { await sendAllCombos(senderId, config); return; }
  if (match.type === "combo") {
    const combo = config.combos.find(c => c.id === match.combo_id);
    if (combo) {
      if (combo.image_url) { await sendImage(senderId, combo.image_url); await delay(500); }
      await sendText(senderId, combo.reply);
      if ((combo.reply||'').includes("নামটা জানাবেন")) {
        session.state = "addr_name";
        session.data = { combo: `${combo.name} — ${combo.price} টাকা` };
      }
      return;
    }
  }
  if (match.type === "saved" && config.saved_messages[match.index]) {
    await sendText(senderId, config.saved_messages[match.index].reply); return;
  }
  console.log(`📩 No match | ${senderId} | "${text}"`);
}
 
// ============================================================
// Webhook
// ============================================================
app.get("/webhook", (req, res) => {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === VERIFY_TOKEN)
    res.status(200).send(req.query["hub.challenge"]);
  else res.sendStatus(403);
});
 
app.post("/webhook", async (req, res) => {
  res.status(200).send("EVENT_RECEIVED");
  const body = req.body;
  if (body.object !== "page") return;
  for (const entry of body.entry)
    for (const event of entry.messaging || [])
      if (event.message && !event.message.is_echo && event.message.text)
        await handleMessage(event.sender.id, event.message.text);
});
 
app.get("/", (req, res) => res.send("🌿 Maimuna's Mehendi AI চালু!"));
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌿 Bot চালু! Port: ${PORT}`));
 
