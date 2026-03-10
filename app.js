// app.js
import { THEMES, STATEMENTS, PARTIES, PARTY_STANDPOINTS } from "./data.js?v=7";

const ANSWER_LABELS = {
  1: "Eens",
  0: "Neutraal",
  "-1": "Oneens"
};

const state = {
  userAnswers: {},     // s1..s5 => 1/0/-1 (null = nog niet gekozen)
  themeWeights: {},    // themeId => 1..5
  selectedStandpuntPartyId: null,
  demographics: {
    gender: "",       // man | vrouw | anders
    age: "",          // string (we valideren naar number)
    postcode: ""      // 1234AB
  }
};

// ===== Google Sheets logging =====
// Plak hier je Google Apps Script Web App URL.
// Laat leeg om logging uit te zetten.
const SHEETS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxYWDY76endvUjhOFRfCpIiHHwu0cybBKvu-NU9ZdeIJQyqKUx160i-YYn4DcPIJAuPLw/exec";

function $(sel) {
  return document.querySelector(sel);
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function themeLabel(themeId) {
  return THEMES.find(t => t.id === themeId)?.label ?? themeId;
}

function initDefaults() {
  THEMES.forEach(t => state.themeWeights[t.id] = 3);
  STATEMENTS.forEach(s => state.userAnswers[s.id] = null);
}

/* ===== slider vulling (1..5) ===== */
function updateRangeFill(rangeEl) {
  const min = Number(rangeEl.min || 1);
  const max = Number(rangeEl.max || 5);
  const val = Number(rangeEl.value || 3);
  const pct = ((val - min) / (max - min)) * 100;
  rangeEl.style.setProperty("--fill", pct + "%");
}

function renderThemes() {
  const wrap = $("#themes");
  if (!wrap) return;
  wrap.innerHTML = "";

  THEMES.forEach(theme => {
    const div = document.createElement("div");
    div.className = "theme";

    div.innerHTML = `
      <div class="theme-row">
        <div>
          <div class="theme-title">${escapeHtml(theme.label)}</div>
          <div class="theme-sub">Weging: <span id="w_${theme.id}">${state.themeWeights[theme.id]}</span> (1 = laag, 5 = hoog)</div>
        </div>
        <input type="range" min="1" max="5" step="1" value="${state.themeWeights[theme.id]}" data-theme="${theme.id}">
      </div>
    `;

    wrap.appendChild(div);
  });

  wrap.querySelectorAll('input[type="range"]').forEach(r => {
    updateRangeFill(r);

    r.addEventListener("input", (e) => {
      const id = e.target.dataset.theme;
      state.themeWeights[id] = parseInt(e.target.value, 10);

      const label = $(`#w_${id}`);
      if (label) label.textContent = String(state.themeWeights[id]);

      updateRangeFill(e.target);
    });
  });
}

function renderStatements() {
  const wrap = $("#statements");
  if (!wrap) return;
  wrap.innerHTML = "";

  STATEMENTS.forEach((st, idx) => {
    const div = document.createElement("div");
    div.className = "card";

    const current = state.userAnswers[st.id];

    div.innerHTML = `
      <div class="card-top">
        <div class="nr">${idx + 1}</div>
        <div class="st">
          <div class="st-text">${escapeHtml(st.text)}</div>
          <div class="st-meta">Thema: ${escapeHtml(themeLabel(st.themeId))}</div>
        </div>
      </div>

      ${renderStatementUitleg(st)}

      <div class="answers" role="radiogroup" aria-label="Antwoord opties">
        ${renderAnswerBtn(st.id, 1, current)}
        ${renderAnswerBtn(st.id, 0, current)}
        ${renderAnswerBtn(st.id, -1, current)}
      </div>

      <details class="party-details">
        <summary class="party-btn">Toelichtingen partijen</summary>
        ${renderPartyPositionsForStatement(st.id)}
      </details>
    `;

    wrap.appendChild(div);
  });

  wrap.querySelectorAll("button[data-statement]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const stId = e.currentTarget.dataset.statement;
      const val = parseInt(e.currentTarget.dataset.value, 10);
      state.userAnswers[stId] = val;
      renderStatements();
      updateProgress();
    });
  });
}

