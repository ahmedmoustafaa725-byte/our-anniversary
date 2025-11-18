// main.js – shared logic for all pages

document.addEventListener("DOMContentLoaded", () => {
  // ===== Floating hearts =====
  const heartBg = document.getElementById("heart-bg");
  function createHeart() {
    if (!heartBg) return;
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = 10 + Math.random() * 12 + "s";
    heart.style.opacity = 0.15 + Math.random() * 0.25;
    heartBg.appendChild(heart);
    setTimeout(() => heart.remove(), 24000);
  }
  function spawnRandomHearts(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(createHeart, Math.random() * 2500);
    }
  }
  spawnRandomHearts(18);
  setInterval(() => spawnRandomHearts(3), 8000);

  // ===== Music control =====
  const music = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-btn");
  const musicLabel = document.getElementById("music-label");

  function playMusic() {
    if (!music || !musicBtn || !musicLabel) return;
    music
      .play()
      .then(() => {
        musicBtn.classList.remove("paused");
        musicLabel.textContent = "Pause our song";
      })
      .catch(() => {
        // Autoplay blocked by browser – just ignore
      });
  }

  function pauseMusic() {
    if (!music || !musicBtn || !musicLabel) return;
    music.pause();
    musicBtn.classList.add("paused");
    musicLabel.textContent = "Play our song";
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", () => {
      if (!music) return;
      if (music.paused) {
        playMusic();
      } else {
        pauseMusic();
      }
    });
  }

  // ===== Password gate + intro sequence (index page only) =====
  const gateEl = document.getElementById("gate");
  const mainEl = document.getElementById("main-content");
  const secretInput = document.getElementById("secret-input");
  const enterBtn = document.getElementById("enter-btn");
  const gateError = document.getElementById("gate-error");
  const introScreen = document.getElementById("intro-screen");
  const introStep1 = document.getElementById("intro-step-1");
  const introStep2 = document.getElementById("intro-step-2");
  const introStep3 = document.getElementById("intro-step-3");
  const holdButton = document.getElementById("hold-button");
  const holdFill = document.getElementById("hold-fill");
  const SECRET_DATE = "05.12.2024"; // your anniversary

  let introTimeout1, introTimeout2;

  function showIntroStep(step) {
    if (!introStep1 || !introStep2 || !introStep3) return;
    [introStep1, introStep2, introStep3].forEach((el) =>
      el.classList.remove("intro-step-active")
    );
    if (step === 1) introStep1.classList.add("intro-step-active");
    if (step === 2) introStep2.classList.add("intro-step-active");
    if (step === 3) introStep3.classList.add("intro-step-active");
  }

  function startIntroSequence() {
    if (!introScreen) return;
    introScreen.classList.remove("hidden");
    introScreen.classList.add("active");
    showIntroStep(1);
    introTimeout1 = setTimeout(() => showIntroStep(2), 2500);
    introTimeout2 = setTimeout(() => showIntroStep(3), 5000);
  }

  function finishIntro() {
    if (!introScreen) return;
    introScreen.classList.remove("active");
    setTimeout(() => introScreen.classList.add("hidden"), 900);
    const chats = document.getElementById("chats");
    if (chats) {
      chats.scrollIntoView({ behavior: "smooth" });
    }
  }

  // long press logic
  if (holdButton && holdFill) {
    let holdTimer;
    const HOLD_DURATION = 2000;

    function startHold() {
      holdFill.classList.add("filling");
      holdTimer = setTimeout(() => {
        finishIntro();
      }, HOLD_DURATION);
    }

    function cancelHold() {
      holdFill.classList.remove("filling");
      clearTimeout(holdTimer);
    }

    holdButton.addEventListener("mousedown", startHold);
    holdButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startHold();
    });

    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((ev) => {
      holdButton.addEventListener(ev, cancelHold);
    });
  }

  function openSite() {
    if (gateEl) gateEl.style.display = "none";
    if (mainEl) mainEl.classList.remove("hidden");
    window.scrollTo(0, 0);
    spawnRandomHearts(12);
    startIntroSequence();
  }

  function handleGate() {
    if (!secretInput || !gateError) return;
    const value = (secretInput.value || "").trim();
    if (!value) {
      gateError.textContent = "Don’t forget our date 😌";
      return;
    }
    if (value === SECRET_DATE) {
      gateError.textContent = "";
      openSite();
      // ✅ Always start music automatically after correct password
      playMusic();
    } else {
      gateError.textContent = "Almost! Try our anniversary again ❤️";
    }
  }

  if (enterBtn && gateEl) {
    enterBtn.addEventListener("click", handleGate);
  }
  if (secretInput && gateEl) {
    secretInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleGate();
    });
  }

  // If there is no gate (story/gallery pages), main content is always visible
  if (!gateEl && mainEl) {
    mainEl.classList.remove("hidden");
  }

  // ✅ Try to autoplay music on pages WITHOUT the gate (story.html, gallery.html)
  if (!gateEl && music) {
    playMusic();
  }

  // ===== Chat reveal (index page) =====
  const revealBtn = document.getElementById("reveal-chat-btn");
  const hiddenMessages = document.getElementById("hidden-messages");
  if (revealBtn && hiddenMessages) {
    revealBtn.addEventListener("click", () => {
      hiddenMessages.classList.add("visible");
      revealBtn.style.display = "none";
    });
  }
  // ===== Unlock Part 2 (story content on index) =====
  const storyTrigger = document.getElementById("story-trigger");
  const storySection = document.getElementById("story-section");
  const storyVeil = document.getElementById("story-veil");

  function unlockStory() {
    if (!storySection) return;

    storySection.classList.remove("hidden");
    requestAnimationFrame(() => {
      storySection.classList.add("story-visible");
    });

    if (storyVeil) {
      storyVeil.classList.add("story-veil-show");
      setTimeout(() => storyVeil.classList.add("story-veil-hide"), 450);
    }

    if (storyTrigger) {
      storyTrigger.textContent = "Part 2 unlocked 💖";
      storyTrigger.disabled = true;
    }

    setTimeout(() => {
      storySection.scrollIntoView({ behavior: "smooth" });
    }, 140);
    spawnRandomHearts(6);
  }

  if (storyTrigger) {
    storyTrigger.addEventListener("click", unlockStory);
  }
  // ===== Photo modal (story page) =====
  const photoCards = document.querySelectorAll(".photo-card");
  const photoModal = document.getElementById("photo-modal");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalClose = document.getElementById("modal-close");

  if (photoCards.length && photoModal && modalImg && modalTitle && modalMessage) {
    photoCards.forEach((card) => {
      card.addEventListener("click", () => {
        const title = card.dataset.title || "Our memory";
        const message = card.dataset.message || "";
        const img = card.dataset.img;

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        if (img) {
          modalImg.src = img;
        }

        photoModal.classList.add("open");
      });
    });
  }

  if (modalClose && photoModal) {
    modalClose.addEventListener("click", () => {
      photoModal.classList.remove("open");
    });
    photoModal.addEventListener("click", (e) => {
      if (e.target === photoModal) {
        photoModal.classList.remove("open");
      }
    });
  }

  // ===== Map / places (story page) =====
  const mapButtons = document.querySelectorAll(".map-tab-btn");
  const mapDetailCards = document.querySelectorAll(".map-detail-card");
  const mapPins = document.querySelectorAll(".map-pin");

  function setActivePlace(placeId) {
    mapButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.target === placeId);
    });
    mapDetailCards.forEach((card) => {
      card.classList.toggle("active", card.id === "place-" + placeId);
    });
  }

  if (mapButtons.length && mapDetailCards.length) {
    mapButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        setActivePlace(btn.dataset.target);
      });
    });
    mapPins.forEach((pin) => {
      pin.addEventListener("click", () => {
        const place = pin.dataset.place;
        setActivePlace(place);
      });
    });
  }

  // ===== Why I love you reasons (story page) =====
  const whyBtn = document.getElementById("why-btn");
  const whyDisplay = document.getElementById("why-display");

  const LOVE_REASONS = [
    "You make even normal days feel special.",
    "You know how to calm me down when I’m stressed.",
    "I feel safe telling you everything.",
    "Your smile can literally change my whole mood.",
    "You support my dreams, even the crazy ones.",
    "You’re kind not just to me, but to everyone.",
    "You listen — really listen — when I talk.",
    "You make me want to be a better version of myself.",
    "You’re my favorite person to be stupid with.",
    "You’re my peace and my chaos at the same time.",
    "You never gave up on us, even when things were hard.",
    "Because you’re you. And that’s more than enough."
  ];

  let reasonIndex = 0;

  if (whyBtn && whyDisplay) {
    function createMiniHeart() {
      const heart = document.createElement("div");
      heart.className = "floating-heart";
      heart.style.width = "20px";
      heart.style.height = "20px";
      heart.style.opacity = "0.75";
      heart.style.left = 20 + Math.random() * 60 + "vw";
      heart.style.animationDuration = 5 + Math.random() * 4 + "s";
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 9000);
    }

    whyBtn.addEventListener("click", () => {
      const reason = LOVE_REASONS[reasonIndex];
      whyDisplay.textContent = reason;
      reasonIndex = (reasonIndex + 1) % LOVE_REASONS.length;
      createMiniHeart();
    });
  }
});
