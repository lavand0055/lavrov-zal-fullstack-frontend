// Mock data
const SESSIONS = [
  { id: 1, film: "Дюна: Часть вторая", cinema: "Chaplin Mega", hall: "Зал 3", time: "19:30", price: 2500, type: "quiet", format: "2D", screen: "Стандарт", rating: 4.6, sound: 4.8, temp: 4.2, clean: 4.7, discount: 0 },
  { id: 2, film: "Оппенгеймер", cinema: "Kinopark 11", hall: "IMAX", time: "18:00", price: 3200, type: "warm", format: "IMAX", screen: "IMAX", rating: 4.3, sound: 4.9, temp: 3.8, clean: 4.1, discount: 10 },
  { id: 3, film: "Барби", cinema: "Arman", hall: "Зал 1", time: "20:15", price: 1800, type: "clean", format: "2D", screen: "Стандарт", rating: 4.1, sound: 4.0, temp: 4.5, clean: 4.8, discount: 0 },
  { id: 4, film: "Джокер 2", cinema: "Chaplin Mega", hall: "Зал 5", time: "21:00", price: 2200, type: "quiet", format: "3D", screen: "3D", rating: 4.7, sound: 4.6, temp: 4.4, clean: 4.9, discount: 15 },
  { id: 5, film: "Интерстеллар", cinema: "Kinopark 7", hall: "Зал 2", time: "17:45", price: 2000, type: "warm", format: "2D", screen: "Стандарт", rating: 4.4, sound: 4.5, temp: 4.0, clean: 4.3, discount: 0 },
  { id: 6, film: "Дэдпул и Росомаха", cinema: "Esentai", hall: "VIP", time: "19:00", price: 4500, type: "clean", format: "2D", screen: "VIP", rating: 4.8, sound: 4.9, temp: 4.7, clean: 5.0, discount: 0 },
  { id: 7, film: "Головоломка 2", cinema: "Kinopark 11", hall: "Зал 4", time: "16:30", price: 1600, type: "quiet", format: "2D", screen: "Стандарт", rating: 4.2, sound: 4.1, temp: 4.3, clean: 4.4, discount: 20 },
  { id: 8, film: "Аватар 3", cinema: "Chaplin Mega", hall: "8D", time: "20:45", price: 3800, type: "warm", format: "8D", screen: "8D", rating: 4.5, sound: 4.7, temp: 4.0, clean: 4.6, discount: 0 },
  { id: 9, film: "Субстанция", cinema: "Arman", hall: "Зал 2", time: "22:00", price: 1900, type: "clean", format: "2D", screen: "Стандарт", rating: 3.9, sound: 3.8, temp: 4.1, clean: 3.9, discount: 0 },
  { id: 10, film: "Миссия невыполнима", cinema: "Kinopark 7", hall: "IMAX", time: "18:30", price: 2900, type: "quiet", format: "IMAX", screen: "IMAX", rating: 4.6, sound: 4.8, temp: 4.3, clean: 4.5, discount: 5 }
];

// Utils
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function getReviews() {
  return JSON.parse(localStorage.getItem("zal-reviews") || "[]");
}

function saveReviews(reviews) {
  localStorage.setItem("zal-reviews", JSON.stringify(reviews));
}

function getProfile() {
  return JSON.parse(localStorage.getItem("zal-profile") || "{}");
}

function saveProfile(profile) {
  localStorage.setItem("zal-profile", JSON.stringify(profile));
}

function getHallKey(cinema, hall) {
  return `${cinema} — ${hall}`;
}

function getAvgForHall(cinema, hall) {
  const key = getHallKey(cinema, hall);
  const reviews = getReviews().filter(r => r.cinema === key);
  const base = SESSIONS.find(s => s.cinema === cinema && s.hall === hall);
  if (!reviews.length) return base ? base.rating : 0;
  const avg = reviews.reduce((sum, r) => sum + (r.sound + r.temp + r.clean) / 3, 0) / reviews.length;
  return +avg.toFixed(1);
}

function getTopHalls(limit = 5) {
  const halls = {};
  SESSIONS.forEach(s => {
    const key = getHallKey(s.cinema, s.hall);
    if (!halls[key]) {
      halls[key] = { cinema: s.cinema, hall: s.hall, format: s.format, rating: getAvgForHall(s.cinema, s.hall) };
    }
  });
  return Object.values(halls)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}