function renderAnswerBtn(statementId, value, current) {
  const active = current === value ? "active" : "";
  return `<button class="ans ${active}" type="button" data-statement="${statementId}" data-value="${value}">
    ${ANSWER_LABELS[value]}
  </button>`;
}

function renderPartyPositionsForStatement(statementId) {
  const rows = PARTIES.map(p => {
    const a = p.answers?.[statementId] ?? { pos: 0, note: "" };
    const posLabel = ANSWER_LABELS[a.pos ?? 0] ?? "Geen mening";

    const noteText = String(a.note ?? "").trim();
    const note = noteText.length > 0
      ? `<div class="party-note">${escapeHtml(noteText)}</div>`
      : `<div class="party-note" style="color:#666;">(Geen toelichting ingevuld)</div>`;

    return `
      <div class="party-row">
        <div class="party-name">${escapeHtml(p.name)}</div>
        <div class="party-pos"><strong>${escapeHtml(posLabel)}</strong></div>
        ${note}
      </div>
    `;
  }).join("");

  return `<div class="party-list">${rows}</div>`;
}

function updateProgress() {
  const total = STATEMENTS.length;
  const done = STATEMENTS.filter(s => state.userAnswers[s.id] !== null).length;

  const el = $("#progress");
  if (el) el.textContent = `${done}/${total} beantwoord`;

  // Button wordt pas actief als:
  // 1) alle stellingen beantwoord
  // 2) geslacht + leeftijd + postcode geldig zijn
  const demo = validateDemographics(false);
  const btn = $("#btnResult");
  if (btn) btn.disabled = !(done >= total && demo.ok);
}

function normalizePostcode(raw) {
  return String(raw || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^0-9A-Z]/g, "")
    .slice(0, 6);
}

function validateDemographics(showErrors = true) {
  const errEl = $("#demoError");

  const gender = String(state.demographics.gender || "").trim();
  const ageStr = String(state.demographics.age || "").trim();
  const postcode = normalizePostcode(state.demographics.postcode || "");

  const errors = [];

  if (!["man", "vrouw", "anders"].includes(gender)) {
    errors.push("Kies een geldig geslacht (man, vrouw of anders).");
  }

  const ageNum = ageStr === "" ? NaN : parseInt(ageStr, 10);
  if (!Number.isFinite(ageNum)) {
    errors.push("Vul een geldige leeftijd in.");
  } else if (ageNum < 0 || ageNum > 120) {
    errors.push("Leeftijd moet tussen 0 en 120 zijn.");
  }

  if (!/^\d{4}[A-Z]{2}$/.test(postcode)) {
    errors.push("Postcode moet 6 tekens zijn (4 cijfers + 2 letters), bijv. 1234AB.");
  }

  const ok = errors.length === 0;

  if (errEl) {
    if (!showErrors) errEl.textContent = "";
    else errEl.textContent = ok ? "" : errors.join(" ");
  }

  return { ok, gender, age: ageNum, postcode };
}

function makeSubmissionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

async function logToSheets(demo, results) {
  if (!SHEETS_WEBAPP_URL) return;

  // Stellingen als kolommen: s1..s12
  const answers = {};
  for (const st of STATEMENTS) {
    const v = state.userAnswers[st.id];
    answers[st.id] = (v === null ? "" : v);
  }

  // Weging per thema als kolommen: w_<themeId>
  const weights = {};
  for (const t of THEMES) {
    weights[`w_${t.id}`] = state.themeWeights[t.id] ?? 3;
  }

  const submission = {
    timestamp: new Date().toISOString(),
    id: makeSubmissionId(),
    gender: demo.gender,
    age: demo.age,
    postcode: demo.postcode,

    // Partij-scores (kolommen met partijnaam)
    scores: Object.fromEntries(results.map(r => [r.name, r.pct])),

    // NIEUW:
    answers,
    weights
  };

  try {
    // CORS-safe voor Apps Script
    await fetch(SHEETS_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(submission)
    });
  } catch (e) {
    console.warn("Sheets logging mislukt", e);
  }
}

