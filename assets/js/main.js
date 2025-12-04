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
  const EGYPT_TIMEZONE = "Africa/Cairo";
  const ONE_HOUR_MS = 60 * 60 * 1000;

  function getEgyptTime() {
    // Convert "now" into Cairo wall time, then apply the requested one-hour back offset.
    const cairoString = new Date().toLocaleString("en-US", { timeZone: EGYPT_TIMEZONE });
    const cairoDate = new Date(cairoString);
    return new Date(cairoDate.getTime() - ONE_HOUR_MS);
  }

  function parseEgyptDate(value) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function calculateDuration(startDate) {
    const now = getEgyptTime();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();

    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }

    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const anchor = new Date(startDate);
    anchor.setFullYear(startDate.getFullYear() + years);
    anchor.setMonth(startDate.getMonth() + months);
    anchor.setDate(startDate.getDate() + days);

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
    const featuredMemories = [
      {
        src: "images/IMG-20251204-WA0043.jpg",
        title: "Our first snap from that day",
        alt: "One of our earliest photos together",
      },
      {
        src: "images/IMG-20251204-WA0123.jpg",
        title: "Your smile I adore",
        alt: "A favorite smiling photo",
      },
      {
        src: "images/IMG-20251204-WA0209.jpg",
        title: "A cozy moment",
        alt: "A cozy moment together",
      },
      {
        src: "images/IMG-20251204-WA0291.jpg",
        title: "Us on the move",
        alt: "A candid shot while we were out",
      },
      {
        src: "images/wedding.png",
        title: "Our wedding vision",
        alt: "Illustration of our dream wedding",
      },
    ];

    const extraPhotos = [
      "IMG-20251204-WA0043.jpg",
      "IMG-20251204-WA0044.jpg",
      "IMG-20251204-WA0045.jpg",
      "IMG-20251204-WA0046.jpg",
      "IMG-20251204-WA0047.jpg",
      "IMG-20251204-WA0050.jpg",
      "IMG-20251204-WA0051.jpg",
      "IMG-20251204-WA0052.jpg",
      "IMG-20251204-WA0053.jpg",
      "IMG-20251204-WA0054.jpg",
      "IMG-20251204-WA0055.jpg",
      "IMG-20251204-WA0056.jpg",
      "IMG-20251204-WA0057.jpg",
      "IMG-20251204-WA0058.jpg",
      "IMG-20251204-WA0059.jpg",
      "IMG-20251204-WA0060.jpg",
      "IMG-20251204-WA0061.jpg",
      "IMG-20251204-WA0062.jpg",
      "IMG-20251204-WA0063.jpg",
      "IMG-20251204-WA0064.jpg",
      "IMG-20251204-WA0065.jpg",
      "IMG-20251204-WA0066.jpg",
      "IMG-20251204-WA0067.jpg",
      "IMG-20251204-WA0068.jpg",
      "IMG-20251204-WA0069.jpg",
      "IMG-20251204-WA0070.jpg",
      "IMG-20251204-WA0071.jpg",
      "IMG-20251204-WA0072.jpg",
      "IMG-20251204-WA0073.jpg",
      "IMG-20251204-WA0074.jpg",
      "IMG-20251204-WA0075.jpg",
      "IMG-20251204-WA0076.jpg",
      "IMG-20251204-WA0077.jpg",
      "IMG-20251204-WA0078.jpg",
      "IMG-20251204-WA0079.jpg",
      "IMG-20251204-WA0080.jpg",
      "IMG-20251204-WA0081.jpg",
      "IMG-20251204-WA0082.jpg",
      "IMG-20251204-WA0083.jpg",
      "IMG-20251204-WA0084.jpg",
      "IMG-20251204-WA0085.jpg",
      "IMG-20251204-WA0086.jpg",
      "IMG-20251204-WA0087.jpg",
      "IMG-20251204-WA0088.jpg",
      "IMG-20251204-WA0089.jpg",
      "IMG-20251204-WA0090.jpg",
      "IMG-20251204-WA0091.jpg",
      "IMG-20251204-WA0092.jpg",
      "IMG-20251204-WA0093.jpg",
      "IMG-20251204-WA0094.jpg",
      "IMG-20251204-WA0095.jpg",
      "IMG-20251204-WA0096.jpg",
      "IMG-20251204-WA0097.jpg",
      "IMG-20251204-WA0098.jpg",
      "IMG-20251204-WA0099.jpg",
      "IMG-20251204-WA0100.jpg",
      "IMG-20251204-WA0101.jpg",
      "IMG-20251204-WA0102.jpg",
      "IMG-20251204-WA0103.jpg",
      "IMG-20251204-WA0104.jpg",
      "IMG-20251204-WA0105.jpg",
      "IMG-20251204-WA0106.jpg",
      "IMG-20251204-WA0107.jpg",
      "IMG-20251204-WA0108.jpg",
      "IMG-20251204-WA0109.jpg",
      "IMG-20251204-WA0110.jpg",
      "IMG-20251204-WA0111.jpg",
      "IMG-20251204-WA0112.jpg",
      "IMG-20251204-WA0113.jpg",
      "IMG-20251204-WA0114.jpg",
      "IMG-20251204-WA0115.jpg",
      "IMG-20251204-WA0116.jpg",
      "IMG-20251204-WA0117.jpg",
      "IMG-20251204-WA0118.jpg",
      "IMG-20251204-WA0119.jpg",
      "IMG-20251204-WA0120.jpg",
      "IMG-20251204-WA0121.jpg",
      "IMG-20251204-WA0122.jpg",
      "IMG-20251204-WA0123.jpg",
      "IMG-20251204-WA0124.jpg",
      "IMG-20251204-WA0125.jpg",
      "IMG-20251204-WA0126.jpg",
      "IMG-20251204-WA0127.jpg",
      "IMG-20251204-WA0128.jpg",
      "IMG-20251204-WA0129.jpg",
      "IMG-20251204-WA0130.jpg",
      "IMG-20251204-WA0131.jpg",
      "IMG-20251204-WA0132.jpg",
      "IMG-20251204-WA0133.jpg",
      "IMG-20251204-WA0134.jpg",
      "IMG-20251204-WA0135.jpg",
      "IMG-20251204-WA0136.jpg",
      "IMG-20251204-WA0137.jpg",
      "IMG-20251204-WA0138.jpg",
      "IMG-20251204-WA0139.jpg",
      "IMG-20251204-WA0140.jpg",
      "IMG-20251204-WA0141.jpg",
      "IMG-20251204-WA0142.jpg",
      "IMG-20251204-WA0143.jpg",
      "IMG-20251204-WA0144.jpg",
      "IMG-20251204-WA0145.jpg",
      "IMG-20251204-WA0146.jpg",
      "IMG-20251204-WA0147.jpg",
      "IMG-20251204-WA0148.jpg",
      "IMG-20251204-WA0149.jpg",
      "IMG-20251204-WA0150.jpg",
      "IMG-20251204-WA0151.jpg",
      "IMG-20251204-WA0152.jpg",
      "IMG-20251204-WA0153.jpg",
      "IMG-20251204-WA0154.jpg",
      "IMG-20251204-WA0155.jpg",
      "IMG-20251204-WA0156.jpg",
      "IMG-20251204-WA0157.jpg",
      "IMG-20251204-WA0158.jpg",
      "IMG-20251204-WA0159.jpg",
      "IMG-20251204-WA0160.jpg",
      "IMG-20251204-WA0161.jpg",
      "IMG-20251204-WA0162.jpg",
      "IMG-20251204-WA0163.jpg",
      "IMG-20251204-WA0164.jpg",
    ];

    const galleryItems = [
      ...featuredMemories,
      ...extraPhotos.map((file) => ({
        src: `images/${file}`,
        alt: "One of our favorite memories",
      })),
    ];



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
      img.alt = item.alt || item.title || "A favorite memory";
      wrap.appendChild(img);

      article.appendChild(wrap);
      return article;
    }

    function renderGallery() {
      galleryGrid.innerHTML = "";
      galleryItems.forEach((item) => {
        galleryGrid.appendChild(buildGalleryCard(item));
      });
    }

    renderGallery();
    

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
