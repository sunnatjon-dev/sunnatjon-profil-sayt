// =========================================================
// github.js — GitHub'dan haqiqiy raqamlar (commitlar, repolar, oxirgi faollik)
// =========================================================

// ----- 1. GitHub'dan HAQIQIY raqamlar -----
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