function computeResults() {
  const results = [];

  for (const party of PARTIES) {
    let score = 0;
    let maxScore = 0;

    for (const st of STATEMENTS) {
      const u = state.userAnswers[st.id];
      if (u === 0 || u === null) continue;

      const w = state.themeWeights[st.themeId] ?? 3;
      const p = party.answers?.[st.id]?.pos ?? 0;

      let pts = 0;
      if (p === 0) pts = 1;
      else if (p === u) pts = 2;
      else pts = 0;

      score += w * pts;
      maxScore += w * 2;
    }

    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    results.push({ partyId: party.id, name: party.name, pct });
  }

  results.sort((a, b) => b.pct - a.pct);
  return results;
}

function renderResults(results) {
  const list = $("#resultList");
  const title = $("#resultTitle");
  const panel = $("#results");

  if (!results) results = computeResults();
  if (!list || !panel) return;

  const top = results[0];
  if (title) title.textContent = top ? `Beste match: ${top.name} (${top.pct}%)` : "Resultaat";

  list.innerHTML = "";

  results.forEach(r => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.innerHTML = `
      <div class="result-row" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div class="result-name" style="font-weight:700;">${escapeHtml(r.name)}</div>
        <div class="result-pct">${r.pct}%</div>
      </div>
      <div class="bar-wrap"><div class="bar" style="width:${r.pct}%"></div></div>
    `;
    list.appendChild(item);
  });

  panel.classList.remove("hidden");
  panel.scrollIntoView({ behavior: "smooth" });
}

function renderStatementUitleg(st) {
  const uitleg = String(st.uitleg ?? "").trim();
  if (!uitleg) return "";

  const html = escapeHtml(uitleg).replace(/\n/g, "<br>");

  return `
    <details class="st-uitleg">
      <summary class="st-uitleg-sum">
        <span class="st-uitleg-icon" aria-hidden="true"></span>
        <span class="st-uitleg-label">Toelichting</span>
      </summary>
      <div class="st-uitleg-text">${html}</div>
    </details>
  `;
}

