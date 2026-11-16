// =========================================================
// lab-nur.js — 03-tajriba: yorug'likning sinishi (Snellius qonuni)
// =========================================================
//
//   n₁ · sin θ₁ = n₂ · sin θ₂
// n — muhitning sindirish ko'rsatkichi: yorug'lik u yerda vakuumdagidan necha marta sekin yuradi.
// Agar n₁ > n₂ bo'lsa va burchak "kritik"dan katta bo'lsa — nur umuman o'tmaydi,
// to'liq orqaga qaytadi: TO'LIQ ICHKI QAYTISH. Optik tolalar (internet kabeli) shu hodisada ishlaydi.
(() => {
  const muhitlar = {
    havo:   { nom: "Havo",   n: 1.00 },
    suv:    { nom: "Suv",    n: 1.33 },
    shisha: { nom: "Shisha", n: 1.50 },
    olmos:  { nom: "Olmos",  n: 2.42 },
  };

  const canvas = document.getElementById("n-canvas");
  const ctx = canvas.getContext("2d");
  const burchakInput = document.getElementById("n-burchak");
  const xabarEl = document.getElementById("n-msg");
  const vazifaEl = document.getElementById("n-vazifa");
  const ballEl = document.getElementById("n-ball");
  const natija = {
    sinish: document.getElementById("n-sinish"),
    kritik: document.getElementById("n-kritik"),
    nisbat: document.getElementById("n-nisbat"),
  };
  const gradus = (r) => (r * 180) / Math.PI;
  const radian = (g) => (g * Math.PI) / 180;

  // Vazifalar navbat bilan beriladi; har biri bajarilganda qiziq fakt chiqadi
  const vazifalar = [
    {
      matn: "Nurni suvga 30° burchak ostida sindiring (θ₂ = 30°)",
      tekshir: (h) => h.m2 === "suv" && !h.toliq && Math.abs(h.theta2 - 30) <= 1,
      fakt: "Suvda nur normalga yaqinlashadi — shuning uchun hovuz tubi aslidan sayozroq ko‘rinadi.",
    },
    {
      matn: "Havodan olmosga 60° burchak ostida nur yuboring",
      tekshir: (h) => h.m1 === "havo" && h.m2 === "olmos" && h.theta1 === 60,
      fakt: "Olmos nurni juda kuchli sindiradi (n = 2.42) — u shuning uchun shunchalik yaltiraydi.",
    },
    {
      matn: "Shishadan havoga: nur chegara bo‘ylab sirpanib o‘tsin (θ₂ ≥ 75°)",
      tekshir: (h) => h.m1 === "shisha" && h.m2 === "havo" && !h.toliq && h.theta2 >= 75,
      fakt: "Siz kritik burchakka juda yaqinsiz — yana 1° qo‘shsangiz, nur umuman chiqmay qoladi!",
    },
    {
      matn: "To‘liq ichki qaytishni hosil qiling — nur pastga umuman o‘tmasin",
      tekshir: (h) => h.toliq,
      fakt: "Optik tolada (internet kabelida) yorug‘lik aynan shunday ichida «qamalib», kilometrlab yuradi.",
    },
  ];
  let vazifaRaqami = 0, ball = 0, bajarildi = false;

  const tanlangan = (nom) => document.querySelector(`input[name="${nom}"]:checked`).value;

  // --- Fizika ---
  function hisobla() {
    const m1 = tanlangan("n-muhit1"), m2 = tanlangan("n-muhit2");
    const n1 = muhitlar[m1].n, n2 = muhitlar[m2].n;
    const theta1 = Number(burchakInput.value);
    const sinus = (n1 / n2) * Math.sin(radian(theta1));
    const toliq = sinus > 1;                                   // sin 1 dan katta bo'lolmaydi → nur o'tmaydi
    return {
      m1, m2, n1, n2, theta1, toliq,
      theta2: toliq ? null : gradus(Math.asin(sinus)),
      kritik: n1 > n2 ? gradus(Math.asin(n2 / n1)) : null,     // faqat zichroq muhitdan chiqishda bor
    };
  }

  // --- Chizish ---
  let olcham = { w: 0, h: 0 };

  // "#33e0d0" → "rgba(51, 224, 208, a)"
  function shaffof(hex, a) {
    const s = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function nur(x1, y1, x2, y2, rang, qalinlik, uzuq = false) {
    ctx.strokeStyle = rang;
    ctx.lineWidth = qalinlik;
    ctx.setLineDash(uzuq ? [6, 5] : []);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    // yo'nalish o'qi — chiziq o'rtasida
    const ox = (x1 + x2) / 2, oy = (y1 + y2) / 2, b = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = rang;
    ctx.beginPath();
    ctx.moveTo(ox + Math.cos(b) * 7, oy + Math.sin(b) * 7);
    ctx.lineTo(ox + Math.cos(b + 2.5) * 7, oy + Math.sin(b + 2.5) * 7);
    ctx.lineTo(ox + Math.cos(b - 2.5) * 7, oy + Math.sin(b - 2.5) * 7);
    ctx.fill();
  }

  function burchakBelgisi(cx, cy, r, bosh, oxir, matn, mx, my) {
    ctx.strokeStyle = ranglar.ink;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, bosh, oxir); ctx.stroke();
    ctx.fillStyle = ranglar.ink;
    ctx.fillText(matn, mx, my);
  }

  function chiz() {
    if (!olcham.w) return;
    const { w, h } = olcham;
    const hol = hisobla();
    const cx = w / 2, cy = h / 2, R = Math.min(w * 0.42, h * 0.46);
    ctx.clearRect(0, 0, w, h);
    ctx.font = "11px 'JetBrains Mono', monospace";

    // Ikki muhit: zichroq muhit to'qroq bo'yaladi
    ctx.fillStyle = shaffof(ranglar.cyan, (hol.n1 - 1) * 0.16);
    ctx.fillRect(0, 0, w, cy);
    ctx.fillStyle = shaffof(ranglar.cyan, (hol.n2 - 1) * 0.16);
    ctx.fillRect(0, cy, w, h - cy);
    ctx.strokeStyle = ranglar.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    ctx.fillStyle = ranglar.muted;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${muhitlar[hol.m1].nom.toUpperCase()} · n = ${hol.n1.toFixed(2)}`, 12, 12);
    ctx.textBaseline = "bottom";
    ctx.fillText(`${muhitlar[hol.m2].nom.toUpperCase()} · n = ${hol.n2.toFixed(2)}`, 12, h - 10);

    // Normal — chegaraga tik chiziq
    nur(cx, cy - R - 6, cx, cy + R + 6, ranglar.rule, 1, true);

    const t1 = radian(hol.theta1);
    const manba = { x: cx - Math.sin(t1) * R, y: cy - Math.cos(t1) * R };

    // Qaytgan nur: to'liq qaytishda — kuchli, aks holda — xira (yorug'likning oz qismi doim qaytadi)
    nur(cx, cy, cx + Math.sin(t1) * R, cy - Math.cos(t1) * R,
        hol.toliq ? ranglar.ink : ranglar.grey, hol.toliq ? 2.5 : 1, !hol.toliq);
    // Tushayotgan nur
    nur(manba.x, manba.y, cx, cy, ranglar.ink, 2.5);
    // Singan nur
    if (!hol.toliq) {
      const t2 = radian(hol.theta2);
      nur(cx, cy, cx + Math.sin(t2) * R, cy + Math.cos(t2) * R, ranglar.ink, 2.5);
      // Yozuv normalning chap tomonida — u yer doim bo'sh (singan nur o'ngga ketadi)
      ctx.textAlign = "right"; ctx.textBaseline = "top";
      burchakBelgisi(cx, cy, 44, Math.PI / 2 - t2, Math.PI / 2, `θ₂ ${hol.theta2.toFixed(1)}°`, cx - 10, cy + 30);
    } else {
      ctx.fillStyle = ranglar.ink;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("TO‘LIQ ICHKI QAYTISH — nur pastga o‘tmaydi", cx, cy + (h - cy) / 2);
    }
    // θ₁ yozuvi tushayotgan nurdan biroz chaproqda (nur bilan ustma-ust tushmasin)
    const yozuvB = -Math.PI / 2 - Math.min(t1 + 0.35, 1.4);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    burchakBelgisi(cx, cy, 44, -Math.PI / 2 - t1, -Math.PI / 2, `θ₁ ${hol.theta1}°`,
      cx + Math.cos(yozuvB) * 62, cy + Math.sin(yozuvB) * 62);

    // Nur manbai (sudrab bo'ladi)
    ctx.beginPath(); ctx.arc(manba.x, manba.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = ranglar.field; ctx.fill();
    ctx.strokeStyle = ranglar.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(manba.x, manba.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = ranglar.cyan; ctx.fill();
  }

  // --- Natijalar va vazifa ---
  function yangila() {
    const hol = hisobla();
    document.getElementById("n-out-burchak").textContent = hol.theta1 + "°";
    burchakInput.setAttribute("aria-valuetext", hol.theta1 + " gradus");
    natija.sinish.textContent = hol.toliq ? "—" : hol.theta2.toFixed(1) + "°";
    natija.kritik.textContent = hol.kritik === null ? "yo‘q" : hol.kritik.toFixed(1) + "°";
    natija.nisbat.textContent = (hol.n2 / hol.n1).toFixed(2);
    canvas.setAttribute("aria-label", hol.toliq
      ? `Nur ${hol.theta1} gradusda tushib, to‘liq orqaga qaytmoqda`
      : `Nur ${hol.theta1} gradusda tushib, ${hol.theta2.toFixed(1)} gradusga sinmoqda`);
    chiz();

    const v = vazifalar[vazifaRaqami];
    if (!bajarildi && v.tekshir(hol)) {
      bajarildi = true;
      ball++;
      ballEl.textContent = "Bajarildi: " + ball;
      xabarEl.textContent = "🎯 Barakalla! " + v.fakt;
      setTimeout(keyingiVazifa, 2600);
    }
  }

  function keyingiVazifa() {
    vazifaRaqami = (vazifaRaqami + 1) % vazifalar.length;
    bajarildi = false;
    vazifaEl.textContent = vazifalar[vazifaRaqami].matn;
    if (vazifaRaqami === 0) xabarEl.textContent = "🎉 Barcha vazifalar bajarildi! Yana bir aylanib chiqamiz.";
  }

  // --- Boshqaruv: surgich, muhitlar va nur manbaini sudrash ---
  burchakInput.addEventListener("input", yangila);
  document.querySelectorAll('input[name="n-muhit1"], input[name="n-muhit2"]').forEach((t) => t.addEventListener("change", yangila));

  let sudralmoqda = false;
  function sudrash(e) {
    const quti = canvas.getBoundingClientRect();
    const dx = e.clientX - quti.left - quti.width / 2;
    const dy = quti.height / 2 - (e.clientY - quti.top);        // yuqoriga musbat
    if (dy <= 0) return;                                        // manba faqat yuqori muhitda
    burchakInput.value = Math.min(89, Math.round(gradus(Math.atan2(Math.abs(dx), dy))));
    yangila();
  }
  canvas.addEventListener("pointerdown", (e) => { sudralmoqda = true; canvas.setPointerCapture(e.pointerId); sudrash(e); });
  canvas.addEventListener("pointermove", (e) => { if (sudralmoqda) sudrash(e); });
  canvas.addEventListener("pointerup", () => { sudralmoqda = false; });
  canvas.addEventListener("pointercancel", () => { sudralmoqda = false; });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => requestAnimationFrame(chiz));

  new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    const quti = canvas.getBoundingClientRect();
    olcham = { w: quti.width, h: quti.height };
    canvas.width = Math.round(quti.width * dpr);
    canvas.height = Math.round(quti.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    chiz();
  }).observe(canvas);

  vazifaEl.textContent = vazifalar[0].matn;
  yangila();
})();
