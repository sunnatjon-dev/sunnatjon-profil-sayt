// =========================================================
// asosiy.js — umumiy qismlar: bezaklar, paydo bo'lish, nusxalash, xabar shakli. Boshqa fayllardan OLDIN yuklanadi.
// =========================================================


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


// ----- 3. Xabar oynachasi (toast) -----
const toast = document.getElementById("toast");
let toastTaymer;
function xabar(matn) {
  toast.textContent = matn;
  toast.classList.add("show");
  clearTimeout(toastTaymer);
  toastTaymer = setTimeout(() => toast.classList.remove("show"), 2400);
}


// ----- 4. Email va Telegram manzilini nusxalash -----
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


// ----- 5. Xabar yozish shakli → Telegram -----
// Telegram'ning rasmiy havolasi: t.me/<username>?text=... — chat tayyor matn bilan ochiladi,
// mehmon faqat "Yuborish"ni bosadi. Bot tokeni kerak emas, shuning uchun xavfsiz.
// (Hujjat: https://core.telegram.org/api/links)
const TELEGRAM = "sunnatjon_dev";

document.getElementById("xabar-form").addEventListener("submit", (e) => {
  e.preventDefault();                 // sahifa yangilanib ketmasin
  const forma = e.target;
  const ism = forma.ism.value.trim();
  const matn = forma.xabar.value.trim();
  if (!ism || !matn) { xabar("✍️ Iltimos, ism va xabarni yozing"); return; }

  const tayyorXabar = `Salom! Men ${ism}. Saytingizdan yozyapman:\n\n${matn}`;
  window.open(`https://t.me/${TELEGRAM}?text=${encodeURIComponent(tayyorXabar)}`, "_blank", "noopener");
  xabar("✈️ Telegram ochilmoqda…");
  forma.reset();
});


// ----- 6. Joriy yil -----
document.getElementById("yil").textContent = new Date().getFullYear();


// ----- 7. Kodni o'qiyotgan dasturchilar uchun yashirin xabar (F12 → Console) -----
console.log(
  "%cSalom, dasturchi! 👋\n%cKodimni ko‘ryapsizmi? Bu mening birinchi loyiham. Gmail: gulbayevsunnatjon@gmail.com",
  "font-size:18px;font-weight:bold;color:#33e0d0",
  "font-size:13px;color:#888"
);
