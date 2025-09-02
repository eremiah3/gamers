// ===================
// Hamburger Menu
// ===================
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

hamburger.addEventListener('click', () => {
  menu.classList.toggle('show');
  hamburger.classList.toggle('active');
});

// ===================
// Typing Effect
// ===================
const typingElement = document.getElementById("typing");
const text = "Welcome to Gamers Hub 🎮";
let index = 0;
let isDeleting = false;
function typeEffect() {
  if (!isDeleting) {
    typingElement.textContent = text.slice(0, index++);
    if (index > text.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1200);
      return;
    }
  } else {
    typingElement.textContent = text.slice(0, index--);
    if (index < 0) {
      isDeleting = false;
      index = 0;
    }
  }
  setTimeout(typeEffect, isDeleting ? 60 : 120);
}
typeEffect();

// ===================
// Particle Background
// ===================
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
let mouse = { x: null, y: null, radius: 120 };

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 1.2;
    this.speedY = (Math.random() - 0.5) * 1.2;
    this.color = Math.random() > 0.5 ? "#ff00ff" : "#00ffff";
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouse.radius) {
      let angle = Math.atan2(dy, dx);
      let force = (mouse.radius - distance) / mouse.radius;
      this.x -= Math.cos(angle) * force * 5;
      this.y -= Math.sin(angle) * force * 5;
    }
  }
  draw() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function initParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) particles.push(new Particle());
}
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});
window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

if (music && musicBtn) {
  let isPlaying = false;

  musicBtn.addEventListener("click", () => {
    console.log("Music button clicked, isPlaying:", isPlaying);
    if (!isPlaying) {
      music.play().then(() => {
        console.log("Audio playing");
        musicBtn.textContent = "⏸";
        isPlaying = true;
      }).catch(err => {
        console.error("Playback failed:", err);
        alert("Failed to play audio. Check console for details.");
      });
    } else {
      music.pause();
      musicBtn.textContent = "▶";
      isPlaying = false;
      console.log("Audio paused");
    }
  });
} else {
  console.error("Music or button element not found");
}

// ===================
// Contact Form Confirmation
// ===================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    contactForm.reset();
  });
}

// ===================
// ScrollReveal Animations
// ===================
if (window.ScrollReveal) {
  window.sr = ScrollReveal({
    distance: "60px",
    duration: 2000,
    delay: 200,
    reset: true
  });
  sr.reveal(".about-text", { origin: "left" });
  sr.reveal(".about-img", { origin: "right" });
  sr.reveal(".service-card", { interval: 200 });
  sr.reveal(".gallery-item", { interval: 200 });
  sr.reveal(".game-card", { interval: 200 });
}

// ===================
// FreeToGame API (Live with Filters and Load More)
// ===================
async function loadGames(category = "all", append = false, limit = 8) {
  const grid = document.getElementById("gamesGrid");
  if (!grid) return;

  // Show loading state if not appending
  if (!append) {
    grid.innerHTML = `<div class="loading"><span>🎮 Loading games…</span></div>`;
  }

  try {
    let url = "https://free-to-play-games-database.p.rapidapi.com/api/games";

    // Add filter if not "all" to ensure server-side filtering
    if (category && category !== "all") {
      url += `?category=${category.toLowerCase()}`;
    }
    console.log("Fetching URL:", url); // Debug the URL

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'd2122fc458mshd1e1cdcc51c6e7bp1828aejsn477b8be34180',
        'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
      }
    });

    if (!res.ok) {
      throw new Error(`Network error! Status: ${res.status} - ${res.statusText}`);
    }

    let games = await res.json(); // Changed to let for reassignment
    console.log("API Response Length:", games.length, "Data:", games); // Debug response length and data

    // Check if the category filter worked; if not, filter client-side
    if (category !== "all" && games.length > 0) {
      const validCategories = ["action", "shooter", "mmorpg", "fighting", "strategy", "racing", "sports", "moba"];
      if (!validCategories.includes(category.toLowerCase())) {
        console.warn("Invalid category:", category);
        grid.innerHTML = `<p style="color:#ff00ff;text-align:center">⚠️ Invalid category selected.</p>`;
        return;
      }
      // Filter client-side if API doesn't respect category
      games = games.filter(game => game.genre && game.genre.toLowerCase() === category.toLowerCase());
      console.log("Filtered Games:", games);
    }

    if (!Array.isArray(games) || games.length === 0) {
      grid.innerHTML = `<p style="color:#ff00ff;text-align:center">🚫 No games found in this category.</p>`;
      return;
    }

    // Pick games based on current limit
    const picks = games.slice(0, limit);

    if (!append) {
      grid.innerHTML = ""; // Clear grid if not appending
    }

    picks.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.innerHTML = `
        <img src="${game.thumbnail}" alt="${game.title}">
        <h3>${game.title}</h3>
        <p>${game.short_description || ""}</p>
        <a href="${game.game_url}" target="_blank" rel="noopener" class="play-btn">Play Now</a>
      `;
      grid.appendChild(card);
    });

    // Add or update Load More button
    if (games.length > limit) {
      let loadMoreBtn = document.getElementById("loadMoreBtn");
      if (!loadMoreBtn) {
        loadMoreBtn = document.createElement("button");
        loadMoreBtn.id = "loadMoreBtn";
        loadMoreBtn.className = "load-more-btn";
        loadMoreBtn.textContent = "Load More";
        grid.parentElement.appendChild(loadMoreBtn);
        loadMoreBtn.addEventListener("click", () => {
          loadGames(category, true, limit + 8); // Load next 8 games
        });
      }
    } else {
      const loadMoreBtn = document.getElementById("loadMoreBtn");
      if (loadMoreBtn) loadMoreBtn.remove(); // Remove button if no more games
    }
  } catch (err) {
    console.error("Error loading games:", err);
    grid.innerHTML = `<p style="color:#ff00ff;text-align:center">⚠️ Failed to load games.<br>Please check your connection and refresh. (Error: ${err.message})</p>`;
  }
}

// ===================
// Filter Button Events
// ===================
const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    const category = btn.getAttribute("data-category");
    loadGames(category); // Reset to initial load with new category
  });
});

// Load "All" games on first load
window.addEventListener("DOMContentLoaded", () => loadGames("all"));

// ===================
// Swiper for Gallery
// ===================
const swiper = new Swiper(".mySwiper", {
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  }
});