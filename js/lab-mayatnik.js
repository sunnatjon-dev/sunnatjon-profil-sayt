// =========================================================
// lab-mayatnik.js — 02-tajriba: matematik mayatnik
// =========================================================
//
// Maktab formulasi (faqat KICHIK burchaklar uchun aniq):   T = 2π · √(L / g)
// Biz esa mayatnikni haqiqiy harakat tenglamasi bilan hisoblaymiz:
//   θ'' = −(g / L) · sin θ
// Bu tenglamani har 1/600 soniyada RK4 (Runge–Kutta) usuli bilan qadam-baqadam yechamiz.
// Shuning uchun katta burchakda "o'lchangan" davr formuladan uzunroq chiqadi — bu xato emas, haqiqiy fizika!
//
// Hamma narsa (...)() ichida — boshqa fayllardagi nomlar bilan aralashib ketmasligi uchun.
(() => {
  const canvas = document.getElementById("m-canvas");
  const ctx = canvas.getContext("2d");
  const uzunlikInput = document.getElementById("m-uzunlik");
  const burchakInput = document.getElementById("m-burchak");
  const startTugma = document.getElementById("m-start");
  const xabarEl = document.getElementById("m-msg");
  const izohEl = document.getElementById("m-izoh");
  const vazifaEl = document.getElementById("m-vazifa");
  const ballEl = document.getElementById("m-ball");
  const natija = {
    formula: document.getElementById("m-formula"),
    olchangan: document.getElementById("m-olchangan"),
    tezlik: document.getElementById("m-tezlik"),
  };

  const DT = 1 / 600;               // hisoblash qadami, soniya
  const MAKS_L = 2.5;               // eng uzun ip, m
  const ANIQLIK = 0.05;             // vazifa uchun ruxsat etilgan farq, s
  const gradus = (r) => (r * 180) / Math.PI;
  const radian = (g) => (g * Math.PI) / 180;

  const m = {
    g: sayyoralar.yer,              // sayyoralar — lab.js faylidan (Yer, Mars, Oy)
    L: 1, theta0: radian(20),
    theta: radian(20), omega: 0, t: 0,
    yuryapti: false,
    oxirgiChekka: 0,                // mayatnik oxirgi marta chekkaga qachon yetdi
    olchanganT: null,
    maqsadT: 2, ball: 0,
  };

  const formulaT = () => 2 * Math.PI * Math.sqrt(m.L / m.g);
  const maksTezlik = () => Math.sqrt(2 * m.g * m.L * (1 - Math.cos(m.theta0)));

  // --- Fizika: bitta RK4 qadami ---
  function tezlanish(theta) {
    return -(m.g / m.L) * Math.sin(theta);
  }
  // olcha = false bo'lsa, faqat hisoblaydi (davrni ekranga chiqarmaydi)
  function qadam(olcha = true) {
    const { theta: th, omega: om } = m;
    const k1t = om,                     k1o = tezlanish(th);
    const k2t = om + (k1o * DT) / 2,    k2o = tezlanish(th + (k1t * DT) / 2);
    const k3t = om + (k2o * DT) / 2,    k3o = tezlanish(th + (k2t * DT) / 2);
    const k4t = om + k3o * DT,          k4o = tezlanish(th + k3t * DT);
    m.theta = th + (DT / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
    m.omega = om + (DT / 6) * (k1o + 2 * k2o + 2 * k3o + k4o);
    m.t += DT;

    // Davrni o'lchash: mayatnik o'ng chekkaga qaytib kelganda (tezlik + dan − ga o'tadi)
    if (om > 0 && m.omega <= 0 && m.theta > 0) {
      const aniqVaqt = m.t - DT + (DT * om) / (om - m.omega);   // ikki qadam orasida aniqlashtiramiz
      if (olcha && m.olchanganT === null) olchandi(aniqVaqt - m.oxirgiChekka);
      m.oxirgiChekka = aniqVaqt;
    }
  }

  // Animatsiyasiz rejim uchun: davrni darhol, ekranda ko'rsatmasdan hisoblaymiz
  function davrniHisobla() {
    const saqlangan = { ...m };
    m.theta = m.theta0; m.omega = 0; m.t = 0; m.oxirgiChekka = 0;
    while (m.oxirgiChekka === 0 && m.t < 60) qadam(false);   // birinchi marta o'ng chekkaga qaytguncha
    const T = m.oxirgiChekka;
    Object.assign(m, saqlangan);
    return T;
  }

  // --- Davr o'lchandi ---
  function olchandi(T) {
    m.olchanganT = T;
    natija.olchangan.textContent = T.toFixed(2);

    // Katta burchakda formula bilan farqni tushuntiramiz
    const farq = ((T / formulaT() - 1) * 100);
    izohEl.innerHTML = farq >= 1
      ? `O‘lchangan davr formuladan <b>${farq.toFixed(1)}% uzun</b>. Maktab formulasi faqat kichik burchaklar (≈15° gacha) uchun aniq — katta burchakda mayatnik sekinroq tebranadi.`
      : `O‘lchangan davr formulaga juda yaqin (farq ${Math.abs(farq).toFixed(1)}%) — kichik burchakda formula aniq ishlaydi.`;

    if (Math.abs(T - m.maqsadT) <= ANIQLIK) {
      m.ball++;
      ballEl.textContent = "Bajarildi: " + m.ball;
      xabarEl.textContent = `🎯 Topdingiz! Davr ${T.toFixed(2)} s. Keyingi vazifa tayyor.`;
      setTimeout(yangiVazifa, 1600);
    } else {
      xabarEl.textContent = `Davr ${T.toFixed(2)} s — maqsaddan ${T > m.maqsadT ? "uzun" : "qisqa"}. ${T > m.maqsadT ? "Ipni qisqartiring" : "Ipni uzaytiring"}.`;
    }
  }

  // Vazifa: shu sayyorada erishsa bo'ladigan davrni tanlaymiz
  function yangiVazifa() {
    const eng = (L) => 2 * Math.PI * Math.sqrt(L / m.g);
    const quyi = Math.ceil(eng(0.3) * 1.05 * 10) / 10;
    const yuqori = Math.floor(eng(MAKS_L) * 0.95 * 10) / 10;
    let yangi;
    do { yangi = Math.round((quyi + Math.random() * (yuqori - quyi)) * 10) / 10; } while (yangi === m.maqsadT);
    m.maqsadT = yangi;
    vazifaEl.textContent = `Davrni ${m.maqsadT.toFixed(1)} s qiling`;
  }

  // --- Chizish ---
  let olcham = { w: 0, h: 0 };
  function chiz() {
    if (!olcham.w) return;
    const { w, h } = olcham;
    const k = (h - 52) / (MAKS_L + 0.12);                  // 1 metr necha piksel
    const ox = w / 2, oy = 22;                             // osilish nuqtasi
    const r = m.L * k;
    ctx.clearRect(0, 0, w, h);
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.setLineDash([]);

    // Shift (ip osilgan joy)
    ctx.strokeStyle = ranglar.ink;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox - 46, oy); ctx.lineTo(ox + 46, oy); ctx.stroke();
    ctx.lineWidth = 1;
    for (let x = -42; x <= 42; x += 8) { ctx.beginPath(); ctx.moveTo(ox + x, oy); ctx.lineTo(ox + x - 6, oy - 6); ctx.stroke(); }

    // Muvozanat chizig'i va tebranish yoyi
    ctx.strokeStyle = ranglar.rule;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + r + 18); ctx.stroke();
    ctx.strokeStyle = ranglar.grey;
    ctx.beginPath(); ctx.arc(ox, oy, r, Math.PI / 2 - m.theta0, Math.PI / 2 + m.theta0); ctx.stroke();
    ctx.setLineDash([]);

    // Boshlang'ich burchak belgisi
    ctx.strokeStyle = ranglar.ink;
    ctx.beginPath(); ctx.arc(ox, oy, 30, Math.PI / 2 - m.theta0, Math.PI / 2); ctx.stroke();
    ctx.fillStyle = ranglar.ink;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText("θ₀ " + Math.round(gradus(m.theta0)) + "°", ox + 36, oy + 30);

    // Ip va yuk
    const bx = ox + Math.sin(m.theta) * r, by = oy + Math.cos(m.theta) * r;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, 11, 0, Math.PI * 2);
    ctx.fillStyle = ranglar.cyan; ctx.fill();
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fillStyle = ranglar.ink; ctx.fill();

    // Ma'lumot yozuvlari
    ctx.fillStyle = ranglar.muted;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`t = ${m.t.toFixed(2)} s`, 12, 12);
    ctx.fillText(`L = ${m.L.toFixed(2)} m`, 12, 28);
    ctx.textAlign = "right";
    ctx.fillText(`g = ${m.g} m/s²`, w - 12, 12);
  }

  // --- Animatsiya ---
  let oldingiVaqt = 0;
  function kadr(hozir) {
    if (!m.yuryapti) return;
    const otdi = Math.min((hozir - oldingiVaqt) / 1000, 0.05);   // tab yashirilsa — sakrab ketmasin
    oldingiVaqt = hozir;
    for (let i = 0; i < Math.round(otdi / DT); i++) qadam();
    chiz();
    requestAnimationFrame(kadr);
  }

  function boshlash() {
    if (harakatKam) {                                    // animatsiyasiz: natijani darhol beramiz
      qaytaQoy();
      olchandi(davrniHisobla());
      return;
    }
    m.yuryapti = !m.yuryapti;
    startTugma.firstChild.textContent = m.yuryapti ? "To‘xtatish " : "Davom ettirish ";
    if (m.yuryapti) { oldingiVaqt = performance.now(); requestAnimationFrame(kadr); }
  }

  function qaytaQoy() {
    m.yuryapti = false;
    m.theta = m.theta0; m.omega = 0; m.t = 0;
    m.oxirgiChekka = 0; m.olchanganT = null;
    natija.olchangan.textContent = "—";
    startTugma.firstChild.textContent = "Qo‘yib yuborish ";
    chiz();
  }

  function sozlamalar() {
    m.L = Number(uzunlikInput.value);
    m.theta0 = radian(Number(burchakInput.value));
    document.getElementById("m-out-uzunlik").textContent = m.L.toFixed(2) + " m";
    document.getElementById("m-out-burchak").textContent = burchakInput.value + "°";
    uzunlikInput.setAttribute("aria-valuetext", m.L.toFixed(2) + " metr");
    burchakInput.setAttribute("aria-valuetext", burchakInput.value + " gradus");
    natija.formula.textContent = formulaT().toFixed(2);
    natija.tezlik.textContent = maksTezlik().toFixed(1);
    xabarEl.textContent = "";
    qaytaQoy();
  }

  // --- Boshqaruv ---
  uzunlikInput.addEventListener("input", sozlamalar);
  burchakInput.addEventListener("input", sozlamalar);
  document.querySelectorAll('input[name="m-sayyora"]').forEach((tanlov) =>
    tanlov.addEventListener("change", () => {
      m.g = sayyoralar[tanlov.value];
      sozlamalar();
      yangiVazifa();
      xabarEl.textContent = `g = ${m.g} m/s² — mayatnik endi boshqacha tebranadi!`;
    })
  );
  document.getElementById("m-form").addEventListener("submit", (e) => { e.preventDefault(); boshlash(); });
  document.getElementById("m-qayta").addEventListener("click", () => { xabarEl.textContent = ""; qaytaQoy(); });

  // Boshqa tajribaga o'tilsa — mayatnikni to'xtatamiz (batareya tejaladi)
  document.addEventListener("lab:tab", (e) => {
    if (e.detail !== "exp-mayatnik" && m.yuryapti) boshlash();
  });

  // Qorong'i/yorug' rejim almashsa — qayta chizamiz (ranglar lab.js da yangilanadi)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => requestAnimationFrame(chiz));

  // Canvas o'lchami (yashirin tabda 0 bo'ladi — ko'ringanda qayta o'lchanadi)
  new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    const quti = canvas.getBoundingClientRect();
    olcham = { w: quti.width, h: quti.height };
    canvas.width = Math.round(quti.width * dpr);
    canvas.height = Math.round(quti.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    chiz();
  }).observe(canvas);

  sozlamalar();
  yangiVazifa();
})();