function bindUI() {
  const btnResult = $("#btnResult");
  if (btnResult) {
    btnResult.addEventListener("click", async () => {
      const demo = validateDemographics(true);
      if (!demo.ok) {
        updateProgress();
        return;
      }

      const results = computeResults();
      await logToSheets(demo, results);
      renderResults(results);
    });
  }

  // Demografie inputs
  const gender = $("#gender");
  if (gender) {
    gender.addEventListener("change", (e) => {
      state.demographics.gender = String(e.target.value || "");
      validateDemographics(false);
      updateProgress();
    });
  }

  const age = $("#age");
  if (age) {
    age.addEventListener("input", (e) => {
      const v = String(e.target.value || "").replace(/\D/g, "").slice(0, 3);
      e.target.value = v;
      state.demographics.age = v;
      validateDemographics(false);
      updateProgress();
    });
  }

  const postcode = $("#postcode");
  if (postcode) {
    postcode.addEventListener("input", (e) => {
      const v = normalizePostcode(e.target.value);
      e.target.value = v;
      state.demographics.postcode = v;
      validateDemographics(false);
      updateProgress();
    });
  }

  const btnReset = $("#btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      initDefaults();
      state.demographics.gender = "";
      state.demographics.age = "";
      state.demographics.postcode = "";

      const gender = $("#gender");
      if (gender) gender.value = "";
      const age = $("#age");
      if (age) age.value = "";
      const postcode = $("#postcode");
      if (postcode) postcode.value = "";

      renderThemes();
      renderStatements();
      updateProgress();

      const res = $("#results");
      if (res) res.classList.add("hidden");

      const errEl = $("#demoError");
      if (errEl) errEl.textContent = "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/* =========================
   MEDIA MARQUEE (onder banner)
========================= */
function initMediaMarquee() {
  const viewport = document.querySelector("[data-media-viewport]");
  const track = document.querySelector("[data-media-track]");
  const btnLeft = document.querySelector("[data-media-left]");
  const btnRight = document.querySelector("[data-media-right]");

  if (!viewport || !track) return;

  const originals = Array.from(track.children);
  if (originals.length < 3) return;

  // Dupliceer voor oneindige loop
  originals.forEach((el) => track.appendChild(el.cloneNode(true)));

  let paused = false;
  let x = 0;
  let last = performance.now();

  const speed = 35;
  const gap = 12;

  function halfWidth() {
    const halfCount = originals.length;
    const resetAt = track.children[halfCount].offsetLeft; // begin 2e set
    return resetAt;
  }

  let resetWidth = 0;
  function recalc() { resetWidth = halfWidth(); }
  recalc();
  window.addEventListener("resize", recalc);

  viewport.addEventListener("mouseenter", () => paused = true);
  viewport.addEventListener("mouseleave", () => paused = false);

  // Swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let touching = false;

  viewport.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touching = true;
    paused = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    if (!touching) return;
    touching = false;

    const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
    if (!t) { paused = false; return; }

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
      if (dx < 0) jump(-1);
      else jump(+1);
    }

    paused = false;
  }, { passive: true });

  function tileStep() {
    const first = track.querySelector(".media-item");
    if (!first) return 260;
    return first.getBoundingClientRect().width + gap;
  }

  function jump(dir) {
    paused = true;
    x += dir * tileStep();
    if (-x >= resetWidth) x += resetWidth;
    if (x > 0) x -= resetWidth;
    track.style.transform = `translateX(${x}px)`;
  }

  if (btnLeft) btnLeft.addEventListener("click", () => jump(+1));
  if (btnRight) btnRight.addEventListener("click", () => jump(-1));

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (!paused) {
      x -= speed * dt;
      if (-x >= resetWidth) x += resetWidth;
      track.style.transform = `translateX(${x}px)`;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}



/* =========================
   STANDPUNTEN PARTIJEN NISSEWAARD
========================= */
function logoSrcForParty(partyId){
  return `./logos/${partyId}.jpg`;
}

function wordCount(text){
  return String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
}

function renderStandpuntenPartijen(){
  const grid = document.getElementById('standpuntenGrid');
  const detail = document.getElementById('standpuntenDetail');
  if (!grid || !detail) return;

  const selectedId = state.selectedStandpuntPartyId;

  const partiesToShow = selectedId ? PARTIES.filter(p => p.id === selectedId) : PARTIES;

  // Bouw de tiles via DOM (geen inline onerror), zodat quotes/escaping nooit stuklopen.
  grid.innerHTML = '';
  partiesToShow.forEach(p => {
    const tile = document.createElement('div');
    tile.className = 'standpunten-tile';
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.dataset.standpuntParty = p.id;
    tile.setAttribute('aria-label', p.name);

    const img = document.createElement('img');
    img.className = 'standpunten-logo';
    img.src = logoSrcForParty(p.id);
    img.alt = p.name;

    img.addEventListener('error', () => {
      // Geen logo gevonden: toon partijnaam als fallback.
      img.remove();
      const fb = document.createElement('div');
      fb.className = 'standpunten-fallback';
      fb.textContent = p.name;
      tile.appendChild(fb);
    }, { once: true });

    tile.appendChild(img);
    grid.appendChild(tile);
  });

  // Detail
  if (!selectedId){
    detail.classList.add('hidden');
    detail.innerHTML = '';
  } else {
    const party = PARTIES.find(p => p.id === selectedId);
    const s = PARTY_STANDPOINTS?.[selectedId] ?? {};

const wonen = (s.wonen_leefbaarheid ?? '').trim();
const verkeer = (s.verkeersontsluiting ?? '').trim();
const molen = (s.uw_molenzicht ?? '').trim();

    detail.classList.remove('hidden');
    detail.innerHTML = `
      <h3 class="standpunten-partyname" id="standpuntenPartyToggle" title="Klik om terug te gaan">${escapeHtml(party?.name ?? selectedId)}</h3>
      <div class="standpunten-cols">
        <div class="standpunten-card">
          <h4>Voorzieningen en leefbaarheid</h4>
          <p>${wonen ? escapeHtml(wonen) : '<span style="color:#666;">(Nog niet ingevuld)</span>'}</p>
        </div>
        <div class="standpunten-card">
          <h4>Verkeersontsluiting</h4>
          <p>${verkeer ? escapeHtml(verkeer) : '<span style="color:#666;">(Nog niet ingevuld)</span>'}</p>
        </div>
        <div class="standpunten-card">
          <h4>Hoe verder met project Molenzicht</h4>
          <p>${molen ? escapeHtml(molen) : '<span style="color:#666;">(Nog niet ingevuld)</span>'}</p>
        </div>
      </div>
    `.trim();

    // Toggle terug: klik op partijnaam
    const toggle = document.getElementById('standpuntenPartyToggle');
    if (toggle){
      toggle.addEventListener('click', () => {
        state.selectedStandpuntPartyId = null;
        renderStandpuntenPartijen();
      }, { once: true });
    }
  }

  // Click handlers op tiles
  grid.querySelectorAll('[data-standpunt-party]').forEach((tile) => {
    const pid = tile.getAttribute('data-standpunt-party');
    const go = () => {
      // Toggle: klik op hetzelfde logo = terug naar het 4x3 raster
      if (state.selectedStandpuntPartyId === pid) {
        state.selectedStandpuntPartyId = null;
      } else {
        state.selectedStandpuntPartyId = pid;
      }
      renderStandpuntenPartijen();
    };
    tile.addEventListener('click', go);
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        go();
      }
    });
  });
}


