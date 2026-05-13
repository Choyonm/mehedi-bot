const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json({ limit: "5mb" }));

const VERIFY_TOKEN = "mehedi_bot_2024";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mehedi2024";
const CONFIG_FILE = path.join(__dirname, "config.json");
const KEYS_FILE = path.join(__dirname, "keys.json");

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

const DEFAULT_KEYS = {
  page_access_token: process.env.PAGE_ACCESS_TOKEN || "",
  anthropic_api_key: process.env.ANTHROPIC_API_KEY || "",
};

function loadConfig() {
  try { if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")); } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}
function loadKeys() {
  try { if (fs.existsSync(KEYS_FILE)) return JSON.parse(fs.readFileSync(KEYS_FILE, "utf8")); } catch(e) {}
  return { ...DEFAULT_KEYS };
}
function saveConfig(d) { try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(d, null, 2)); return true; } catch(e) { return false; } }
function saveKeys(d) { try { fs.writeFileSync(KEYS_FILE, JSON.stringify(d, null, 2)); return true; } catch(e) { return false; } }

if (!fs.existsSync(CONFIG_FILE)) saveConfig(DEFAULT_CONFIG);
if (!fs.existsSync(KEYS_FILE)) saveKeys(DEFAULT_KEYS);

// ============================================================
// Admin Panel HTML — সরাসরি server এ
// ============================================================
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Maimuna's Mehendi — Admin</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&display=swap');
:root{--g:#1a7a4a;--gl:#e8f5ee;--gm:#2da05f;--a:#b45309;--al:#fef3c7;--r:#dc2626;--rl:#fee2e2;--bl:#eff6ff;--b:#1d4ed8;--g50:#f9fafb;--g100:#f3f4f6;--g200:#e5e7eb;--g400:#9ca3af;--g600:#4b5563;--g800:#1f2937;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Hind Siliguri',sans-serif;background:var(--g50);color:var(--g800);}
.ov{position:fixed;inset:0;background:var(--g);display:flex;align-items:center;justify-content:center;z-index:999;}
.bx{background:white;border-radius:16px;padding:2rem;width:300px;text-align:center;}
.bx h2{font-size:20px;color:var(--g);margin-bottom:6px;}
.bx p{font-size:13px;color:var(--g400);margin-bottom:16px;}
.bx input{width:100%;padding:10px;border:1px solid var(--g200);border-radius:8px;font-size:15px;font-family:'Hind Siliguri',sans-serif;outline:none;margin-bottom:10px;text-align:center;}
.bx input:focus{border-color:var(--gm);}
.bb{width:100%;padding:11px;background:var(--g);color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:'Hind Siliguri',sans-serif;}
.er{color:var(--r);font-size:13px;margin-top:8px;display:none;}
header{background:var(--g);color:white;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.15);}
.hl{display:flex;align-items:center;gap:12px;}
header h1{font-size:17px;font-weight:600;}
header p{font-size:12px;opacity:.8;}
.tw{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);padding:6px 12px;border-radius:20px;cursor:pointer;border:none;color:white;font-family:'Hind Siliguri',sans-serif;font-size:13px;}
.dt{width:28px;height:16px;border-radius:8px;background:#ef4444;position:relative;transition:background .3s;}
.dt.on{background:#22c55e;}
.dt::after{content:'';position:absolute;width:12px;height:12px;background:white;border-radius:50%;top:2px;left:2px;transition:left .3s;}
.dt.on::after{left:14px;}
.nav{background:white;border-bottom:1px solid var(--g200);display:flex;overflow-x:auto;padding:0 1rem;}
.nb{padding:12px 14px;font-size:13px;font-family:'Hind Siliguri',sans-serif;border:none;background:none;cursor:pointer;color:var(--g600);border-bottom:2px solid transparent;white-space:nowrap;}
.nb.active{color:var(--g);border-bottom-color:var(--g);font-weight:600;}
.ct{padding:1.25rem;max-width:720px;margin:0 auto;}
.pg{display:none;}.pg.active{display:block;}
.cd{background:white;border-radius:10px;border:1px solid var(--g200);padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 4px rgba(0,0,0,.08);}
.cdt{font-size:15px;font-weight:600;margin-bottom:.75rem;display:flex;align-items:center;gap:8px;}
.ic{width:28px;height:28px;background:var(--gl);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:15px;}
label{display:block;font-size:13px;color:var(--g600);margin-bottom:5px;margin-top:12px;font-weight:500;}
label:first-child{margin-top:0;}
input[type=text],input[type=number],input[type=password],textarea{width:100%;padding:9px 12px;border:1px solid var(--g200);border-radius:8px;font-size:14px;font-family:'Hind Siliguri',sans-serif;color:var(--g800);background:var(--g50);outline:none;transition:border .2s;}
input:focus,textarea:focus{border-color:var(--gm);background:white;}
textarea{resize:vertical;min-height:90px;line-height:1.6;}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.mc,.cc{background:var(--g50);border:1px solid var(--g200);border-radius:10px;padding:1rem;margin-bottom:12px;}
.ct2{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.bg{background:var(--g);color:white;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;}
.db{background:var(--rl);color:var(--r);border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-family:'Hind Siliguri',sans-serif;}
.ab{width:100%;padding:10px;border:1.5px dashed var(--gm);background:var(--gl);color:var(--g);border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Hind Siliguri',sans-serif;margin-bottom:1rem;}
.sb{width:100%;padding:13px;background:var(--g);color:white;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;font-family:'Hind Siliguri',sans-serif;margin-top:.5rem;}
.sb:disabled{opacity:.6;}
.sb2{width:100%;padding:11px;background:var(--bl);color:var(--b);border:1px solid #bfdbfe;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Hind Siliguri',sans-serif;margin-top:8px;}
.ip{width:60px;height:60px;border-radius:8px;object-fit:cover;border:1px solid var(--g200);margin-top:6px;display:none;}
.tip{background:var(--al);border-left:3px solid var(--a);border-radius:0 8px 8px 0;padding:10px 14px;font-size:13px;color:var(--a);margin-bottom:1rem;line-height:1.6;}
.tipb{background:var(--bl);border-left:3px solid var(--b);border-radius:0 8px 8px 0;padding:10px 14px;font-size:13px;color:var(--b);margin-bottom:1rem;line-height:1.6;}
.tipg{background:var(--gl);border-left:3px solid var(--g);border-radius:0 8px 8px 0;padding:10px 14px;font-size:13px;color:var(--g);margin-bottom:1rem;line-height:1.6;}
.ks{display:flex;align-items:center;gap:8px;font-size:13px;padding:8px 12px;border-radius:8px;margin-bottom:8px;}
.kok{background:var(--gl);color:var(--g);}
.kno{background:var(--rl);color:var(--r);}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 22px;border-radius:30px;font-size:14px;font-family:'Hind Siliguri',sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.2);display:none;z-index:999;white-space:nowrap;}
.tok{background:var(--g);color:white;}
.ter{background:var(--r);color:white;}
.step{display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;}
.sn{min-width:28px;height:28px;background:var(--g);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;}
.st{font-size:14px;line-height:1.6;padding-top:3px;}
.st a{color:var(--g);}
.st strong{color:var(--g);}
</style>
</head>
<body>

<div class="ov" id="ls">
  <div class="bx">
    <div style="font-size:40px;margin-bottom:8px;">🌿</div>
    <h2>Maimuna's Mehendi</h2>
    <p>Admin Panel এ প্রবেশ করুন</p>
    <input type="password" id="lp" placeholder="Password দিন" onkeydown="if(event.key==='Enter')login()"/>
    <button class="bb" onclick="login()">প্রবেশ করুন</button>
    <div class="er" id="le">❌ Password ভুল হয়েছে</div>
  </div>
</div>

<div id="app" style="display:none;">
  <header>
    <div class="hl">
      <div style="font-size:22px;">🌿</div>
      <div><h1>Maimuna's Mehendi</h1><p id="ss">Admin Panel</p></div>
    </div>
    <button class="tw" onclick="toggleBot()">
      <span id="bl">Bot চালু</span>
      <div class="dt on" id="td"></div>
    </button>
  </header>

  <nav class="nav">
    <button class="nb active" onclick="sw('messages',this)">💬 Messages</button>
    <button class="nb" onclick="sw('combos',this)">🛍️ Combo</button>
    <button class="nb" onclick="sw('settings',this)">⚙️ Settings</button>
    <button class="nb" onclick="sw('guide',this)">📖 Guide</button>
  </nav>

  <div class="ct">

    <div class="pg active" id="pg-messages">
      <div class="tipb">💡 AI message এর মানে বুঝবে, তারপর আপনার লেখা reply পাঠাবে।</div>
      <div id="ml"></div>
      <button class="ab" onclick="addMsg()">+ নতুন Message যোগ করুন</button>
      <button class="sb" onclick="saveCfg()">☁️ Save করুন</button>
    </div>

    <div class="pg" id="pg-combos">
      <div class="tip">💡 ছবির URL দিন। Customer ওই combo চাইলে ছবি + reply যাবে।</div>
      <div id="cl"></div>
      <button class="ab" onclick="addCombo()">+ নতুন Combo যোগ করুন</button>
      <button class="sb" onclick="saveCfg()">☁️ Save করুন</button>
    </div>

    <div class="pg" id="pg-settings">
      <div class="cd">
        <div class="cdt"><div class="ic">📘</div> Facebook Page Access Token</div>
        <div id="fbs" class="ks kno">⏳ Loading...</div>
        <div class="tip">Token মেয়াদ শেষ হলে বা page change করলে এখান থেকে update করুন।</div>
        <label>নতুন Facebook Token</label>
        <input type="password" id="fbt" placeholder="EAAxxxxxxxxxxxxx..."/>
        <button class="sb2" onclick="updateKey('fb')">📘 Facebook Token Update করুন</button>
      </div>
      <div class="cd">
        <div class="cdt"><div class="ic">🤖</div> Claude API Key</div>
        <div id="cls" class="ks kno">⏳ Loading...</div>
        <div class="tip">console.anthropic.com থেকে নতুন key নিয়ে এখানে বসান।</div>
        <label>নতুন Claude API Key</label>
        <input type="password" id="clt" placeholder="sk-ant-api03-..."/>
        <button class="sb2" onclick="updateKey('claude')">🤖 Claude Key Update করুন</button>
      </div>
      <button class="sb" onclick="saveCfg()">☁️ Save করুন</button>
    </div>

    <div class="pg" id="pg-guide">
      <div class="cd">
        <div class="cdt"><div class="ic">ℹ️</div> এই Admin Panel সম্পর্কে</div>
        <div class="tipg">✅ এই Admin Panel সরাসরি server এ আছে। কোনো আলাদা file লাগবে না।<br/>URL: <strong>আপনার-railway-url/admin</strong></div>
      </div>
      <div class="cd">
        <div class="cdt"><div class="ic">🔗</div> Facebook Webhook Connect করুন</div>
        <div class="step"><div class="sn">1</div><div class="st"><a href="https://developers.facebook.com" target="_blank">developers.facebook.com</a> → App → Messenger → <strong>Webhooks</strong></div></div>
        <div class="step"><div class="sn">2</div><div class="st">Callback URL: <strong id="wh-url"></strong></div></div>
        <div class="step"><div class="sn">3</div><div class="st">Verify Token: <strong>mehedi_bot_2024</strong> → messages subscribe → Save ✅</div></div>
      </div>
    </div>

  </div>
</div>

<div class="toast" id="tk"></div>

<script>
let botOn=true,msgs=[],combos=[],PASS='';

function login(){
  PASS=document.getElementById('lp').value;
  fetch('/admin/config?pass='+encodeURIComponent(PASS))
    .then(r=>{
      if(r.ok)return r.json();
      throw new Error('wrong');
    })
    .then(d=>{
      document.getElementById('ls').style.display='none';
      document.getElementById('app').style.display='block';
      loadCfg(d);
      loadKeyStatus();
      document.getElementById('wh-url').textContent=location.origin+'/webhook';
    })
    .catch(()=>{
      document.getElementById('le').style.display='block';
    });
}

function loadCfg(d){
  botOn=d.bot_on!==false;
  msgs=d.saved_messages||[];
  combos=d.combos||[];
  updBot();renderMsgs();renderCombos();
}

function loadKeyStatus(){
  fetch('/admin/keys?pass='+encodeURIComponent(PASS))
    .then(r=>r.json())
    .then(d=>{
      const fb=document.getElementById('fbs');
      const cl=document.getElementById('cls');
      if(d.page_access_token_set){fb.className='ks kok';fb.textContent='✅ Token সেট আছে: '+d.page_access_token_preview;}
      else{fb.className='ks kno';fb.textContent='❌ Token সেট নেই';}
      if(d.anthropic_api_key_set){cl.className='ks kok';cl.textContent='✅ Key সেট আছে: '+d.anthropic_api_key_preview;}
      else{cl.className='ks kno';cl.textContent='❌ Key সেট নেই';}
    });
}

async function saveCfg(){
  try{
    const r=await fetch('/admin/config?pass='+encodeURIComponent(PASS),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bot_on:botOn,saved_messages:msgs,combos})});
    const d=await r.json();
    if(d.success){toast('✅ Save হয়েছে! Bot এখনই update 🎉','tok');document.getElementById('ss').textContent='Saved ✅ '+new Date().toLocaleTimeString('bn-BD');}
    else toast('❌ Save হয়নি','ter');
  }catch(e){toast('❌ Error: '+e.message,'ter');}
}

