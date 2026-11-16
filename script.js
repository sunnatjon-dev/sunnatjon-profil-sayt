// =========================================================
// Bu fayl saytni "jonlantiradi".
// Har bir bo'lim alohida raqamlangan — o'qib chiqing!
// =========================================================

const html = document.documentElement;

// Foydalanuvchi animatsiyalarni o'chirib qo'yganmi? (qulaylik uchun)
const harakatKam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// ----- 1. Shtrix-kod (bezak): matndagi har bir harfdan ingichka va qalin chiziqlar yasaymiz -----
document.querySelectorAll("[data-barcode]").forEach((svg) => {
  const NS = "http://www.w3.org/2000/svg";
  let x = 0, chiziqmi = true;
  const qadamlar = [3, 1, 1];                                // boshidagi "himoya" chiziqlari
  [...svg.dataset.barcode].forEach((harf) => {
    const kod = harf.charCodeAt(0);
    for (let bit = 0; bit < 6; bit++) qadamlar.push((kod >> bit) & 1 ? 3 : 1);
  });
  qadamlar.push(1, 1, 3);                                    // oxiridagi "himoya" chiziqlari

  qadamlar.forEach((kenglik) => {
    if (chiziqmi) {
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("width", kenglik);
      rect.setAttribute("height", 40);
      svg.appendChild(rect);
    }
    x += kenglik;
    chiziqmi = !chiziqmi;
  });
  svg.setAttribute("viewBox", `0 0 ${x} 40`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.style.width = Math.min(x * 0.9, 220) + "px";
});


// ----- 2. Panellar ekranga kirganda paydo bo'lishi -----
// Bir qatordagi panellar ketma-ket (biroz kechikish bilan) chiqadi.
const kuzatuvchi = new IntersectionObserver((elementlar) => {
  const yangilar = elementlar.filter((el) => el.isIntersecting).map((el) => el.target);
  yangilar.forEach((blok, tartib) => {
    blok.style.setProperty("--d", tartib * 0.08 + "s");
    blok.classList.add("is-in");
    kuzatuvchi.unobserve(blok);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".panel").forEach((el) => kuzatuvchi.observe(el));


// ----- 3. GitHub'dan HAQIQIY raqamlar -----
// Soxta raqam o'rniga GitHub'ning ochiq API'sidan olamiz. GitHub bir soatda 60 ta so'rovga
// ruxsat beradi, shuning uchun javobni 1 soat brauzer xotirasida saqlab turamiz.
const GITHUB = { foydalanuvchi: "sunnatjon-dev", repo: "sunnatjon-profil-sayt" };
const GH_KESH = "gh-malumot";
const BIR_SOAT = 60 * 60 * 1000;

async function githubdanOl() {
  const api = "https://api.github.com";
  const [profil, commitlar] = await Promise.all([
    fetch(`${api}/users/${GITHUB.foydalanuvchi}`),
    fetch(`${api}/repos/${GITHUB.foydalanuvchi}/${GITHUB.repo}/commits?per_page=1`),
  ]);
  if (!profil.ok || !commitlar.ok) throw new Error("GitHub javob bermadi");

  // Commitlar soni: har sahifada 1 ta commit → oxirgi sahifa raqami = commitlar soni
  const havola = commitlar.headers.get("Link") || "";
  const oxirgiSahifa = havola.match(/[?&]page=(\d+)>; rel="last"/);
  const songgi = await commitlar.json();

  return {
    commitlar: oxirgiSahifa ? Number(oxirgiSahifa[1]) : songgi.length,
    repolar: (await profil.json()).public_repos,
    oxirgi: songgi[0]?.commit.author.date,
    vaqt: Date.now(),
  };
}

function githubniKorsat(m) {
  document.getElementById("gh-commits").textContent = m.commitlar;
  document.getElementById("gh-repos").textContent = m.repolar;
  if (m.oxirgi) {
    const sana = new Date(m.oxirgi);
    const kun = String(sana.getDate()).padStart(2, "0");
    const oy = String(sana.getMonth() + 1).padStart(2, "0");
    document.getElementById("gh-last").textContent = `${kun}.${oy}`;
  }
}

(async function github() {
  let kesh = null;
  try { kesh = JSON.parse(localStorage.getItem(GH_KESH)); } catch (e) {}
  if (kesh) githubniKorsat(kesh);                     // avval eski ma'lumotni darhol ko'rsatamiz
  if (kesh && Date.now() - kesh.vaqt < BIR_SOAT) return;

  try {
    const yangi = await githubdanOl();
    githubniKorsat(yangi);
    try { localStorage.setItem(GH_KESH, JSON.stringify(yangi)); } catch (e) {}
  } catch (e) {
    // Internet yo'q yoki limit tugagan — "—" belgisi qoladi, sayt ishlashda davom etadi
  }
})();


// ----- 4. O'rganish kundaligi: yozuvlarni sanash va "Hammasini ko'rsatish" -----
// Yozuvlar HTML ichida — yangisini qo'shsangiz, raqamlar o'zi yangilanadi.
const kundalik = document.getElementById("log");
const yozuvlar = kundalik.querySelectorAll(".log__item");
const kundalikTugma = document.getElementById("log-more");
const KORINADIGAN = 5;                                        // dastlab nechta yozuv ko'rinadi

document.getElementById("log-total").textContent = String(yozuvlar.length).padStart(2, "0");
const oxirgiSana = yozuvlar[0]?.querySelector("time")?.textContent.slice(0, 5);
if (oxirgiSana) document.getElementById("log-count").textContent = "Oxirgi: " + oxirgiSana;

if (yozuvlar.length > KORINADIGAN) {
  kundalik.classList.add("is-collapsed");
  kundalikTugma.hidden = false;
  kundalikTugma.addEventListener("click", () => {
    const yopiqmi = kundalik.classList.toggle("is-collapsed");
    kundalikTugma.textContent = yopiqmi ? "Hammasini ko‘rsatish" : "Kamroq ko‘rsatish";
    kundalikTugma.setAttribute("aria-expanded", String(!yopiqmi));
  });
}


// ----- 5. FIZIKA LABORATORIYASI: to'p otish -----
// Havo qarshiligini hisobga olmaymiz. Maktab fizikasidagi formulalar:
//   x(t) = v·cosθ·t              — to'p qancha oldinga ketdi
//   y(t) = v·sinθ·t − g·t²/2     — to'p qancha balandda
//   Masofa     R = v²·sin2θ / g
//   Balandlik  H = (v·sinθ)² / 2g
//   Vaqt       T = 2·v·sinθ / g
const sayyoralar = { yer: 9.81, mars: 3.71, oy: 1.62 };   // erkin tushish tezlanishi (g), m/s²
const MAKS_TEZLIK = 30;                                     // surgichdagi eng katta tezlik, m/s

const labCanvas = document.getElementById("lab-canvas");
const ctx = labCanvas.getContext("2d");
const burchakInput = document.getElementById("lab-angle");
const tezlikInput = document.getElementById("lab-speed");
const labXabar = document.getElementById("lab-msg");
const tegishEl = document.getElementById("lab-hits");
const natijaEl = {
  R: document.getElementById("r-range"),
  H: document.getElementById("r-height"),
  T: document.getElementById("r-time"),
};

// CSS'dagi ranglarni olamiz — shunda rang faqat bitta joyda (style.css) turadi
const css = (nom) => getComputedStyle(document.documentElement).getPropertyValue(nom).trim();
const ranglar = {
  ink: css("--ink"), muted: css("--muted"), rule: css("--rule"),
  grey: css("--grey"), cyan: css("--cyan"), orange: css("--orange"), field: css("--field"),
};

const lab = {
  g: sayyoralar.yer,
  otishlar: [],     // oldingi otishlar (kulrang izi qoladi)
  uchayotgan: null, // hozir havoda turgan to'p
  nishon: null,     // { x, eni } — metrda
  tegishlar: 0,
};

// Bitta otishning barcha natijalarini hisoblash
function hisobla(v, gradus, g) {
  const r = gradus * Math.PI / 180;               // gradusni radianga o'tkazamiz
  return {
    v, r, g,
    R: v * v * Math.sin(2 * r) / g,
    H: (v * Math.sin(r)) ** 2 / (2 * g),
    T: 2 * v * Math.sin(r) / g,
  };
}

// t sekunddan keyin to'p qayerda? → [x, y] metrda
function nuqta(otish, t) {
  return [
    otish.v * Math.cos(otish.r) * t,
    otish.v * Math.sin(otish.r) * t - (otish.g * t * t) / 2,
  ];
}

// 1, 2, 5, 10, 20, 50 … kabi "chiroyli" o'lchov qadami
function qulayQadam(taxminiy) {
  const daraja = 10 ** Math.floor(Math.log10(taxminiy));
  const n = taxminiy / daraja;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * daraja;
}

// Maydon kengligi (metr): eng uzoq otish (45°, eng katta tezlik) sig'ishi kerak
function maydonKengligi() {
  const engUzoq = MAKS_TEZLIK ** 2 / lab.g;
  const qadam = qulayQadam(engUzoq / 8);
  return Math.ceil((engUzoq * 1.04) / qadam) * qadam;
}

function yangiNishon() {
  const W = maydonKengligi();
  lab.nishon = { x: W * (0.25 + Math.random() * 0.55), eni: W * 0.06 };
}


// --- Chizish ---
const CHET = { chap: 40, ong: 16, tepa: 14, past: 28 };   // grafik atrofidagi bo'sh joy, px
let olcham = { w: 0, h: 0 };

// Metrni pikselga aylantiruvchi "masshtab" (ikkala o'qda bir xil, shakl buzilmaydi)
function masshtab() {
  const W = maydonKengligi();
  const k = (olcham.w - CHET.chap - CHET.ong) / W;        // 1 metr = k piksel
  return {
    W,
    Hm: (olcham.h - CHET.tepa - CHET.past) / k,             // ko'rinadigan balandlik, metr
    x: (metr) => CHET.chap + metr * k,
    y: (metr) => olcham.h - CHET.past - metr * k,
  };
}

function chiziq(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function traektoriya(otish, tOxiri, m) {
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const [x, y] = nuqta(otish, (tOxiri * i) / 80);
    if (i === 0) ctx.moveTo(m.x(x), m.y(y));
    else ctx.lineTo(m.x(x), m.y(y));
  }
  ctx.stroke();
}

function chiz() {
  if (!olcham.w) return;
  const m = masshtab();
  ctx.clearRect(0, 0, olcham.w, olcham.h);
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  // 1) To'r chiziqlari va o'lchovlar
  const qadam = qulayQadam(m.W / 8);
  ctx.strokeStyle = ranglar.rule;
  ctx.fillStyle = ranglar.muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let x = 0; x <= m.W + 1e-6; x += qadam) {
    const px = Math.round(m.x(x)) + 0.5;
    chiziq(px, CHET.tepa, px, m.y(0));
    ctx.fillText(x + (x + qadam > m.W ? " m" : ""), px, m.y(0) + 9);
  }
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let y = qadam; y <= m.Hm; y += qadam) {
    const py = Math.round(m.y(y)) + 0.5;
    chiziq(CHET.chap, py, olcham.w - CHET.ong, py);
    ctx.fillText(y, CHET.chap - 8, py);
  }

  // 2) Yer sathi — to'q sariq chiziq
  ctx.strokeStyle = ranglar.orange;
  ctx.lineWidth = 2;
  chiziq(CHET.chap, m.y(0) + 1, olcham.w - CHET.ong, m.y(0) + 1);

  // 3) Nishon: moviy maydoncha va bayroqcha
  const { x: nx, eni } = lab.nishon;
  const bayroqX = m.x(nx + eni / 2);
  ctx.fillStyle = ranglar.cyan;
  ctx.strokeStyle = ranglar.ink;
  ctx.lineWidth = 1;
  ctx.fillRect(m.x(nx), m.y(0) - 6, m.x(nx + eni) - m.x(nx), 6);
  ctx.strokeRect(m.x(nx) + 0.5, m.y(0) - 5.5, m.x(nx + eni) - m.x(nx) - 1, 6);
  chiziq(bayroqX, m.y(0) - 6, bayroqX, m.y(0) - 30);
  ctx.beginPath();
  ctx.moveTo(bayroqX, m.y(0) - 30);
  ctx.lineTo(bayroqX + 13, m.y(0) - 25);
  ctx.lineTo(bayroqX, m.y(0) - 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4) Oldingi otishlar — kulrang uzuq chiziq
  ctx.strokeStyle = ranglar.grey;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  lab.otishlar.slice(0, -1).forEach((o) => traektoriya(o, o.T, m));
  ctx.setLineDash([]);

  // 5) Oxirgi otish — qora chiziq, eng baland nuqta va tushgan joy
  const oxirgi = lab.uchayotgan ? null : lab.otishlar[lab.otishlar.length - 1];
  if (oxirgi) {
    ctx.strokeStyle = ranglar.ink;
    ctx.lineWidth = 1.6;
    traektoriya(oxirgi, oxirgi.T, m);
    belgi(m.x(oxirgi.R / 2), m.y(oxirgi.H), `H ${oxirgi.H.toFixed(1)} m`, "tepada");
    belgi(m.x(oxirgi.R), m.y(0), `R ${oxirgi.R.toFixed(1)} m`, "o‘ngda");
  }

  // 6) Otish moslamasi — tanlangan burchak bo'yicha qiya chiziq
  const burchak = (Number(burchakInput.value) * Math.PI) / 180;
  const ox = m.x(0), oy = m.y(0);
  ctx.strokeStyle = ranglar.ink;
  ctx.lineWidth = 4;
  ctx.lineCap = "square";
  chiziq(ox, oy, ox + Math.cos(burchak) * 24, oy - Math.sin(burchak) * 24);
  ctx.lineCap = "butt";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ox, oy, 34, -burchak, 0);
  ctx.stroke();
  ctx.fillStyle = ranglar.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(burchakInput.value + "°", ox + 38, oy - 4);

  // 7) Havodagi to'p
  if (lab.uchayotgan) {
    const u = lab.uchayotgan;
    ctx.strokeStyle = ranglar.ink;
    ctx.lineWidth = 1.6;
    traektoriya(u, u.t, m);
    const [x, y] = nuqta(u, u.t);
    ctx.beginPath();
    ctx.arc(m.x(x), m.y(y), 6, 0, Math.PI * 2);
    ctx.fillStyle = ranglar.cyan;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// Grafikdagi kichik halqa va yozuv (yozuv halqaning tepasida yoki o'ng tomonida)
function belgi(px, py, matn, joy) {
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = ranglar.field;
  ctx.fill();
  ctx.strokeStyle = ranglar.ink;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = ranglar.ink;
  ctx.textBaseline = "bottom";
  if (joy === "tepada") {
    ctx.textAlign = "center";
    ctx.fillText(matn, px, py - 9);
  } else {
    ctx.textAlign = "left";
    ctx.fillText(matn, px + 8, py - 5);
  }
}


// --- Otish ---
function ot() {
  if (lab.uchayotgan) return;                         // to'p hali havoda
  const otish = hisobla(Number(tezlikInput.value), Number(burchakInput.value), lab.g);
  labXabar.textContent = "";

  if (harakatKam) { qondi(otish); return; }           // animatsiyasiz rejim — darhol natija

  // Uzoq uchishlarni (masalan, Oyda) tezlashtiramiz, aks holda 30 soniya kutish kerak bo'lardi
  const tezlashtirish = Math.max(1, (2 * MAKS_TEZLIK) / lab.g / 2.4);
  lab.uchayotgan = { ...otish, t: 0 };
  let oldingi = performance.now();

  function kadr(hozir) {
    lab.uchayotgan.t += ((hozir - oldingi) / 1000) * tezlashtirish;
    oldingi = hozir;
    if (lab.uchayotgan.t >= otish.T) {
      lab.uchayotgan = null;
      qondi(otish);
      return;
    }
    chiz();
    requestAnimationFrame(kadr);
  }
  requestAnimationFrame(kadr);
}

// To'p yerga qo'ndi — natijani ko'rsatamiz
function qondi(otish) {
  lab.otishlar.push(otish);
  if (lab.otishlar.length > 5) lab.otishlar.shift();

  natijaEl.R.textContent = otish.R.toFixed(1);
  natijaEl.H.textContent = otish.H.toFixed(1);
  natijaEl.T.textContent = otish.T.toFixed(1);

  const markaz = lab.nishon.x + lab.nishon.eni / 2;
  const farq = otish.R - markaz;
  if (Math.abs(farq) <= lab.nishon.eni / 2) {
    lab.tegishlar++;
    tegishEl.textContent = "Nishon: " + lab.tegishlar;
    labXabar.textContent = "🎯 Nishonga tegdi! Yangi nishon qo‘yildi.";
    yangiNishon();
  } else {
    labXabar.textContent = `${Math.abs(farq).toFixed(1)} m ${farq < 0 ? "qisqa" : "uzoq"} tushdi — yana urinib ko‘ring.`;
  }
  chiz();
}

function natijalarniTozala() {
  Object.values(natijaEl).forEach((el) => (el.textContent = "—"));
}


// --- Boshqaruv elementlari ---
function surgichlar() {
  document.getElementById("out-angle").textContent = burchakInput.value + "°";
  document.getElementById("out-speed").textContent = tezlikInput.value + " m/s";
  if (!lab.uchayotgan) chiz();
}
burchakInput.addEventListener("input", surgichlar);
tezlikInput.addEventListener("input", surgichlar);

document.querySelectorAll('input[name="sayyora"]').forEach((tanlov) => {
  tanlov.addEventListener("change", () => {
    if (lab.uchayotgan) lab.uchayotgan = null;
    lab.g = sayyoralar[tanlov.value];
    lab.otishlar = [];
    yangiNishon();
    natijalarniTozala();
    labXabar.textContent = `g = ${lab.g} m/s² — to‘p endi boshqacha uchadi!`;
    chiz();
  });
});

document.getElementById("lab-form").addEventListener("submit", (e) => {
  e.preventDefault();
  ot();
});

document.getElementById("lab-clear").addEventListener("click", () => {
  lab.otishlar = [];
  natijalarniTozala();
  labXabar.textContent = "";
  chiz();
});

// Canvas o'lchami — ekran zichligini hisobga olamiz (aks holda chiziqlar xira chiqadi)
function olchamniYangila() {
  const dpr = window.devicePixelRatio || 1;
  const quti = labCanvas.getBoundingClientRect();
  olcham = { w: quti.width, h: quti.height };
  labCanvas.width = Math.round(quti.width * dpr);
  labCanvas.height = Math.round(quti.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  chiz();
}

yangiNishon();
natijalarniTozala();
new ResizeObserver(olchamniYangila).observe(labCanvas);
document.fonts?.ready.then(chiz);                   // shrift yuklangach yozuvlarni qayta chizamiz


// ----- 6. Xabar oynachasi (toast) -----
const toast = document.getElementById("toast");
let toastTaymer;
function xabar(matn) {
  toast.textContent = matn;
  toast.classList.add("show");
  clearTimeout(toastTaymer);
  toastTaymer = setTimeout(() => toast.classList.remove("show"), 2400);
}


// ----- 7. Email va Telegram manzilini nusxalash -----
async function nusxala(matn) {
  try {
    await navigator.clipboard.writeText(matn);
  } catch {
    // Eski brauzerlar uchun zaxira usul
    const t = document.createElement("textarea");
    t.value = matn;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  xabar("✅ Nusxalandi: " + matn);
}

document.querySelectorAll("[data-copy]").forEach((tugma) => {
  tugma.addEventListener("click", () => nusxala(tugma.dataset.copy));
});


// ----- 8. Xabar yozish shakli → Gmail -----
document.getElementById("xabar-form").addEventListener("submit", (e) => {
  e.preventDefault();                 // sahifa yangilanib ketmasin
  const forma = e.target;
  const ism = forma.ism.value.trim();
  const matn = forma.xabar.value.trim();
  if (!ism || !matn) { xabar("✍️ Iltimos, ism va xabarni yozing"); return; }

  const mavzu = encodeURIComponent("Saytdan xabar — " + ism);
  const tana = encodeURIComponent(matn + "\n\n— " + ism);
  window.location.href = `mailto:gulbayevsunnatjon@gmail.com?subject=${mavzu}&body=${tana}`;
  xabar("📬 Pochta ilovasi ochilmoqda…");
  forma.reset();
});


// ----- 9. INTERAKTIV TERMINAL -----
const termBody = document.getElementById("term-body");
const termOutput = document.getElementById("term-output");
const termForm = document.getElementById("term-form");
const termInput = document.getElementById("term-input");
const tarix = [];        // oldin yozilgan buyruqlar
let tarixJoy = 0;

function salomlashish() {
  const soat = new Date().getHours();
  if (soat >= 5 && soat < 11) return "Xayrli tong! ☀️";
  if (soat >= 11 && soat < 17) return "Xayrli kun! 👋";
  if (soat >= 17 && soat < 22) return "Xayrli kech! 🌆";
  return "Xayrli tun! 🌙";
}

const hazillar = [
  "Nega dasturchilar tabiatni yoqtirmaydi?\n— Chunki u yerda juda ko‘p bug (hasharot) bor! 🐛",
  "— Kodim ishlayaptimi?\n— Ha.\n— Nega ishlayapti?\n— Bilmayman... 😅",
  "Mening kodim xatosiz ishlaydi.\nFaqat hali ishga tushirib ko‘rmadim. 🤫",
  "Kompyuter hech qachon xato qilmaydi —\nu shunchaki siz yozganingizni bajaradi. 🤖",
  "Ctrl+C va Ctrl+V — dasturchining eng yaqin do‘stlari. 📋",
];

// Har bir buyruq — bitta funksiya. Yangi buyruq qo'shish oson!
const buyruqlar = {
  yordam: () => [
    ["t-ok", "Mavjud buyruqlar:"],
    ["t-out", "  haqimda      — men kimman"],
    ["t-out", "  loyihalar    — qilgan ishlarim"],
    ["t-out", "  qiziqishlar  — nimalarga qiziqaman"],
    ["t-out", "  yol          — dasturchi bo‘lish yo‘lim"],
    ["t-out", "  kundalik     — nimalarni o‘rgandim"],
    ["t-out", "  aloqa        — men bilan bog‘lanish"],
    ["t-out", "  sayt         — bu sayt nimadan yasalgan"],
    ["t-out", "  hazil        — dasturchilar hazili"],
    ["t-out", "  sana         — bugungi sana va vaqt"],
    ["t-out", "  salom        — salomlashish"],
    ["t-out", "  tozalash     — ekranni tozalash"],
    ["t-dim", "Maslahat: ↑ tugmasi oldingi buyruqni qaytaradi."],
  ],
  haqimda: () => [
    ["t-out", "👤 Sunnatjon Gulboyev"],
    ["t-out", "🎓 9-sinf o‘quvchisi"],
    ["t-out", "📍 Jizzax, O‘zbekiston"],
    ["t-out", "🎯 Maqsad: professional dasturchi bo‘lish"],
  ],
  qiziqishlar: () => [
    ["t-out", "⚽ Futbol   🔭 Fizika   🚗 Mashinalar   🎧 Musiqa"],
    ["t-dim", "…va albatta dasturlash 💻"],
  ],
  // Loyihalar ro'yxati sahifadagi kartochkalardan olinadi — yangisi qo'shilsa, bu ham yangilanadi
  loyihalar: () =>
    [...document.querySelectorAll(".proj")].map((p) => [
      "t-out",
      `${p.querySelector(".proj__n").textContent}  ${p.querySelector("h3").textContent}`,
    ]),
  github: () => [
    ["t-out", 'GitHub: <a href="https://github.com/sunnatjon-dev" target="_blank" rel="noopener">github.com/sunnatjon-dev</a>', true],
  ],
  yol: () => [
    ["t-ok", "✔ 01 HTML"],
    ["t-ok", "✔ 02 CSS"],
    ["t-err", "▶ 03 JavaScript  ← hozir shu yerdaman"],
    ["t-dim", "○ 04 Loyihalar"],
    ["t-dim", "○ 05 Dasturchi 🚀"],
  ],
  kundalik: () =>
    [...document.querySelectorAll(".log__item")].map((y) => [
      "t-out",
      `${y.querySelector("time").textContent}  [${y.querySelector(".log__tag").textContent}]  ${y.querySelector("h3").textContent}`,
    ]),
  aloqa: () => [
    ["t-out", 'Gmail:    <a href="mailto:gulbayevsunnatjon@gmail.com">gulbayevsunnatjon@gmail.com</a>', true],
    ["t-out", 'Telegram: <a href="https://t.me/sunnatjon_dev" target="_blank" rel="noopener">@sunnatjon_dev</a>', true],
    ["t-out", 'GitHub:   <a href="https://github.com/sunnatjon-dev" target="_blank" rel="noopener">github.com/sunnatjon-dev</a>', true],
  ],
  sayt: () => [
    ["t-out", "index.html  → sahifa tuzilishi (skelet)"],
    ["t-out", "style.css   → dizayn va ranglar (kiyim)"],
    ["t-out", "script.js   → harakat va mantiq (miya)"],
    ["t-dim", "Maslahat: F12 → Console bo‘limida sizga xabar bor 😉"],
  ],
  hazil: () => [["t-out", hazillar[Math.floor(Math.random() * hazillar.length)]]],
  sana: () => [["t-out", new Date().toLocaleString("uz-UZ")]],
  salom: () => [["t-ok", salomlashish() + " Saytimga xush kelibsiz!"]],
  tozalash: () => { termOutput.innerHTML = ""; return []; },
};
// Inglizcha "taxalluslar" — dasturchilar odatlanib qolgan buyruqlar
buyruqlar.help = buyruqlar.yordam;
buyruqlar.clear = buyruqlar.cls = buyruqlar.tozalash;
buyruqlar.whoami = buyruqlar.haqimda;

// Terminalga bitta qator chiqarish
function chiqar(klass, matn, htmlBormi = false) {
  const p = document.createElement("p");
  p.className = klass;
  if (htmlBormi) p.innerHTML = matn; else p.textContent = matn;
  termOutput.appendChild(p);
}

function bajar(kirish) {
  const buyruq = kirish.trim().toLowerCase();
  // Yozilgan buyruqni ko'rsatamiz
  const qator = document.createElement("p");
  qator.className = "t-cmd";
  qator.innerHTML = '<span class="t-prompt">sunnatjon@profil:~$</span> ';
  qator.append(document.createTextNode(kirish));
  termOutput.appendChild(qator);

  if (buyruq !== "") {
    tarix.push(kirish);
    tarixJoy = tarix.length;

    const funksiya = buyruqlar[buyruq];
    if (funksiya) {
      funksiya().forEach(([klass, matn, h]) => chiqar(klass, matn, h));
    } else {
      chiqar("t-err", `Bunday buyruq yo‘q: ${buyruq}`);
      chiqar("t-dim", "“yordam” deb yozib ko‘ring.");
    }
  }
  termBody.scrollTop = termBody.scrollHeight;    // pastga tushiramiz
}

// Xush kelibsiz xabari
chiqar("t-ok", "Sunnatjon terminaliga xush kelibsiz! 💻");
chiqar("t-dim", "Buyruqlar ro‘yxati uchun “yordam” deb yozing.");

termForm.addEventListener("submit", (e) => {
  e.preventDefault();
  bajar(termInput.value);
  termInput.value = "";
});

// ↑ va ↓ tugmalari bilan oldingi buyruqlarni chaqirish
termInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && tarixJoy > 0) {
    tarixJoy--;
    termInput.value = tarix[tarixJoy];
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    tarixJoy = Math.min(tarixJoy + 1, tarix.length);
    termInput.value = tarix[tarixJoy] || "";
    e.preventDefault();
  }
});

// Terminalning bo'sh joyiga bosilsa — yozish joyiga o'tadi
termBody.addEventListener("click", (e) => {
  if (e.target.tagName !== "A" && !window.getSelection().toString()) termInput.focus({ preventScroll: true });
});

// Tezkor tugmalar
document.querySelectorAll("[data-cmd]").forEach((tugma) => {
  tugma.addEventListener("click", () => bajar(tugma.dataset.cmd));
});


// ----- 10. Joriy yil -----
document.getElementById("yil").textContent = new Date().getFullYear();


// ----- 11. Kodni o'qiyotgan dasturchilar uchun yashirin xabar (F12 → Console) -----
console.log(
  "%cSalom, dasturchi! 👋\n%cKodimni ko‘ryapsizmi? Bu mening birinchi loyiham. Gmail: gulbayevsunnatjon@gmail.com",
  "font-size:18px;font-weight:bold;color:#33e0d0",
  "font-size:13px;color:#888"
);
