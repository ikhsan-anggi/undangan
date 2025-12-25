window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

/* ========= AUTOPLAY MUSIC ========= */
const audio = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-toggle");
const musicIcon = document.getElementById("music-icon");

let started = false;

function startMusic() {
  if (started) return;
  started = true;

  audio.volume = 0;
  audio.play().catch(() => {});
  musicBtn.classList.add("playing");
  musicIcon.textContent = "🔊";

  fadeInMusic();
}

function fadeInMusic() {
  const fade = setInterval(() => {
    if (audio.volume < 0.95) {
      audio.volume += 0.05;
    } else {
      audio.volume = 1;
      clearInterval(fade);
    }
  }, 200);
}



document.addEventListener("click", startMusic, { once: true });

musicBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    musicBtn.classList.add("playing");
    musicIcon.textContent = "🔊";
  } else {
    audio.pause();
    musicBtn.classList.remove("playing");
    musicIcon.textContent = "🔇";
  }
});

/* ========= MUSIC FADE OUT DI AKHIR HALAMAN ========= */
audio.loop = false; // PENTING

let musicFading = false;

window.addEventListener("scroll", () => {
  const scrollPos = window.scrollY + window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  // jika sudah mendekati bawah halaman
  if (scrollPos >= docHeight * 0.92 && !musicFading) {
    musicFading = true;
    fadeOutMusic();
  }
});

function fadeOutMusic() {
  const fade = setInterval(() => {
    if (audio.volume > 0.05) {
      audio.volume -= 0.05;
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(fade);
    }
  }, 200);
}


/* ========= COUNTDOWN ========= */
const targetDate = new Date("2026-01-10T09:00:00").getTime();
const countdownTimer = setInterval(() => {
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff <= 0) {
    clearInterval(countdownTimer);
    return;
  }

  document.getElementById("cd-days").textContent = Math.floor(diff / (1000*60*60*24)).toString().padStart(2,"0");
  document.getElementById("cd-hours").textContent = Math.floor((diff / (1000*60*60)) % 24).toString().padStart(2,"0");
  document.getElementById("cd-minutes").textContent = Math.floor((diff / (1000*60)) % 60).toString().padStart(2,"0");
  document.getElementById("cd-seconds").textContent = Math.floor((diff / 1000) % 60).toString().padStart(2,"0");
}, 1000);

/* ========= FADE UP WITH INTERSECTION OBSERVER ========= */
const fadeUps = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.2 });

fadeUps.forEach(el => observer.observe(el));

/* ========= GALLERY LIGHTBOX ========= */
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-img");
const closeBtn = document.querySelector("#lightbox .close");

galleryItems.forEach(item => {
  item.addEventListener("click", () => {
    lightboxImg.src = item.src;
    lightbox.classList.add("show");
  });
});

closeBtn.addEventListener("click", () => lightbox.classList.remove("show"));
lightbox.addEventListener("click", e => { if (e.target === lightbox) lightbox.classList.remove("show"); });

/*************************************************
 * RSVP FRONTEND – FINAL CLEAN VERSION
 * Ikhsan & Anggi Wedding
 *************************************************/

const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbwacykfrUZLg87ilF7s6H3hRUP7kZrzHM1A0S9c92dFvyER_ipEk3F9Q1CZ2qA8AeLPYA/exec";
const REFRESH_INTERVAL = 7000;

// ====== FUZZY BAD WORD LIST ======
const BAD_WORDS = [
  "anjing",
  "babi",
  "bangsat",
  "kontol",
  "memek",
  "ngentot",
  "tolol",
  "fuck",
  "shit",
  "asshole"
];


// ====== ELEMENT ======
const form = document.getElementById("rsvp-form");
const nameInput = document.getElementById("rsvp-name");
const messageInput = document.getElementById("rsvp-message");
const submitBtn = document.getElementById("rsvp-submit");
const toast = document.getElementById("rsvpToast");
const list = document.getElementById("rsvp-list");

// ====== FUZZY FILTER ======
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[3]/g, "e")
    .replace(/[5$]/g, "s")
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1+/g, "$1");
}

function containsBadWord(text) {
  const clean = normalizeText(text);

  // ===== REGEX KHUSUS "ANJIR FAMILY" =====
  // anjir, anjirr, anjrit, njir, njirr, njrit, dll
  const anjirPattern = /(a?n?j+i+r+t?)/;

  if (anjirPattern.test(clean)) {
    return true;
  }

  // ===== CEK BAD WORDS NORMAL =====
  return BAD_WORDS.some(word => clean.includes(word));
}


// ====== UI HELPERS ======
function showToast(message, type = "info") {
  toast.innerHTML = message;
  toast.className = `rsvp-toast show ${type}`;
  setTimeout(() => {
    toast.className = "rsvp-toast";
  }, 3500);
}

function setLoading(state) {
  submitBtn.classList.toggle("loading", state);
}

function freezeForm() {
  form.querySelectorAll("input, textarea, button").forEach(el => {
    el.disabled = true;
  });

  submitBtn.textContent = "Ucapan Terkirim";
}


// ====== INIT GUEST NAME ======
const guestName =
  sessionStorage.getItem("guestName") ||
  new URLSearchParams(window.location.search).get("to") ||
  "";

if (guestName) {
  nameInput.value = guestName;
  nameInput.readOnly = true;
}

// ====== FREEZE CHECK ======
const freezeKey = "rsvp_done_" + guestName;
if (localStorage.getItem(freezeKey)) {
  freezeForm();
}

// ====== SUBMIT HANDLER ======
form.addEventListener("submit", e => {
  e.preventDefault();

  if (localStorage.getItem(freezeKey)) {
    showToast("🚫 Kamu sudah mengirim ucapan.", "error");
    return;
  }

  const attendance = form.attendance.value;
  const message = messageInput.value.trim();

  if (!attendance || !message) {
    showToast("⚠️ Mohon lengkapi semua data.", "error");
    return;
  }

  if (containsBadWord(message)) {
    showToast(
      "🚫 Ucapan mengandung kata tidak pantas. Silakan perbaiki.",
      "error"
    );
    messageInput.focus();
    return;
  }

  setLoading(true);

  fetch(ENDPOINT_URL, {
    method: "POST",
    body: JSON.stringify({
      name: guestName,
      attendance,
      message
    })
  })
    .then(res => res.json())
    .then(res => {
      setLoading(false);

      if (res.status === "success") {
        localStorage.setItem(freezeKey, "true");
        freezeForm();
        showToast("✅ Terima kasih! Ucapanmu berhasil dikirim.", "success");
        loadUcapan();
      } else {
        showToast("❌ Gagal mengirim ucapan.", "error");
      }
    })
    .catch(() => {
      setLoading(false);
      showToast("❌ Koneksi bermasalah.", "error");
    });
});

// ====== REALTIME LIST ======
function loadUcapan() {
  fetch(ENDPOINT_URL + "?action=list")
    .then(res => res.json())
    .then(data => {
      list.innerHTML = "";

      data.forEach(item => {
        const div = document.createElement("div");
        div.className = "rsvp-item";
        div.innerHTML = `
          <h4>${item.name}</h4>
          <span>${item.attendance}</span>
          <p>${item.message}</p>
        `;
        list.appendChild(div);
      });
    });
}

loadUcapan();
setInterval(loadUcapan, REFRESH_INTERVAL);






/* ========= COPY WEDDING GIFT ========= */
function copyGift(number) {
  navigator.clipboard.writeText(number);

  const toast = document.getElementById("copyToast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

