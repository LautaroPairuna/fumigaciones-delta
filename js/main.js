/* Completá los canales reales cuando los tengas.
   whatsapp: sólo dígitos, con código de país (54911...). Sin número, WhatsApp abre el mensaje y pide elegir un chat.
   instagram y facebook: URL https completa.
   email: dirección de Gmail u otro correo. */
const SITE = Object.freeze(Object.assign({
  brand: "Traza",
  whatsapp: "",
  instagram: "",
  facebook: "",
  email: "",
  phone: "",
  maps: "",
  coverage: "js/coverage-zone.json",
  addressExample: "Ej.: Av. Rivadavia 4500, Caballito",
  problemExample: ""
}, window.SITE_CONFIG || {}));

(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 900px)");
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("#site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const progress = document.querySelector("[data-scroll-progress]");

  function setMenu(open, returnFocus = false) {
    if (!nav || !menuToggle) return;
    const isOpen = mobile.matches && open;
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    nav.inert = mobile.matches && !isOpen;
    if (isOpen) window.requestAnimationFrame(() => {
      if (menuToggle.getAttribute("aria-expanded") === "true") nav.querySelector("a")?.focus({ preventScroll: true });
    });
    if (returnFocus) menuToggle.focus();
  }
  menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  nav?.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    const wasOpen = document.body.classList.contains("menu-open");
    setMenu(false);
    if (wasOpen) {
      const destination = document.querySelector(link.getAttribute("href"));
      if (destination) {
        destination.setAttribute("tabindex", "-1");
        destination.focus({ preventScroll: true });
      }
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (document.body.classList.contains("menu-open") && !header?.contains(event.target)) setMenu(false);
  });
  document.addEventListener("focusin", (event) => {
    if (document.body.classList.contains("menu-open") && !header?.contains(event.target)) setMenu(false);
  });
  mobile.addEventListener("change", () => setMenu(false));
  setMenu(false);

  let scrollScheduled = false;
  function updateScroll() {
    const top = window.scrollY;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle("is-scrolled", top > 16);
    if (progress) progress.style.transform = `scaleX(${available > 0 ? Math.min(top / available, 1) : 0})`;
    scrollScheduled = false;
  }
  function scheduleScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener("scroll", scheduleScroll, { passive: true });
  window.addEventListener("resize", scheduleScroll, { passive: true });
  updateScroll();

  // Al soltar el scroll, termina de encuadrar la sección más cercana.
  // No interrumpe el gesto: si la persona sigue scrolleando, se cancela.
  let settleTimer = 0;
  let intentTimer = 0;
  let animationFrame = 0;
  let animating = false;
  let pendingIntent = false;
  let origin = null;
  let pointerDown = false;
  let armedOrigin = 0;

  function stopSectionAnimation() {
    animating = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    document.documentElement.style.scrollBehavior = "";
  }

  function armSectionSettle() {
    clearTimeout(intentTimer);
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleOnSection, 170);
  }

  function noteScrollIntent() {
    if (reducedMotion.matches || document.body.classList.contains("menu-open")) return;
    if (origin == null) origin = window.scrollY;
    pendingIntent = true;
    if (animating) stopSectionAnimation();
    clearTimeout(intentTimer);
    intentTimer = window.setTimeout(() => {
      if (settleTimer) return;
      pendingIntent = false;
      origin = null;
    }, 500);
  }

  window.addEventListener("wheel", noteScrollIntent, { passive: true });
  window.addEventListener("touchstart", noteScrollIntent, { passive: true });
  document.addEventListener("pointerdown", (event) => {
    if (event.button > 0) return;
    pointerDown = true;
    armedOrigin = window.scrollY;
    if (animating) stopSectionAnimation();
  }, { passive: true });
  const releasePointer = () => { pointerDown = false; };
  document.addEventListener("pointerup", releasePointer, { passive: true });
  document.addEventListener("pointercancel", releasePointer, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (!animating) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "PageDown" || event.key === "PageUp" || event.key === "Home" || event.key === "End" || event.key === " ") stopSectionAnimation();
  }, { passive: true });
  window.addEventListener("scroll", () => {
    if (animating) return;
    if (pointerDown && !reducedMotion.matches && !document.body.classList.contains("menu-open")) {
      pendingIntent = true;
      if (origin == null) origin = armedOrigin;
    }
    if (!pendingIntent) return;
    armSectionSettle();
  }, { passive: true });
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    clearTimeout(settleTimer);
    clearTimeout(intentTimer);
    settleTimer = 0;
    stopSectionAnimation();
    pendingIntent = false;
    origin = null;
  });

  function settleOnSection() {
    settleTimer = 0;
    if (pointerDown) {
      armSectionSettle();
      return;
    }
    const travel = window.scrollY - (origin ?? window.scrollY);
    pendingIntent = false;
    origin = null;
    if (reducedMotion.matches || document.body.classList.contains("menu-open") || Math.abs(travel) < 1) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim()) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.matches("input, textarea, select, [contenteditable='true']")) return;

    const headerH = header?.getBoundingClientRect().height || 0;
    const viewH = window.innerHeight;
    const frameH = Math.max(1, viewH - headerH);
    const scroll = window.scrollY;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewH);
    if (maxScroll < 12) return;

    const points = [];
    let covered = false;
    document.querySelectorAll("main > section").forEach((section) => {
      const rect = section.getBoundingClientRect();
      const height = rect.height;
      if (height < 48) return;
      const top = rect.top + scroll;
      const start = clampScroll(top - headerH, 0, maxScroll);
      if (height > frameH + 20 && rect.top <= headerH + 10 && rect.bottom >= viewH - 10) covered = true;
      points.push(start);
      if (height > frameH + 20) {
        const end = clampScroll(top + height - viewH, 0, maxScroll);
        if (end - start > 24) points.push(end);
      }
    });
    if (covered) return;
    points.push(maxScroll);

    const unique = [];
    points.sort((a, b) => a - b).forEach((point) => {
      const previous = unique[unique.length - 1];
      if (previous == null || point - previous > 10) unique.push(point);
    });

    let target = null;
    let best = Infinity;
    const direction = Math.sign(travel);
    unique.forEach((point) => {
      const distance = Math.abs(point - scroll);
      if (target == null || distance < best - 8) {
        target = point;
        best = distance;
        return;
      }
      if (Math.abs(distance - best) > 36 || !direction) return;
      const candidateFollows = direction > 0 ? point >= scroll : point <= scroll;
      const currentFollows = direction > 0 ? target >= scroll : target <= scroll;
      if (candidateFollows && !currentFollows) {
        target = point;
        best = distance;
      }
    });
    if (target == null || best < 6 || best > viewH * 0.52) return;
    if (Math.abs(travel) < 28 && best > 64) return;

    const duration = Math.round(Math.min(700, Math.max(420, 320 + best * 0.4)));
    const startY = scroll;
    const delta = target - startY;
    const started = performance.now();
    animating = true;
    document.documentElement.style.scrollBehavior = "auto";
    const step = (now) => {
      if (!animating) return;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      window.scrollTo(0, startY + delta * eased);
      if (progress < 1) animationFrame = requestAnimationFrame(step);
      else stopSectionAnimation();
    };
    animationFrame = requestAnimationFrame(step);
  }

  function clampScroll(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  const navLinks = [...(nav?.querySelectorAll("a[href^='#']") || [])];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link) => {
          const current = link.hash === `#${entry.target.id}`;
          link.classList.toggle("is-current", current);
          if (current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    navLinks.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) sectionObserver.observe(section);
    });
    const hero = document.querySelector("#inicio");
    if (hero) new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) navLinks.forEach((link) => {
        link.classList.remove("is-current");
        link.removeAttribute("aria-current");
      });
    }, { threshold: 0.6 }).observe(hero);
  }

  // Las pestañas admiten enlaces compartibles sin guardar datos personales.
  const tabs = [...document.querySelectorAll("[data-service-tab]")];
  const panels = [...document.querySelectorAll("[data-service-panel]")];
  function selectService(key, { focus = false, updateUrl = false } = {}) {
    const selected = tabs.find((tab) => tab.dataset.serviceTab === key);
    if (!selected) return;
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle("is-active", active);
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.servicePanel !== key; });
    if (focus) selected.focus({ preventScroll: true });
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("servicio", key);
      window.history.replaceState(null, "", url);
    }
    scheduleScroll();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectService(tab.dataset.serviceTab, { updateUrl: true }));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectService(tabs[next].dataset.serviceTab, { focus: true, updateUrl: true });
    });
  });
  function restoreService() {
    const key = new URL(window.location.href).searchParams.get("servicio");
    selectService(tabs.some((tab) => tab.dataset.serviceTab === key) ? key : tabs[0]?.dataset.serviceTab);
  }
  window.addEventListener("popstate", restoreService);
  restoreService();

  // Una entrada discreta; el contenido sigue disponible sin JavaScript.
  const reveals = [...document.querySelectorAll("[data-reveal]")];
  let revealObserver;
  function revealEverything() {
    document.documentElement.classList.remove("js-motion");
    reveals.forEach((element) => element.classList.add("is-visible"));
    revealObserver?.disconnect();
  }
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-motion");
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    reveals.forEach((element) => revealObserver.observe(element));
  } else revealEverything();

  // El video sólo descarga y se reproduce cuando está visible.
  const video = document.querySelector("#hero-video");
  const backdropVideo = document.querySelector("#hero-backdrop-video");
  const batsVideo = document.querySelector("#bats-backdrop-video");
  const videoToggle = document.querySelector("[data-video-toggle]");
  const videoLabel = document.querySelector("[data-video-label]");
  const videoIcon = videoToggle?.querySelector(".video-control-icon");
  const connection = navigator.connection;
  const ambientVideos = [video, backdropVideo, batsVideo].filter(Boolean);
  const videoInView = new WeakMap();
  let videoPausedByUser = false;
  const videoAllowed = () => !reducedMotion.matches && !connection?.saveData;
  function ambientPlaying() {
    return ambientVideos.some((element) => videoInView.get(element) && !element.paused);
  }
  function updateVideoControl() {
    if (!videoToggle) return;
    const playing = ambientPlaying();
    const label = playing ? "Pausar ambiente" : "Reproducir ambiente";
    videoToggle.hidden = !videoAllowed();
    videoToggle.setAttribute("aria-label", label);
    videoToggle.setAttribute("aria-pressed", String(playing));
    if (videoLabel) videoLabel.textContent = label;
    if (videoIcon) videoIcon.textContent = playing ? "Ⅱ" : "▶";
  }
  function syncAmbient(element) {
    const shouldPlay = videoAllowed() && videoInView.get(element) && !document.hidden && !videoPausedByUser;
    if (!shouldPlay) {
      element.pause();
      element.classList.remove("is-playing");
      return;
    }
    if (element.dataset.loaded !== "true") {
      element.querySelectorAll("source[data-src]").forEach((source) => { source.src = source.dataset.src; });
      element.muted = true;
      element.load();
      element.dataset.loaded = "true";
    }
    if (element.dataset.playPending === "true" || !element.paused) return;
    element.dataset.playPending = "true";
    element.play().then(() => {
      if (!(videoAllowed() && videoInView.get(element) && !document.hidden && !videoPausedByUser)) element.pause();
    }).catch(() => {
      videoPausedByUser = true;
    }).finally(() => {
      element.dataset.playPending = "false";
      updateVideoControl();
    });
  }
  function syncVideo() {
    ambientVideos.forEach(syncAmbient);
    updateVideoControl();
  }
  if (ambientVideos.length) {
    ambientVideos.forEach((element) => {
      videoInView.set(element, false);
      element.addEventListener("play", () => {
        element.classList.add("is-playing");
        updateVideoControl();
      });
      element.addEventListener("pause", () => {
        element.classList.remove("is-playing");
        updateVideoControl();
      });
    });
    videoToggle?.addEventListener("click", () => {
      videoPausedByUser = ambientPlaying();
      syncVideo();
    });
    document.addEventListener("visibilitychange", syncVideo);
    connection?.addEventListener("change", syncVideo);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => videoInView.set(entry.target, entry.isIntersecting));
        syncVideo();
      }, { threshold: 0.1 });
      ambientVideos.forEach((element) => observer.observe(element));
    }
    updateVideoControl();
  }
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) revealEverything();
    syncVideo();
  });

  // Conversación guiada local. El visitante decide el envío real en WhatsApp.
  const form = document.querySelector("#quote-form");
  if (!form) return;
  const answer = document.querySelector("#wa-answer");
  const conversation = document.querySelector("#wa-conversation");
  const error = document.querySelector("#wa-error");
  const finish = document.querySelector("#wa-finish");
  const sendLink = document.querySelector("[data-quote-send]");
  const pending = document.querySelector("[data-contact-pending]");
  const hasContact = /^\d{10,15}$/.test(SITE.whatsapp);
  let stage = 0;
  let name = "";
  let problem = "";
  let address = "";
  let selectedPest = "";
  let replyTimer;
  let dirty = false;
  const chatScroll = () => reducedMotion.matches ? "auto" : "smooth";

  function bubble(message, outgoing = false) {
    const node = document.createElement("div");
    node.className = "wa-bubble " + (outgoing ? "wa-outgoing" : "wa-incoming");
    if (!outgoing) {
      const sender = document.createElement("span");
      sender.className = "wa-sender";
      sender.textContent = "Cotizador";
      node.append(sender);
    }
    const text = document.createElement("span");
    text.textContent = message;
    node.append(text);
    const time = document.createElement("span");
    time.className = "wa-time";
    time.textContent = "ahora" + (outgoing ? " ✓✓" : "");
    node.append(time);
    if (!outgoing) {
      conversation.append(node);
      node.scrollIntoView({ block: "nearest", behavior: chatScroll() });
      return;
    }
    const row = document.createElement("div");
    row.className = "wa-outrow";
    const mark = document.createElement("span");
    mark.className = "wa-user-logo";
    mark.setAttribute("aria-hidden", "true");
    const source = document.querySelector(".wa-avatar .brand-mark");
    if (source) mark.append(source.cloneNode(true));
    row.append(node, mark);
    conversation.append(row);
    row.scrollIntoView({ block: "nearest", behavior: chatScroll() });
  }

  function reply(message, after) {
    const typing = document.createElement("div");
    typing.className = "wa-typing";
    typing.setAttribute("aria-label", "Cotizador está escribiendo");
    typing.textContent = "•••";
    conversation.append(typing);
    typing.scrollIntoView({ block: "nearest", behavior: chatScroll() });
    replyTimer = window.setTimeout(() => {
      typing.remove();
      bubble(message);
      if (after) after();
    }, 550);
  }

  function setError(message) {
    error.textContent = message;
    answer.setAttribute("aria-invalid", String(Boolean(message)));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (stage > 2) return;
    const value = answer.value.trim().replace(/\s+/g, " ");
    const minimum = stage === 0 ? 2 : stage === 1 ? 8 : 6;
    if (value.length < minimum) {
      setError(stage === 0 ? "Escribí tu nombre o el de tu empresa." : stage === 1 ? "Contanos un poco más sobre el problema para poder ayudarte." : "Escribí la dirección donde hace falta el servicio.");
      answer.focus();
      return;
    }
    setError("");
    dirty = true;
    bubble(value, true);
    answer.value = "";
    answer.disabled = true;
    form.querySelector("button").disabled = true;
    if (stage === 0) {
      name = value;
      stage = 1;
      reply("Gracias, " + name + ". Contame qué necesitás resolver: qué viste, dónde aparece y en qué tipo de espacio.", () => {
        answer.placeholder = selectedPest ? "Ej.: Tengo " + selectedPest + " en mi espacio…" : (SITE.problemExample || "Ej.: Tengo ratas en el galpón de mi empresa…");
        answer.setAttribute("autocomplete", "off");
        form.querySelector("label").textContent = "Describí tu problema";
        answer.disabled = false;
        form.querySelector("button").disabled = false;
        answer.focus();
      });
    } else if (stage === 1) {
      problem = value;
      stage = 2;
      reply("¿En qué dirección está el lugar? Con la calle y el barrio alcanza.", () => {
        answer.placeholder = SITE.addressExample;
        answer.setAttribute("autocomplete", "street-address");
        form.querySelector("label").textContent = "Dirección del lugar";
        answer.disabled = false;
        form.querySelector("button").disabled = false;
        answer.focus();
      });
    } else {
      address = value;
      stage = 3;
      reply("Podemos ayudarte a resolverlo. Te conectamos con un asesor para evaluar el caso y coordinar los próximos pasos.", () => {
        const message = ["Hola " + SITE.brand + ", soy " + name + ".", selectedPest ? "Consulta por: " + selectedPest + "." : "", "Necesito ayuda con esto: " + problem, "Dirección: " + address, "Quisiera hablar con un asesor para evaluar el tratamiento y coordinar."].filter(Boolean).join("\n");
        sendLink.href = (hasContact ? "https://wa.me/" + SITE.whatsapp : "https://wa.me/") + "?text=" + encodeURIComponent(message);
        form.hidden = true;
        finish.hidden = false;
        pending.hidden = hasContact;
        sendLink.focus({ preventScroll: true });
        finish.scrollIntoView({ block: "nearest", behavior: chatScroll() });
      });
    }
  });
  answer.addEventListener("input", () => { dirty = true; if (error.textContent) setError(""); });
  sendLink.addEventListener("click", () => { dirty = false; });
  document.querySelector("[data-quote-restart]")?.addEventListener("click", () => {
    window.clearTimeout(replyTimer);
    stage = 0;
    name = "";
    problem = "";
    address = "";
    selectedPest = "";
    dirty = false;
    conversation.querySelectorAll(".wa-outrow, .wa-outgoing, .wa-typing").forEach(node => node.remove());
    conversation.querySelectorAll(".wa-incoming").forEach((node, index) => { if (index > 0) node.remove(); });
    finish.hidden = true;
    form.hidden = false;
    answer.value = "";
    answer.placeholder = "Escribí tu nombre o empresa…";
    answer.setAttribute("autocomplete", "name");
    answer.disabled = false;
    form.querySelector("button").disabled = false;
    form.querySelector("label").textContent = "Tu nombre o empresa";
    setError("");
    answer.focus();
  });
  document.addEventListener("traza:select-pest", (event) => {
    selectedPest = event.detail?.pest || "";
    if (stage === 1) answer.placeholder = "Ej.: Tengo " + selectedPest + " en mi espacio…";
  });
  document.querySelectorAll("[data-asesoria]").forEach((link) => {
    const message = link.dataset.asesoria === "zona"
      ? "Hola " + SITE.brand + ". Quiero consultar si atienden mi barrio."
      : "Hola " + SITE.brand + ". Quiero asesorarme sobre el control de plagas en mi espacio.";
    link.href = (hasContact ? "https://wa.me/" + SITE.whatsapp : "https://wa.me/") + "?text=" + encodeURIComponent(message);
  });
  document.querySelectorAll("[data-channel]").forEach((link) => {
    const kind = link.dataset.channel;
    if (kind === "whatsapp") {
      const message = "Hola " + SITE.brand + ". Quiero consultar por un servicio.";
      link.href = (hasContact ? "https://wa.me/" + SITE.whatsapp : "https://wa.me/") + "?text=" + encodeURIComponent(message);
    } else if (kind === "instagram" && /^https:\/\/(www\.)?instagram\.com\//.test(SITE.instagram)) {
      link.href = SITE.instagram;
    } else if (kind === "facebook" && /^https:\/\/(www\.)?facebook\.com\//.test(SITE.facebook)) {
      link.href = SITE.facebook;
    } else if (kind === "gmail") {
      const address = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SITE.email) ? SITE.email : "";
      const subject = encodeURIComponent("Consulta " + SITE.brand);
      const body = encodeURIComponent("Hola " + SITE.brand + ". Quiero consultar por un servicio.");
      link.href = "mailto:" + address + "?subject=" + subject + "&body=" + body;
    } else if (kind === "phone" && /^\d{8,15}$/.test(SITE.phone)) {
      link.href = "tel:+" + SITE.phone;
    } else if (kind === "maps" && /^https:\/\/(www\.)?google\.[^/]+\/maps\//.test(SITE.maps)) {
      link.href = SITE.maps;
    }
  });
  document.querySelectorAll("[data-contact-whatsapp]").forEach((link) => {
    link.hidden = !hasContact;
    if (hasContact) link.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent("Hola " + SITE.brand + ". Quiero consultar por un servicio.");
  });
  document.querySelectorAll("[data-instagram]").forEach((link) => {
    const valid = /^https:\/\/(www\.)?instagram\.com\//.test(SITE.instagram);
    link.hidden = !valid;
    if (valid) { link.href = SITE.instagram; link.target = "_blank"; link.rel = "noopener noreferrer"; }
  });
  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  const coverageMapEl = document.querySelector("#coverage-map");
  if (coverageMapEl && window.L) {
    const map = L.map(coverageMapEl, {
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      zoomSnap: 0.05,
      fadeAnimation: false,
      zoomAnimation: false
    });
    map.attributionControl.setPrefix(false);
    map.getContainer().removeAttribute("tabindex");
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, OpenStreetMap'
    }).addTo(map);
    const deltaMap = document.documentElement.classList.contains("theme-delta");
    let zoneLayer = null;
    let zoneBounds = null;
    let frameQueued = false;
    const nearbyBounds = (geojson) => {
      const geometry = geojson && geojson.geometry;
      const polygons = !geometry ? [] : geometry.type === "MultiPolygon" ? geometry.coordinates : geometry.type === "Polygon" ? [geometry.coordinates] : [];
      const boxes = polygons.map((polygon) => {
        const ring = polygon[0] || [];
        let south = Infinity;
        let north = -Infinity;
        let west = Infinity;
        let east = -Infinity;
        ring.forEach(([lon, lat]) => {
          if (lat < south) south = lat;
          if (lat > north) north = lat;
          if (lon < west) west = lon;
          if (lon > east) east = lon;
        });
        return L.latLngBounds([south, west], [north, east]);
      }).filter((bounds) => bounds.isValid());
      if (!boxes.length) return null;
      const span = (bounds) => bounds.getSouthWest().distanceTo(bounds.getNorthEast());
      const largest = boxes.reduce((best, bounds) => span(bounds) > span(best) ? bounds : best);
      const center = largest.getCenter();
      const keep = boxes.filter((bounds) => bounds.getCenter().distanceTo(center) < 80000);
      return keep.slice(1).reduce((bounds, box) => bounds.extend(box), L.latLngBounds(keep[0].getSouthWest(), keep[0].getNorthEast()));
    };
    const frame = () => {
      map.invalidateSize({ animate: false, pan: false });
      const size = map.getSize();
      if (!zoneLayer || size.x < 40 || size.y < 40) return;
      const wide = size.x >= 900;
      const bounds = zoneBounds || zoneLayer.getBounds();
      const padLeft = wide ? Math.round(size.x * 0.4) : 18;
      const padTop = wide && deltaMap ? Math.round(size.y * 0.16) : 28;
      const padRight = wide && deltaMap ? Math.round(size.x * 0.035) : 24;
      const padBottom = wide && deltaMap ? Math.round(size.y * 0.07) : 26;
      map.fitBounds(bounds, {
        paddingTopLeft: [padLeft, padTop],
        paddingBottomRight: [padRight, padBottom],
        animate: false
      });
    };
    const requestFrame = () => {
      if (frameQueued) return;
      frameQueued = true;
      requestAnimationFrame(() => {
        frameQueued = false;
        frame();
      });
    };
    const dressCoverage = (layer) => {
      const path = layer.getElement();
      if (!path || path.dataset.dressed) return;
      path.id = "coverage-shape";
      path.dataset.dressed = "1";
      const svg = path.ownerSVGElement;
      const ns = "http://www.w3.org/2000/svg";
      let defs = svg.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS(ns, "defs");
        svg.insertBefore(defs, svg.firstChild);
      }
      const clip = document.createElementNS(ns, "clipPath");
      clip.id = "coverage-clip";
      clip.setAttribute("clipPathUnits", "userSpaceOnUse");
      const clipShape = document.createElementNS(ns, "use");
      clipShape.setAttribute("href", "#coverage-shape");
      clip.appendChild(clipShape);
      defs.appendChild(clip);
      const rim = document.createElementNS(ns, "use");
      rim.id = "coverage-rim";
      rim.setAttribute("href", "#coverage-shape");
      rim.setAttribute("clip-path", "url(#coverage-clip)");
      rim.setAttribute("fill", "none");
      rim.setAttribute("stroke", zoneRim);
      rim.setAttribute("stroke-width", "16");
      rim.setAttribute("stroke-opacity", "0.55");
      rim.setAttribute("stroke-linejoin", "round");
      rim.setAttribute("pointer-events", "none");
      path.parentNode.insertBefore(rim, path);
    };
    const tone = (name, fallback) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value || fallback;
    };
    const zoneFill = tone("--zone-fill", "#248a4a");
    const zoneLine = tone("--zone-line", "#0c3320");
    const zoneRim = tone("--zone-rim", "#0e5c34");
    const zoneHalo = tone("--zone-halo", "#ffffff");
    const zoneOpacity = Number(tone("--zone-opacity", "0.2")) || 0.2;
    fetch(SITE.coverage)
      .then((response) => {
        if (!response.ok) throw new Error("mapa");
        return response.json();
      })
      .then((data) => {
        const quiet = { interactive: false, bubblingMouseEvents: false, smoothFactor: 0.6 };
        L.geoJSON(data, {
          ...quiet,
          style: { color: zoneHalo, weight: 3.1, opacity: 1, fill: false, lineJoin: "round", lineCap: "round" }
        }).addTo(map);
        zoneLayer = L.geoJSON(data, {
          ...quiet,
          style: { color: zoneLine, weight: 1.85, opacity: 1, fillColor: zoneFill, fillOpacity: zoneOpacity, lineJoin: "round", lineCap: "round" },
          onEachFeature(feature, layer) {
            layer.on("add", () => dressCoverage(layer));
          }
        }).addTo(map);
        zoneBounds = deltaMap ? nearbyBounds(data) : null;
        requestFrame();
      })
      .catch(() => coverageMapEl.classList.add("is-unavailable"));
    if ("ResizeObserver" in window) new ResizeObserver(requestFrame).observe(coverageMapEl);
    window.addEventListener("resize", requestFrame);
  }
})();
