// =========================================================
// Bu fayl saytni "jonlantiradi".
// Har bir bo'lim alohida raqamlangan — o'qib chiqing!
// =========================================================

const html = document.documentElement;

// Foydalanuvchi animatsiyalarni o'chirib qo'yganmi? (qulaylik uchun)
const harakatKam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Sichqoncha bormi? (telefonda yo'q)
const sichqonchaBor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;


// Keyingi "kadr"ni chaqirish (taxminan sekundiga 60 marta)
const keyingiKadr = (fn) => setTimeout(() => fn(performance.now()), 16);


// ----- 1. Raqamlarni 0 dan sanab chiqish -----
function sana(el, oxiri, qoshimcha = "", davomiylik = 1400) {
  if (!el) return;
  if (harakatKam) { el.textContent = oxiri + qoshimcha; return; }
  const boshlanish = performance.now();

  function qadam(hozir) {
    const t = Math.min((hozir - boshlanish) / davomiylik, 1);
    const silliq = 1 - Math.pow(1 - t, 3);      // oxirida sekinlashadi
    el.textContent = Math.round(oxiri * silliq) + qoshimcha;
    if (t < 1) keyingiKadr(qadam);
  }
  keyingiKadr(qadam);
}


// ----- 2. Sahifa tayyor bo'lganda -----
// "loaded" klassi qo'shiladi va bosh qism animatsiyasi boshlanadi.
// (Yuklanish ekrani esa faylning eng oxirida — 16-bo'limda ishga tushadi.)
function saytTayyor() {
  html.classList.add("loaded");
  document.querySelectorAll(".hero [data-count]").forEach((el) => sana(el, Number(el.dataset.count)));
  ter();
}


// ----- 3. Vaqtga qarab salomlashish + yozuv terilishi -----
function salomlashish() {
  const soat = new Date().getHours();
  if (soat >= 5 && soat < 11) return "Xayrli tong! ☀️";
  if (soat >= 11 && soat < 17) return "Xayrli kun! 👋";
  if (soat >= 17 && soat < 22) return "Xayrli kech! 🌆";
  return "Xayrli tun! 🌙";
}

const sozlar = [salomlashish(), "Bo‘lajak dasturchi", "9-sinf o‘quvchisi", "HTML • CSS • JS o‘rganyapman"];
const typingEl = document.getElementById("typing");
let sozIndex = 0, harfIndex = 0, ochiryapmi = false;

function ter() {
  const soz = sozlar[sozIndex];
  typingEl.textContent = soz.slice(0, harfIndex);

  if (!ochiryapmi && harfIndex < soz.length) {
    harfIndex++;                      // harf qo'shamiz
    setTimeout(ter, 80);
  } else if (!ochiryapmi) {
    ochiryapmi = true;                // so'z tugadi — biroz kutamiz
    setTimeout(ter, 1800);
  } else if (harfIndex > 0) {
    harfIndex--;                      // harf o'chiramiz
    setTimeout(ter, 40);
  } else {
    ochiryapmi = false;               // keyingi so'zga o'tamiz
    sozIndex = (sozIndex + 1) % sozlar.length;
    setTimeout(ter, 300);
  }
}


// ----- 4. Pastga tushganda bloklar paydo bo'lishi -----
const kuzatuvchi = new IntersectionObserver((elementlar) => {
  elementlar.forEach((el) => {
    if (!el.isIntersecting) return;
    const blok = el.target;
    blok.classList.add("visible");

    // Foiz chizig'i bo'lsa — to'ldiramiz va raqamni sanaymiz
    const chiziq = blok.querySelector(".bar span");
    if (chiziq) {
      chiziq.style.width = chiziq.dataset.value + "%";
      sana(blok.querySelector(".bar__num"), Number(chiziq.dataset.value), "%");
    }
    kuzatuvchi.unobserve(blok);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach((el) => kuzatuvchi.observe(el));


// ----- 5. Sahifani aylantirganda: chiziq, menyu foni, "yuqoriga" tugmasi -----
const progress = document.getElementById("progress");
const topbar = document.getElementById("topbar");
const toTop = document.getElementById("to-top");

function aylantirganda() {
  const y = window.scrollY;
  const maks = html.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${maks > 0 ? y / maks : 0})`;
  topbar.classList.toggle("scrolled", y > 30);
  toTop.classList.toggle("show", y > 700);
}
window.addEventListener("scroll", aylantirganda, { passive: true });
aylantirganda();

toTop.addEventListener("click", () => window.scrollTo({ top: 0 }));


// ----- 5.5 Orqa fondagi bezaklar: "parallaks" (chuqurlik effekti) -----
// Har bir bezak sahifadan sekinroq harakatlanadi — go'yo ular uzoqroqda turgandek.
// Bezak ekran o'rtasidan o'tayotganda aynan o'z joyida turadi.
const bezaklar = [...document.querySelectorAll(".tb")].map((el) => ({
  el,
  tezlik: Number(el.dataset.speed || 0.1),
  aks: el.classList.contains("tb--flip") ? " scaleX(-1)" : "",
  joy: 0,
}));
let parallaksKutmoqda = false;

function joylarniOlchash() {
  bezaklar.forEach((b) => { b.joy = b.el.offsetTop + b.el.offsetHeight / 2; });
}

// Bosh qism qayerda tugashini CSS'ga aytamiz: shu balandlikkacha o'rtadagi matn zonasida bezak ko'rinmaydi
const texFon = document.querySelector(".tech-bg");
function himoyaZonasi() {
  const bosh = document.querySelector(".hero");
  texFon.style.setProperty("--hero-h", bosh.offsetTop + bosh.offsetHeight + "px");
}
himoyaZonasi();
window.addEventListener("resize", himoyaZonasi);
window.addEventListener("load", himoyaZonasi);

function parallaks() {
  const markaz = window.scrollY + window.innerHeight / 2;
  bezaklar.forEach((b) => {
    const siljish = (markaz - b.joy) * b.tezlik;
    b.el.style.transform = `translateY(${siljish.toFixed(1)}px)${b.aks}`;
  });
  parallaksKutmoqda = false;
}

if (!harakatKam) {
  const soraParallaks = () => {
    if (!parallaksKutmoqda) { parallaksKutmoqda = true; requestAnimationFrame(parallaks); }
  };
  joylarniOlchash();
  parallaks();
  window.addEventListener("scroll", soraParallaks, { passive: true });
  window.addEventListener("resize", () => { joylarniOlchash(); soraParallaks(); });
  window.addEventListener("load", () => { joylarniOlchash(); soraParallaks(); });
}


// ----- 6. Menyuda hozirgi bo'limni belgilash -----
const menyuLinklar = document.querySelectorAll(".topbar__nav a");
const bolimKuzatuvchi = new IntersectionObserver((elementlar) => {
  elementlar.forEach((el) => {
    if (!el.isIntersecting) return;
    menyuLinklar.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + el.target.id)
    );
  });
}, { rootMargin: "-45% 0px -50% 0px" });

menyuLinklar.forEach((a) => {
  const bolim = document.querySelector(a.getAttribute("href"));
  if (bolim) bolimKuzatuvchi.observe(bolim);
});


// ----- 7. Telefonda ochiladigan menyu (burger) -----
const burger = document.getElementById("burger");

function menyu(ochiq) {
  html.classList.toggle("menu-open", ochiq);
  burger.setAttribute("aria-expanded", ochiq);
  burger.setAttribute("aria-label", ochiq ? "Menyuni yopish" : "Menyuni ochish");
}
burger.addEventListener("click", () => menyu(!html.classList.contains("menu-open")));
menyuLinklar.forEach((a) => a.addEventListener("click", () => menyu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") menyu(false); });


// ----- 8. Rasm sichqonchaga qarab egiladi (3D effekt) -----
const hero = document.querySelector(".hero");
const figura = document.getElementById("hero-figure");

if (sichqonchaBor && !harakatKam) {
  hero.addEventListener("mousemove", (e) => {
    const r = figura.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;   // -0.5 … 0.5
    const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    figura.style.transform = `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`;
  });
  hero.addEventListener("mouseleave", () => { figura.style.transform = ""; });
}


// ----- 9. Sichqoncha ortidan yuruvchi halqa va kartochkadagi nur -----
if (sichqonchaBor && !harakatKam) {
  const halqa = document.getElementById("cursor-ring");
  let mx = -100, my = -100, hx = -100, hy = -100;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    document.body.classList.add("has-cursor");
  });
  document.addEventListener("mouseleave", () => document.body.classList.remove("has-cursor"));

  (function yurgiz() {
    hx += (mx - hx) * 0.18;           // halqa sichqonchaga sekin "yetib oladi"
    hy += (my - hy) * 0.18;
    halqa.style.transform = `translate(${hx}px, ${hy}px)`;
    requestAnimationFrame(yurgiz);
  })();

  document.querySelectorAll("a, button, .card, .tool, input, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => halqa.classList.add("hover"));
    el.addEventListener("mouseleave", () => halqa.classList.remove("hover"));
  });

  document.querySelectorAll(".card").forEach((karta) => {
    karta.addEventListener("mousemove", (e) => {
      const r = karta.getBoundingClientRect();
      karta.style.setProperty("--mx", e.clientX - r.left + "px");
      karta.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
}


// ----- 10. Xabar oynachasi (toast) -----
const toast = document.getElementById("toast");
let toastTaymer;
function xabar(matn) {
  toast.textContent = matn;
  toast.classList.add("show");
  clearTimeout(toastTaymer);
  toastTaymer = setTimeout(() => toast.classList.remove("show"), 2400);
}


// ----- 11. Email va telefonni nusxalash -----
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


// ----- 12. Xabar yozish shakli → Gmail -----
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


// ----- 13. QR kodlarni chizish -----
document.querySelectorAll("[data-qr]").forEach((joy) => {
  if (typeof QRCode === "undefined") return; // internet bo'lmasa — o'tkazib yuboramiz
  new QRCode(joy, {
    text: joy.dataset.qr,
    width: 200,
    height: 200,
    colorDark: "#0b1428",
    colorLight: "#e8f0ff",
    correctLevel: QRCode.CorrectLevel.M,
  });
});


// ----- 14. INTERAKTIV TERMINAL -----
const termBody = document.getElementById("term-body");
const termOutput = document.getElementById("term-output");
const termForm = document.getElementById("term-form");
const termInput = document.getElementById("term-input");
const tarix = [];        // oldin yozilgan buyruqlar
let tarixJoy = 0;

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
    ["t-out", "  qiziqishlar  — nimalarga qiziqaman"],
    ["t-out", "  yol          — dasturchi bo‘lish yo‘lim"],
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
  qiziqishlar: () =>
    [["Futbol", 100], ["Dasturlash", 99], ["Mashina", 70], ["Fizika", 60], ["Musiqa", 50]].map(([nom, foiz]) => {
      const toliq = Math.round(foiz / 10);   // 99% → 10 ta katak (yaxlitlaymiz, aks holda qator qisqarib qoladi)
      return ["t-out", nom.padEnd(12) + "█".repeat(toliq) + "░".repeat(10 - toliq) + " " + foiz + "%"];
    }),
  yol: () => [
    ["t-ok", "✔ 01 HTML"],
    ["t-ok", "✔ 02 CSS"],
    ["t-err", "▶ 03 JavaScript  ← hozir shu yerdaman"],
    ["t-dim", "○ 04 Loyihalar"],
    ["t-dim", "○ 05 Dasturchi 🚀"],
  ],
  aloqa: () => [
    ["t-out", 'Gmail:    <a href="mailto:gulbayevsunnatjon@gmail.com">gulbayevsunnatjon@gmail.com</a>', true],
    ["t-out", 'Telefon:  <a href="tel:[telefon olib tashlandi]">[telefon olib tashlandi]</a>', true],
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


// ----- 15. Joriy yil -----
document.getElementById("yil").textContent = new Date().getFullYear();


// ----- 16. Yuklanish ekrani -----
// Muhim: bu qism eng oxirida turadi, chunki u yuqoridagi hamma narsadan foydalanadi.
// (JavaScript'da o'zgaruvchini e'lon qilinishidan OLDIN ishlatib bo'lmaydi!)
(function yuklash() {
  let korilgan = false;
  try { korilgan = sessionStorage.getItem("loader") === "1"; } catch (e) {}

  if (harakatKam || korilgan) { saytTayyor(); return; }   // ikkinchi marta ko'rsatmaymiz

  const son = document.getElementById("loader-count");
  const chiziq = document.getElementById("loader-bar");
  const davomiylik = 1200;
  const boshlanish = performance.now();

  function qadam(hozir) {
    const t = Math.min((hozir - boshlanish) / davomiylik, 1);
    const foiz = Math.round((1 - Math.pow(1 - t, 2)) * 100);
    son.textContent = foiz;
    chiziq.style.width = foiz + "%";
    if (t < 1) keyingiKadr(qadam);
    else {
      try { sessionStorage.setItem("loader", "1"); } catch (e) {}
      setTimeout(saytTayyor, 150);
    }
  }
  keyingiKadr(qadam);
})();


// ----- 17. Kodni o'qiyotgan dasturchilar uchun yashirin xabar (F12 → Console) -----
console.log(
  "%cSalom, dasturchi! 👋\n%cKodimni ko‘ryapsizmi? Bu mening birinchi loyiham. Gmail: gulbayevsunnatjon@gmail.com",
  "font-size:18px;font-weight:bold;color:#4f9dff",
  "font-size:13px;color:#e8f0ff"
);
