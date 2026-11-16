// =========================================================
// kundalik.js — o'rganish kundaligi: yozuvlarni sanash va yig'ish
// =========================================================

// ----- 1. O'rganish kundaligi: yozuvlarni sanash va "Hammasini ko'rsatish" -----
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