/* =========================
   SOCIALS MARQUEE (onderaan)
========================= */
function initSocialsMarquee() {
  const viewport = document.querySelector("[data-social-viewport]");
  const track = document.querySelector("[data-social-track]");
  const btnLeft = document.querySelector("[data-social-left]");
  const btnRight = document.querySelector("[data-social-right]");

  if (!viewport || !track) return;

  const originals = Array.from(track.children);
  if (originals.length < 2) return;

  // Dupliceer voor oneindige loop
  originals.forEach((el) => track.appendChild(el.cloneNode(true)));

  let paused = false;
  let x = 0;
  let last = performance.now();

  const speed = 32; // iets rustiger dan media bovenin
  const gap = 6;

  function halfWidth() {
    const halfCount = originals.length;
    const resetAt = track.children[halfCount].offsetLeft; // begin 2e set
    return resetAt;
  }

  let resetWidth = 0;
  function recalc() { resetWidth = halfWidth(); }
  recalc();
  window.addEventListener("resize", recalc);

  viewport.addEventListener("mouseenter", () => paused = true);
  viewport.addEventListener("mouseleave", () => paused = false);

  // Swipe support (mobiel)
  let touchStartX = 0;
  let touchStartY = 0;
  let touching = false;

  viewport.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touching = true;
    paused = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    if (!touching) return;
    touching = false;

    const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
    if (!t) { paused = false; return; }

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
      if (dx < 0) jump(-1);
      else jump(+1);
    }

    paused = false;
  }, { passive: true });

  function tileStep() {
    const first = track.querySelector(".media-item");
    if (!first) return 260;
    return first.getBoundingClientRect().width + gap;
  }

  function jump(dir) {
    paused = true;
    x += dir * tileStep();
    if (-x >= resetWidth) x += resetWidth;
    if (x > 0) x -= resetWidth;
    track.style.transform = `translateX(${x}px)`;
  }

  if (btnLeft) btnLeft.addEventListener("click", () => jump(+1));
  if (btnRight) btnRight.addEventListener("click", () => jump(-1));

  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;

    if (!paused) {
      x -= speed * dt;
      if (-x >= resetWidth) x += resetWidth;
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


function main() {
  initDefaults();
  renderThemes();
  renderStatements();
  updateProgress();
  bindUI();
  initMediaMarquee();
  initSocialsMarquee();
  renderStandpuntenPartijen();
}

main();