// Mobile menu
function initMenu() {
  const burger = $("#burger");
  const menu = $("#mobile-menu");
  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

// Modals
function initModals() {
  $$("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.openModal;
      const modal = $("#" + id);
      if (modal) modal.classList.add("open");
    });
  });

  $$("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").classList.remove("open");
    });
  });

  $$(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  });
}

// Render sessions cards
function renderSessionCard(s) {
  const discountHtml = s.discount ? `<span class="badge">-${s.discount}%</span>` : "";
  const formatHtml = `<span class="format-badge">${s.format}</span>`;
  const rating = getAvgForHall(s.cinema, s.hall);
  const barWidth = (rating / 5) * 100;
  return `
    <article class="session-card" data-id="${s.id}">
      <div class="session-card__title">${s.film} ${formatHtml}</div>
      <div class="session-card__meta">${s.cinema} · ${s.hall} · ${s.screen}</div>
      <div class="session-card__meta">${s.time} · Оценка зала: ${rating}</div>
      <div class="rating-bar"><div class="rating-bar__fill" style="width:${barWidth}%"></div></div>
      <div class="session-card__price">${s.price} ₸ ${discountHtml}</div>
    </article>
  `;
}

// Index page
function initIndex() {
  const container = $("#sessions-preview");
  if (!container) return;

  const preview = SESSIONS.slice(0, 3);
  container.innerHTML = preview.map(renderSessionCard).join("");

  $("#stat-sessions").textContent = SESSIONS.length;
  const allRatings = SESSIONS.map(s => getAvgForHall(s.cinema, s.hall));
  const avg = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
  $("#stat-rating").textContent = avg;
  $("#stat-nearest").textContent = "Chaplin Mega";

  const topContainer = $("#top-halls");
  if (topContainer) {
    const top = getTopHalls(4);
    topContainer.innerHTML = top.map(h => `
      <div class="session-card">
        <div class="session-card__title">${h.cinema} — ${h.hall}</div>
        <div class="session-card__meta">${h.format}</div>
        <div class="session-card__meta">Оценка: <strong>${h.rating}</strong></div>
        <div class="rating-bar"><div class="rating-bar__fill" style="width:${(h.rating/5)*100}%"></div></div>
      </div>
    `).join("");
  }
}

// Sessions page: search + filter
function initSessions() {
  const list = $("#sessions-list");
  const search = $("#search-input");
  const filter = $("#filter-type");
  const empty = $("#empty-state");
  if (!list) return;

  function update() {
    const q = (search?.value || "").toLowerCase();
    const type = filter?.value || "";

    const filtered = SESSIONS.filter(s => {
      const matchText = s.film.toLowerCase().includes(q) || s.cinema.toLowerCase().includes(q);
      const matchType = !type || s.type === type;
      return matchText && matchType;
    });

    list.innerHTML = filtered.map(renderSessionCard).join("");
    if (empty) empty.hidden = filtered.length > 0;
  }

  search?.addEventListener("input", update);
  filter?.addEventListener("change", update);
  update();
}

// Hall page
function renderHallReviews(selected) {
  const container = $("#hall-reviews-list");
  if (!container) return;
  const all = getReviews();
  const reviews = all.filter(r => r.cinema === selected);
  if (!reviews.length) {
    container.innerHTML = '<p class="empty-state">Пока нет оценок для этого зала.</p>';
    return;
  }
  container.innerHTML = reviews.map((r) => {
    const globalIdx = all.indexOf(r);
    return `
      <div class="session-card">
        <div><strong>${r.cinema}</strong> · Звук: ${r.sound} · Темп: ${r.temp} · Чистота: ${r.clean}</div>
        <div class="session-card__meta">${r.comment || "Без комментария"}</div>
        <div class="session-card__meta">${r.date}</div>
        <button class="btn btn--danger mt-2" data-delete-review="${globalIdx}">Удалить</button>
      </div>
    `;
  }).join("");

  container.querySelectorAll("[data-delete-review]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = +btn.dataset.deleteReview;
      const revs = getReviews();
      revs.splice(idx, 1);
      saveReviews(revs);
      renderHallReviews(selected);
      updateHallRatings(selected);
    });
  });
}

