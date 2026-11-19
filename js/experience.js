/* Traza: explorar las señales de un espacio, sin interrumpir su recorrido. */
(() => {
  "use strict";

  const inspectionNotes = {
    refugios: {
      title: "Detrás de lo cotidiano.",
      text: "Juntas, zócalos y espacios de difícil acceso: buscamos rastros para entender dónde se concentra la actividad.",
      label: "Refugios",
    },
    accesos: {
      title: "El recorrido también importa.",
      text: "Revisamos encuentros, aberturas y pasos de instalaciones. Detectar posibles entradas ayuda a definir la prevención.",
      label: "Accesos",
    },
    humedad: {
      title: "El entorno deja pistas.",
      text: "Los puntos con agua y restos de alimento son parte de la inspección. El diagnóstico relaciona las señales con el uso del espacio.",
      label: "Humedad y alimento",
    },
  };
  const pestKeys = new Set(["cucarachas", "hormigas", "roedores", "mosquitos"]);
  const number = new Intl.NumberFormat("es-AR", { minimumIntegerDigits: 2, useGrouping: false });

  function updateSearch(key, value) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    // La versión servida tiene historial compartible; abrir el HTML como
    // archivo también mantiene operativos los controles si el navegador lo limita.
    try { window.history.replaceState(null, "", url); } catch { /* file: fallback */ }
  }

  const scene = document.querySelector("[data-inspection-scene]");
  const inspectionToggle = document.querySelector("[data-inspection-toggle]");
  const inspectionLabel = document.querySelector("[data-inspection-toggle-label]");
  const overlay = document.querySelector("[data-inspection-overlay]");
  const detail = document.querySelector("[data-inspection-detail]");
  const inspectionStatus = document.querySelector("[data-inspection-status]");
  const points = [...document.querySelectorAll("[data-inspection-point]")]
    .filter(point => Object.hasOwn(inspectionNotes, point.dataset.inspectionPoint));

  if (scene && inspectionToggle && overlay && detail && points.length) {
    let activePoint = points[0].dataset.inspectionPoint;
    let inspecting = false;
    const detailTitle = detail.querySelector("[data-inspection-title]");
    const detailText = detail.querySelector("[data-inspection-text]");
    const detailIndex = detail.querySelector("[data-inspection-index]");

    function renderPoint(key, announce = false) {
      const pointIndex = points.findIndex(point => point.dataset.inspectionPoint === key);
      if (pointIndex < 0) return;
      activePoint = key;
      const note = inspectionNotes[key];
      points.forEach(point => {
        const selected = point.dataset.inspectionPoint === key;
        point.setAttribute("aria-pressed", String(selected));
        point.classList.toggle("is-selected", selected);
      });
      scene.dataset.inspectionFocus = key;
      if (detailTitle) detailTitle.textContent = note.title;
      if (detailText) detailText.textContent = note.text;
      if (detailIndex) detailIndex.textContent = `${number.format(pointIndex + 1)} / ${number.format(points.length)}`;
      if (announce && inspectionStatus) inspectionStatus.textContent = `${note.label}. ${note.title} ${note.text}`;
    }

    function setInspection(active, { announce = false, updateUrl = false } = {}) {
      if (!active && (overlay.contains(document.activeElement) || detail.contains(document.activeElement))) {
        inspectionToggle.focus({ preventScroll: true });
      }
      inspecting = active;
      scene.classList.toggle("is-inspecting", active);
      overlay.hidden = !active;
      detail.hidden = false;
      if (active) renderPoint(activePoint);
      else {
        if (detailTitle) detailTitle.textContent = "Un espacio cotidiano.";
        if (detailText) detailText.textContent = "Activá la mirada experta y explorá tres puntos que se revisan durante una inspección.";
        if (detailIndex) detailIndex.textContent = "Vista habitual";
      }
      inspectionToggle.setAttribute("aria-pressed", String(active));
      const label = active ? "Volver a la vista habitual" : "Activar mirada experta";
      if (inspectionLabel) inspectionLabel.textContent = label;
      inspectionToggle.setAttribute("aria-label", label);
      if (announce && inspectionStatus) {
        inspectionStatus.textContent = active
          ? "Mirada experta activada. Explorá los puntos de una inspección ilustrativa."
          : "Vista habitual. Podés volver a explorar los puntos de inspección.";
      }
      if (updateUrl) updateSearch("inspeccion", active ? activePoint : "");
    }

    inspectionToggle.addEventListener("click", () => {
      if (!inspecting) activePoint = points[0].dataset.inspectionPoint;
      setInspection(!inspecting, { announce: true, updateUrl: true });
    });
    points.forEach(point => point.addEventListener("click", () => {
      renderPoint(point.dataset.inspectionPoint, true);
      updateSearch("inspeccion", activePoint);
    }));

    function restoreInspection() {
      const key = new URL(window.location.href).searchParams.get("inspeccion");
      const requested = points.some(point => point.dataset.inspectionPoint === key);
      renderPoint(requested ? key : activePoint);
      setInspection(requested);
    }
    window.addEventListener("popstate", restoreInspection);
    restoreInspection();
    scene.classList.add("inspection-ready");
  }

  const panels = [...document.querySelectorAll("[data-pest-panel]")];
  const tabs = [...document.querySelectorAll("[data-pest-tab]")]
    .filter(tab => pestKeys.has(tab.dataset.pestTab) && panels.some(panel => panel.dataset.pestPanel === tab.dataset.pestTab));

  if (tabs.length) {
    function selectPest(key, { focus = false, updateUrl = false } = {}) {
      const selected = tabs.find(tab => tab.dataset.pestTab === key);
      if (!selected) return;
      tabs.forEach(tab => {
        const active = tab === selected;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle("is-active", active);
      });
      panels.forEach(panel => { panel.hidden = panel.dataset.pestPanel !== key; });
      if (focus) selected.focus({ preventScroll: true });
      if (updateUrl) updateSearch("plaga", key);
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectPest(tab.dataset.pestTab, { updateUrl: true }));
      tab.addEventListener("keydown", event => {
        let next;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectPest(tabs[next].dataset.pestTab, { focus: true, updateUrl: true });
      });
    });

    function restorePest() {
      const requested = new URL(window.location.href).searchParams.get("plaga");
      const key = tabs.some(tab => tab.dataset.pestTab === requested) ? requested : tabs[0].dataset.pestTab;
      selectPest(key);
    }
    window.addEventListener("popstate", restorePest);
    restorePest();
  }

  document.querySelectorAll("[data-pest-quote]").forEach(link => {
    link.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const pest = link.dataset.pestQuote;
      if (!pestKeys.has(pest)) return;
      document.dispatchEvent(new CustomEvent("traza:select-pest", { detail: { pest } }));
    });
  });
})();