async function updateKey(type){
  const fb=document.getElementById('fbt').value.trim();
  const cl=document.getElementById('clt').value.trim();
  const payload={};
  if(type==='fb'){if(!fb){toast('Token দিন','ter');return;}payload.page_access_token=fb;}
  if(type==='claude'){if(!cl){toast('Key দিন','ter');return;}payload.anthropic_api_key=cl;}
  try{
    const r=await fetch('/admin/keys?pass='+encodeURIComponent(PASS),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d=await r.json();
    if(d.success){toast('✅ Update হয়েছে! 🎉','tok');loadKeyStatus();document.getElementById('fbt').value='';document.getElementById('clt').value='';}
    else toast('❌ Update হয়নি','ter');
  }catch(e){toast('❌ Error','ter');}
}

function sw(tab,btn){
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');document.getElementById('pg-'+tab).classList.add('active');
}

function toggleBot(){botOn=!botOn;updBot();saveCfg();}
function updBot(){document.getElementById('td').className='dt'+(botOn?' on':'');document.getElementById('bl').textContent=botOn?'Bot চালু':'Bot বন্ধ';}

function renderMsgs(){
  document.getElementById('ml').innerHTML=msgs.map((m,i)=>\`
    <div class="mc">
      <div class="ct2"><span class="bg">\${esc(m.label||'Message '+(i+1))}</span><button class="db" onclick="rmMsg(\${i})">🗑️</button></div>
      <label>Label</label><input type="text" value="\${esc(m.label)}" oninput="msgs[\${i}].label=this.value"/>
      <label>Intent — AI কে বলুন কখন এই reply পাঠাবে</label>
      <input type="text" value="\${esc(m.intent)}" placeholder="যেমন: customer দাম জিজ্ঞেস করছে" oninput="msgs[\${i}].intent=this.value"/>
      <label>Reply — Customer কে হুবহু যা পাঠাবে</label>
      <textarea oninput="msgs[\${i}].reply=this.value">\${esc(m.reply)}</textarea>
    </div>\`).join('');
}
function addMsg(){msgs.push({label:'নতুন Message',intent:'',reply:''});renderMsgs();}
function rmMsg(i){msgs.splice(i,1);renderMsgs();}

function renderCombos(){
  document.getElementById('cl').innerHTML=combos.map((c,i)=>\`
    <div class="cc">
      <div class="ct2"><span class="bg">Combo \${c.id}</span><button class="db" onclick="rmC(\${i})">🗑️</button></div>
      <div class="r2">
        <div><label>নাম</label><input type="text" value="\${esc(c.name)}" oninput="combos[\${i}].name=this.value"/></div>
        <div><label>দাম</label><input type="number" value="\${c.price}" oninput="combos[\${i}].price=+this.value"/></div>
      </div>
      <label>বিবরণ</label><input type="text" value="\${esc(c.details)}" oninput="combos[\${i}].details=this.value"/>
      <label>ছবির URL (Facebook এ upload করে right-click → Copy image address)</label>
      <input type="text" placeholder="https://..." value="\${esc(c.image_url)}" oninput="combos[\${i}].image_url=this.value;pi(this,'p\${i}')"/>
      <img id="p\${i}" class="ip" src="\${esc(c.image_url)}" onerror="this.style.display='none'" style="\${c.image_url?'display:block':''}"/>
      <label>Reply — Customer এই combo চাইলে কি পাঠাবে</label>
      <textarea oninput="combos[\${i}].reply=this.value">\${esc(c.reply||'')}</textarea>
    </div>\`).join('');
}
function addCombo(){const id=combos.length+1;combos.push({id,name:\`কম্বো \${id}\`,price:0,details:'',image_url:'',reply:''});renderCombos();}
function rmC(i){if(combos.length<=1){toast('কমপক্ষে ১টা combo রাখুন','ter');return;}combos.splice(i,1);renderCombos();}
function pi(inp,id){const img=document.getElementById(id);img.src=inp.value;img.style.display=inp.value?'block':'none';img.onerror=()=>img.style.display='none';}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function toast(msg,cls){const t=document.getElementById('tk');t.textContent=msg;t.className='toast '+cls;t.style.display='block';setTimeout(()=>t.style.display='none',3500);}
</script>
</body>
</html>`;

// Admin Panel serve করা
app.get("/admin", (req, res) => res.send(ADMIN_HTML));

// Auth helper
function checkPass(req) {
  return req.query.pass === ADMIN_PASSWORD || req.headers["x-admin-password"] === ADMIN_PASSWORD;
}

// Config routes
app.get("/admin/config", (req, res) => {
  if (!checkPass(req)) return res.status(401).json({ error: "Unauthorized" });
  res.json(loadConfig());
});
app.post("/admin/config", (req, res) => {
  if (!checkPass(req)) return res.status(401).json({ error: "Unauthorized" });
  if (saveConfig(req.body)) res.json({ success: true });
  else res.status(500).json({ error: "Save failed" });
});

// Keys routes
app.get("/admin/keys", (req, res) => {
  if (!checkPass(req)) return res.status(401).json({ error: "Unauthorized" });
  const k = loadKeys();
  res.json({
    page_access_token_set: !!k.page_access_token,
    anthropic_api_key_set: !!k.anthropic_api_key,
    page_access_token_preview: k.page_access_token ? k.page_access_token.substring(0,12)+"..." : "",
    anthropic_api_key_preview: k.anthropic_api_key ? k.anthropic_api_key.substring(0,12)+"..." : "",
  });
});
app.post("/admin/keys", (req, res) => {
  if (!checkPass(req)) return res.status(401).json({ error: "Unauthorized" });
  const cur = loadKeys();
  const upd = {
    page_access_token: req.body.page_access_token || cur.page_access_token,
    anthropic_api_key: req.body.anthropic_api_key || cur.anthropic_api_key,
  };
  if (saveKeys(upd)) res.json({ success: true });
  else res.status(500).json({ error: "Save failed" });
});

// ============================================================
// Bot logic
// ============================================================
const sessions = {};
const delay = ms => new Promise(r => setTimeout(r, ms));

async function sendText(to, text) {
  const k = loadKeys();
  try {
    await axios.post("https://graph.facebook.com/v18.0/me/messages",
      { recipient: { id: to }, message: { text } },
      { params: { access_token: k.page_access_token } });
  } catch(e) { console.error("sendText:", e.response?.data || e.message); }
}

async function sendImage(to, url) {
  const k = loadKeys();
  try {
    await axios.post("https://graph.facebook.com/v18.0/me/messages",
      { recipient: { id: to }, message: { attachment: { type: "image", payload: { url, is_reusable: true } } } },
      { params: { access_token: k.page_access_token } });
  } catch(e) { console.error("sendImage:", e.response?.data || e.message); }
}

async function findMatch(userMessage, config) {
  const k = loadKeys();
  if (!k.anthropic_api_key) return { type: "none" };
  const comboList = config.combos.map(c => `id ${c.id}: "${c.name}" (${c.price} টাকা)`).join("\n");
  const savedList = config.saved_messages.map((m, i) => `index ${i}: ${m.intent}`).join("\n");
  try {
    const res = await axios.post("https://api.anthropic.com/v1/messages",
      { model: "claude-sonnet-4-20250514", max_tokens: 80,
        messages: [{ role: "user", content: `Customer: "${userMessage}"\n\nSaved:\n${savedList}\n\nCombos:\n${comboList}\n\nJSON only:\n{"type":"saved"|"combo"|"combo_list"|"none","index":0,"combo_id":0}` }] },
      { headers: { "x-api-key": k.anthropic_api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" } });
    return JSON.parse(res.data.content[0].text.replace(/```json|```/g,"").trim());
  } catch(e) { return { type: "none" }; }
}

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

async function handleAddr(sid, text, session) {
  if (session.state === "addr_name") {
    session.data.name = text;
    await sendText(sid, "সম্পূর্ণ ঠিকানা লিখুন (গ্রাম, থানা, জেলা সহ) 📍");
    session.state = "addr_address"; return true;
  }
  if (session.state === "addr_address") {
    session.data.address = text;
    await sendText(sid, "মোবাইল নম্বরটা দিন 📞");
    session.state = "addr_phone"; return true;
  }
  if (session.state === "addr_phone") {
    session.data.phone = text;
    await sendText(sid, `আপনার তথ্য নেওয়া হয়েছে ✅\n\n🎯 ${session.data.combo}\n👤 নাম: ${session.data.name}\n📍 ঠিকানা: ${session.data.address}\n📞 নম্বর: ${session.data.phone}\n\nশীঘ্রই confirm করা হবে ইনশাআল্লাহ 🌸`);
    console.log(`\n🛍️ অর্ডার:\n${JSON.stringify(session.data, null, 2)}\n`);
    session.state = null; session.data = {}; return true;
  }
  return false;
}

async function handleMessage(sid, text) {
  const config = loadConfig();
  if (!config.bot_on) return;
  text = (text || "").trim();
  if (!text) return;
  if (!sessions[sid]) sessions[sid] = { state: null, data: {} };
  const session = sessions[sid];
  if (session.state?.startsWith("addr_")) {
    if (await handleAddr(sid, text, session)) return;
  }
  const match = await findMatch(text, config);
  if (match.type === "combo_list") { await sendAllCombos(sid, config); return; }
  if (match.type === "combo") {
    const combo = config.combos.find(c => c.id === match.combo_id);
    if (combo) {
      if (combo.image_url) { await sendImage(sid, combo.image_url); await delay(500); }
      await sendText(sid, combo.reply);
      if ((combo.reply||"").includes("নামটা জানাবেন")) { session.state = "addr_name"; session.data = { combo: `${combo.name} — ${combo.price} টাকা` }; }
      return;
    }
  }
  if (match.type === "saved" && config.saved_messages[match.index]) {
    await sendText(sid, config.saved_messages[match.index].reply); return;
  }
  console.log(`📩 No match | ${sid} | "${text}"`);
}

// Webhook
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

app.get("/", (req, res) => res.send("🌿 Maimuna's Mehendi AI চালু! Admin: /admin"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌿 Bot চালু! Port: ${PORT} | Admin: /admin`));