function updateHallRatings(selected) {
  const reviews = getReviews().filter(r => r.cinema === selected);
  const [cinema, hallName] = selected.split(" — ");
  const base = SESSIONS.find(s => s.cinema === cinema && s.hall === hallName);

  let sound = base ? base.sound : 0;
  let temp = base ? base.temp : 0;
  let clean = base ? base.clean : 0;
  let overall = base ? base.rating : 0;

  if (reviews.length) {
    const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    sound = avg(reviews.map(r => r.sound));
    temp = avg(reviews.map(r => r.temp));
    clean = avg(reviews.map(r => r.clean));
    overall = ((+sound + +temp + +clean) / 3).toFixed(1);
  }

  if ($("#rating-sound")) $("#rating-sound").textContent = sound;
  if ($("#rating-temp")) $("#rating-temp").textContent = temp;
  if ($("#rating-clean")) $("#rating-clean").textContent = clean;
  const avgEl = $("#hall-avg");
  if (avgEl) avgEl.textContent = overall;
}

function initHall() {
  const detail = $("#hall-detail");
  if (!detail) return;

  const halls = [...new Set(SESSIONS.map(s => `${s.cinema} — ${s.hall}`))];
  let selected = localStorage.getItem("zal-selected-hall") || halls[0];
  if (!halls.includes(selected)) selected = halls[0];

  function renderDetail() {
    const [cinema, hallName] = selected.split(" — ");
    const sess = SESSIONS.find(s => s.cinema === cinema && s.hall === hallName) || SESSIONS[0];
    const currentAvg = getAvgForHall(cinema, hallName);
    detail.innerHTML = `
      <div class="flex-between">
        <h2>${selected}</h2>
        <select id="hall-select" class="select" style="max-width:220px">
          ${halls.map(h => `<option ${h === selected ? "selected" : ""}>${h}</option>`).join("")}
        </select>
      </div>
      <p class="session-card__meta mt-2">Формат: ${sess.format} · Экран: ${sess.screen}</p>
      <p class="mt-2">Средняя оценка: <strong id="hall-avg">${currentAvg}</strong></p>
    `;
    const sel = $("#hall-select");
    if (sel) {
      sel.addEventListener("change", (e) => {
        selected = e.target.value;
        localStorage.setItem("zal-selected-hall", selected);
        renderDetail();
        renderHallReviews(selected);
        updateHallRatings(selected);
      });
    }
  }
  renderDetail();
  renderHallReviews(selected);
  updateHallRatings(selected);

  const form = $("#review-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const review = {
        cinema: selected,
        // keep selection
        sound: +data.get("sound"),
        temp: +data.get("temp"),
        clean: +data.get("clean"),
        comment: data.get("comment") || "",
        date: new Date().toLocaleString("ru", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };

      if (![review.sound, review.temp, review.clean].every(n => n >= 1 && n <= 5)) {
        alert("Оценки должны быть от 1 до 5");
        return;
      }

      const reviews = getReviews();
      reviews.push(review);
      saveReviews(reviews);
      localStorage.setItem("zal-selected-hall", selected);

      form.reset();
      $("#review-modal").classList.remove("open");
      renderHallReviews(selected);
      updateHallRatings(selected);
    });
  }
}

// Profile page
function initProfile() {
  const form = $("#profile-form");
  if (!form) return;

  const profile = getProfile();
  if (profile.name) $("#profile-name").value = profile.name;
  if (profile.city) $("#profile-city").value = profile.city;
  if (profile.pref) $("#profile-pref").value = profile.pref;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const profile = {
      name: data.get("name").trim(),
      city: data.get("city").trim(),
      pref: data.get("pref")
    };

    if (!profile.name) {
      alert("Введи имя");
      return;
    }

    saveProfile(profile);
    alert("Профиль сохранён");
  });

  // Show reviews
  const reviewsEl = $("#my-reviews");
  function renderProfileReviews() {
    const reviews = getReviews();
    if (!reviewsEl) return;
    if (!reviews.length) {
      reviewsEl.innerHTML = '<p class="empty-state">Пока нет оценок.</p>';
      return;
    }
    reviewsEl.innerHTML = reviews.map((r, i) => `
      <div class="session-card">
        <div><strong>${r.cinema || "Зал"}</strong> · Звук: ${r.sound} · Темп: ${r.temp} · Чистота: ${r.clean}</div>
        <div class="session-card__meta">${r.comment || "Без комментария"}</div>
        <div class="session-card__meta">${r.date}</div>
        <button class="btn btn--danger mt-2" data-del="${i}">Удалить</button>
      </div>
    `).join("");
    reviewsEl.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const revs = getReviews();
        revs.splice(+btn.dataset.del, 1);
        saveReviews(revs);
        renderProfileReviews();
      });
    });
  }
  renderProfileReviews();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initModals();
  initIndex();
  initSessions();
  initHall();
  initProfile();
});
// Обновление рейтинга залов
