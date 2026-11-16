// =========================================================
// terminal.js — interaktiv terminal va uning buyruqlari
// =========================================================

// ----- 1. INTERAKTIV TERMINAL -----
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
    ["t-out", "js/         → harakat va mantiq (miya)"],
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


