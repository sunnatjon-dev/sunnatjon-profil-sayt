// =========================================================
// lab-tablar.js — laboratoriyadagi 3 ta tajribani almashtiruvchi tablar
// =========================================================
// Qulaylik (WAI-ARIA "Tabs" namunasi): sichqoncha bilan bosish, klaviaturada ← → Home End.
(() => {
  const tablar = [...document.querySelectorAll('.lab__tabs [role="tab"]')];

  function tanla(tab, fokus = false) {
    tablar.forEach((t) => {
      const tanlandi = t === tab;
      t.setAttribute("aria-selected", String(tanlandi));
      t.tabIndex = tanlandi ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !tanlandi;
    });
    if (fokus) tab.focus();
    // Boshqa tajribalarga xabar beramiz (masalan, mayatnik yashirinsa — to'xtaydi)
    document.dispatchEvent(new CustomEvent("lab:tab", { detail: tab.getAttribute("aria-controls") }));
  }

  tablar.forEach((tab, i) => {
    tab.addEventListener("click", () => tanla(tab));
    tab.addEventListener("keydown", (e) => {
      const keyingi = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tablar.length - 1 }[e.key];
      if (keyingi === undefined) return;
      e.preventDefault();
      tanla(tablar[(keyingi + tablar.length) % tablar.length], true);
    });
  });
})();
