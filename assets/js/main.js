// main.js – shared logic for all pages

document.addEventListener("DOMContentLoaded", () => {

  // ===== Floating hearts =====
  const heartBg = document.getElementById("heart-bg");
    const heartBurstLayer = document.getElementById("heart-pop-layer");

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
   function launchHeartBurst(count = 34) {
    if (!heartBurstLayer) return;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "pop-heart";
      heart.style.setProperty("--size", 18 + Math.random() * 16 + "px");
      heart.style.left = Math.random() * 100 + "%";
      heart.style.top = Math.random() * 100 + "%";
      heart.style.animationDelay = Math.random() * 0.25 + "s";
      heartBurstLayer.appendChild(heart);
      setTimeout(() => heart.remove(), 1600);
    }
  }
  spawnRandomHearts(18);
  setInterval(() => spawnRandomHearts(3), 8000);

  // ===== Music control =====
  const music = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-btn");
  const musicLabel = document.getElementById("music-label");
  const musicSelect = document.getElementById("music-select");

  function getSelectedSongLabel() {
    if (!musicSelect || !musicSelect.selectedOptions.length) return "our song";
    return musicSelect.selectedOptions[0].dataset.label || "our song";
  }

  function setMusicLabel(isPlaying) {
    if (!musicLabel) return;
    const title = getSelectedSongLabel();
    const action = isPlaying ? "Pause" : "Play";
    musicLabel.textContent = title ? `${action} ${title}` : `${action} our song`;
  }

  function playMusic() {
    if (!music || !musicBtn || !musicLabel) return;
    music
      .play()
      .then(() => {
        musicBtn.classList.remove("paused");
        setMusicLabel(true);
      })
      .catch(() => {
        // Autoplay blocked by browser – just ignore
      });
  }

  function pauseMusic() {
    if (!music || !musicBtn || !musicLabel) return;
    music.pause();
    musicBtn.classList.add("paused");
    setMusicLabel(false);
  }

  function setMusicSource(src) {
    if (!music || !src) return;
    const wasPlaying = !music.paused;
    music.pause();
    music.currentTime = 0;
    music.src = src;
    if (musicSelect && musicSelect.value !== src) {
      musicSelect.value = src;
    }
    if (wasPlaying) {
      playMusic();
    } else {
      setMusicLabel(false);
    }
  }

  const PLAYLIST_ORDER = [
    "music/our_song.mp3",
    "music/here-with-me.mp3",
    "music/kalam.mp3",
    "music/baadem-alby.mp3",
  ];

  const playlist = musicSelect
    ? PLAYLIST_ORDER.map((track) => {
        const option = Array.from(musicSelect.options || []).find(
          (opt) => opt.value === track
        );
        return option ? option.value : null;
      }).filter(Boolean)
    : [];

  function findPlaylistIndex(src) {
    if (!src) return -1;
    return playlist.findIndex((track) => src.includes(track));
  }

  function playNextTrack() {
    if (!music || !playlist.length) return;

    const currentSrc = music.currentSrc || music.src;
    const currentIndex = findPlaylistIndex(currentSrc);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];

    if (nextTrack) {
      setMusicSource(nextTrack);
      playMusic();
    }
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

  if (musicSelect && music) {
    const initialOption = musicSelect.selectedOptions[0];
    if (initialOption && initialOption.value) {
      setMusicSource(initialOption.value);
    }
    setMusicLabel(false);

    musicSelect.addEventListener("change", (event) => {
      const selected = event.target.selectedOptions[0];
      if (!selected) return;
      setMusicSource(selected.value);
      setMusicLabel(!music.paused);
    });

    music.addEventListener("ended", () => {
      playNextTrack();
    });
  } else {
    setMusicLabel(false);
  }
  // ===== Since-counter =====
  const sinceCounters = document.querySelectorAll("[data-since-counter]");
  const DEFAULT_START = "2024-12-05T00:00:00+02:00";
  const EGYPT_OFFSET_MINUTES = 120; // UTC+02:00

  function toEgyptDate(dateLike) {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(date.getTime())) return null;
    const utcMs = date.getTime();
    return new Date(utcMs + EGYPT_OFFSET_MINUTES * 60000);
  }

  function parseEgyptDate(value) {
    if (!value) return null;
    return toEgyptDate(value);
  }

  function calculateDuration(startDate) {
    const now = toEgyptDate(Date.now());

    if (!now || !startDate) return null;

    let years = now.getUTCFullYear() - startDate.getUTCFullYear();
    let months = now.getUTCMonth() - startDate.getUTCMonth();
    let days = now.getUTCDate() - startDate.getUTCDate();

    if (days < 0) {
      const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
      days += prevMonth.getUTCDate();
      months -= 1;
    }

    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const anchor = new Date(startDate);
    anchor.setUTCFullYear(startDate.getUTCFullYear() + years);
    anchor.setUTCMonth(startDate.getUTCMonth() + months);
    anchor.setUTCDate(startDate.getUTCDate() + days);

    const remainingMs = Math.max(0, now.getTime() - anchor.getTime());
    const hours = Math.floor(remainingMs / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    return { years, months, days, hours, minutes, seconds };
  }

  function updateCounters() {
    sinceCounters.forEach((counter) => {
      const startString = counter.dataset.counterStart || DEFAULT_START;
      const startDate = parseEgyptDate(startString);
      if (!startDate || Number.isNaN(startDate.getTime())) return;

      const parts = calculateDuration(startDate);
      if (!parts) return;
      const mappings = {
        "[data-counter-years]": parts.years,
        "[data-counter-months]": parts.months,
        "[data-counter-days]": parts.days,
        "[data-counter-hours]": parts.hours,
        "[data-counter-minutes]": parts.minutes,
        "[data-counter-seconds]": parts.seconds,
      };

      Object.entries(mappings).forEach(([selector, value]) => {
        const el = counter.querySelector(selector);
        if (el) {
          el.textContent = value;
        }
      });
    });
  }

  if (sinceCounters.length) {
    updateCounters();
    setInterval(updateCounters, 1000);
  }

  // ===== Future plan photo auto-loader =====
  const weddingSlot = document.querySelector("[data-wedding-slot]");

  function showWeddingPhoto(src) {
    if (!weddingSlot) return;
    const image = weddingSlot.querySelector("[data-wedding-img]");
    const placeholder = weddingSlot.querySelector("[data-wedding-placeholder]");
    const note = weddingSlot.querySelector("[data-wedding-note]");

    if (image) {
      image.src = src;
      image.classList.add("visible");
    }
    if (placeholder) {
      placeholder.classList.add("hidden");
    }
    if (note) {
      note.classList.add("has-photo");
    }
  }

  function tryLoadWeddingPhoto() {
    if (!weddingSlot) return;

    const possiblePaths = [
      "images/wedding.jpg",
      "images/wedding.jpeg",
      "images/wedding.png",
      "images/wedding.webp",
    ];

    const attempt = (index) => {
      if (index >= possiblePaths.length) return;
      const candidate = possiblePaths[index];
      const testImg = new Image();
      testImg.onload = () => showWeddingPhoto(candidate);
      testImg.onerror = () => attempt(index + 1);
      testImg.src = `${candidate}?t=${Date.now()}`;
    };

    attempt(0);
  }

  tryLoadWeddingPhoto();

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
function initChatSequence(options) {
    const {
      sequenceSelector,
      buttonId,
      startText = "Start the chat",
      nextText = "Show the next message",
      completedText = "All messages revealed ❤️",
      finalHold = false,
      finalHoldText = "Hold to reveal",
      holdDuration = 1400,
    } = options;

    const steps = document.querySelectorAll(`${sequenceSelector} .chat-step`);
    const button = document.getElementById(buttonId);

    if (!steps.length || !button) return;
    let chatStepIndex = 0;
    let holdTimer;

   function showCurrentStep({ skipUpdate = false } = {}) {
      if (chatStepIndex >= steps.length) return;
      steps[chatStepIndex].classList.add("visible");
      chatStepIndex += 1;
      if (!skipUpdate) {
        updateButtonState();
      }
    }

    function updateButtonState() {
        button.classList.remove("hold-ready");
      button.classList.remove("holding");

      if (chatStepIndex === 0) {
        button.textContent = startText;
        return;
      }

      if (chatStepIndex >= steps.length) {
        button.textContent = completedText;
        button.disabled = true;
        return;
      }

      if (finalHold && chatStepIndex === steps.length - 1) {
        button.classList.add("hold-ready");
        button.textContent = finalHoldText;
      } else {
        button.textContent = nextText;
      }
    }

    updateButtonState();

    button.addEventListener("click", () => {
      if (finalHold && button.classList.contains("hold-ready")) return;
      showCurrentStep();
    });
     if (finalHold) {
      function startFinalHold(event) {
        if (!button.classList.contains("hold-ready")) return;
        event.preventDefault();
        if (holdTimer) clearTimeout(holdTimer);
        button.classList.add("holding");
        holdTimer = setTimeout(() => {
          button.classList.remove("holding");
          button.classList.remove("hold-ready");
          button.classList.add("explode");
          button.disabled = true;
          showCurrentStep({ skipUpdate: true });
          launchHeartBurst();
          setTimeout(() => {
            button.classList.add("gone");
          }, 620);
        }, holdDuration);
      }
       function cancelFinalHold() {
        if (!button.classList.contains("hold-ready")) return;
        button.classList.remove("holding");
        clearTimeout(holdTimer);
      }

      button.addEventListener("mousedown", startFinalHold);
      button.addEventListener("touchstart", (event) => startFinalHold(event), {
        passive: false,
      });
      window.addEventListener("mouseup", cancelFinalHold);
      window.addEventListener("touchend", cancelFinalHold);
      window.addEventListener("touchcancel", cancelFinalHold);
    }
   
  }
  initChatSequence({
    sequenceSelector: "#first-chat-sequence",
    buttonId: "first-chat-btn",
    completedText: "That was Our first chat, you were so Cute!",
  });

  initChatSequence({
    sequenceSelector: "#beginning-chat-sequence",
    buttonId: "beginning-chat-btn",
    completedText: "This is where everything began Mi Amour",
  });

  initChatSequence({
    sequenceSelector: "#life-chat-sequence",
    buttonId: "chat-sequence-btn",
    finalHold: true,
    finalHoldText: "Hold to hear the answer ✨",
    completedText: "This moment changed everything 💞, I can call you MINE!!",
  });
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

     whyBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const reason = LOVE_REASONS[reasonIndex];
      whyDisplay.textContent = reason;
      reasonIndex = (reasonIndex + 1) % LOVE_REASONS.length;
      createMiniHeart();
    });
  }
   // ===== Gallery page enhancements =====
  const galleryGrid = document.querySelector("[data-gallery-grid]");

  if (galleryGrid) {
    function buildGalleryCard(item) {
      const article = document.createElement("article");
      article.className = "gallery-card";

      if (item.title) {
        const heading = document.createElement("h3");
        heading.textContent = item.title;
        article.appendChild(heading);
      }

      const wrap = document.createElement("div");
      wrap.className = "gallery-img-wrap";

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.title || "";
      wrap.appendChild(img);

      article.appendChild(wrap);
      return article;
    }

    function renderGallery(items) {
      galleryGrid.innerHTML = "";
      items.forEach((item) => {
        galleryGrid.appendChild(buildGalleryCard(item));
      });
    }

    async function loadGalleryItems() {
      const placeholder = document.createElement("p");
      placeholder.className = "section-sub";
      placeholder.textContent = "Loading every photo for us...";
      galleryGrid.appendChild(placeholder);

      try {
        const response = await fetch("assets/data/gallery-images.json", { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(`Gallery list failed: ${response.status}`);
        }

        const galleryItems = await response.json();
        renderGallery(Array.isArray(galleryItems) ? galleryItems : []);
      } catch (error) {
        galleryGrid.innerHTML = "";
        const errorNote = document.createElement("p");
        errorNote.className = "section-sub";
        errorNote.textContent =
          "Couldn't load our gallery right now, but the photos are safe. Please refresh to try again.";
        galleryGrid.appendChild(errorNote);
        console.error(error);
      }
    }

    loadGalleryItems();
  }

  // ===== Page navigation highlighting =====
  const navPills = Array.from(document.querySelectorAll(".nav-buttons .nav-pill"));

  function setActiveNav(target) {
    navPills.forEach((btn) => btn.classList.remove("is-active"));
    if (target) target.classList.add("is-active");
  }

  if (navPills.length) {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    const matchingNav = navPills.find((btn) => {
      const href = btn.getAttribute("href");
      if (!href) return false;
      const hrefFile = href.split("/").pop();
      return hrefFile === currentPath || (currentPath === "" && hrefFile === "index.html");
    });

    setActiveNav(matchingNav || null);

    navPills.forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveNav(btn);
      });
    });
  }

  // ===== Back to top =====
  const backToTopButtons = document.querySelectorAll(".back-to-top");

  function handleBackToTopVisibility() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    backToTopButtons.forEach((btn) => {
      const offset = Math.min(scrollY * 0.02, 90);
      btn.style.bottom = 22 + offset + "px";
      if (scrollY > 160) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    });
  }

  if (backToTopButtons.length) {
    backToTopButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    window.addEventListener("scroll", handleBackToTopVisibility);
    handleBackToTopVisibility();
  }
});
