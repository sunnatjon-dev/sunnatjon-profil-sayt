// =========================================================
// lab.js — Fizika laboratoriyasi: to'p otish simulyatsiyasi
// =========================================================

// ----- 1. FIZIKA LABORATORIYASI: to'p otish -----
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
const ranglar = {};
function ranglarniOl() {
  ["ink", "muted", "rule", "grey", "cyan", "field"].forEach((nom) => (ranglar[nom] = css("--" + nom)));
}
ranglarniOl();
// Qorong'i/yorug' rejim almashsa — grafik ranglarini yangilab, qayta chizamiz
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  ranglarniOl();
  chiz();
});

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
  ctx.font = "11px 'JetBrains Mono', monospace";
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

  // 2) Yer sathi — qalin qora chiziq
  ctx.strokeStyle = ranglar.ink;
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
  // Ekran o'quvchi dasturlar raqamni so'z bilan o'qisin
  burchakInput.setAttribute("aria-valuetext", burchakInput.value + " gradus");
  tezlikInput.setAttribute("aria-valuetext", tezlikInput.value + " metr sekundiga");
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


