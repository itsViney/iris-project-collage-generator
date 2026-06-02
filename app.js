const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1700;
const STORAGE_KEY = "iris-collage-generator-preferences";

const templates = [
  {
    id: "website",
    name: "Website Showcase",
    description: "Desktop screenshots in the centre with mobile screenshots on both sides.",
    background: "#5b97ad",
    rotation: -3,
    scale: 1.08,
    grid: {
      x: 0,
      y: 0,
      w: 2000,
      h: 1700,
      columns: [400, 1200, 400],
      rows: [540, 310, 310, 540]
    },
    slots: [
      { id: "left-tall-1", col: 1, row: 1, rowSpan: 2, z: 1 },
      { id: "left-tall-2", col: 1, row: 3, rowSpan: 2, z: 1 },
      { id: "desktop-top", col: 2, row: 1, z: 2 },
      { id: "desktop-main", col: 2, row: 2, rowSpan: 2, z: 3 },
      { id: "desktop-bottom", col: 2, row: 4, z: 2 },
      { id: "right-tall-1", col: 3, row: 1, rowSpan: 2, z: 1 },
      { id: "right-tall-2", col: 3, row: 3, rowSpan: 2, z: 1 }
    ]
  },
  {
    id: "mixed",
    name: "Mixed Grid",
    description: "A varied grid of square, vertical and horizontal artwork tiles.",
    background: "#94aa61",
    rotation: -3,
    scale: 1.12,
    grid: {
      x: 0,
      y: 50,
      w: 2000,
      h: 1600,
      columns: [400, 400, 400, 400, 400],
      rows: [400, 400, 400, 400]
    },
    slots: [
      { id: "tall-left", col: 1, row: 1, rowSpan: 2, z: 1 },
      { id: "wide-top", col: 2, row: 1, colSpan: 2, z: 1 },
      { id: "tall-top", col: 4, row: 1, rowSpan: 2, z: 1 },
      { id: "square-top-right", col: 5, row: 1, z: 1 },
      { id: "square-mid-a", col: 2, row: 2, z: 2 },
      { id: "square-mid-b", col: 3, row: 2, z: 2 },
      { id: "square-mid-right", col: 5, row: 2, z: 1 },
      { id: "wide-left", col: 1, row: 3, colSpan: 2, z: 1 },
      { id: "tall-center", col: 3, row: 3, rowSpan: 2, z: 1 },
      { id: "square-right-a", col: 4, row: 3, z: 1 },
      { id: "square-right-b", col: 5, row: 3, z: 1 },
      { id: "square-bottom-left", col: 1, row: 4, z: 1 },
      { id: "square-bottom-mid", col: 2, row: 4, z: 1 },
      { id: "wide-bottom", col: 4, row: 4, colSpan: 2, z: 1 }
    ]
  },
  {
    id: "vertical",
    name: "Vertical Columns",
    description: "Four tilted columns for vertical banners and mobile website screenshots.",
    background: "#0e3d72",
    rotation: -3,
    scale: 1.08,
    grid: {
      x: 0,
      y: -400,
      w: 2000,
      h: 2800,
      columns: [400, 400, 400, 400, 400],
      rows: [400, 400, 400, 400, 400, 400, 400]
    },
    slots: [
      { id: "c1-a", col: 1, row: 1, rowSpan: 2, z: 1 },
      { id: "c1-b", col: 1, row: 3, rowSpan: 2, z: 1 },
      { id: "c1-c", col: 1, row: 5, rowSpan: 2, z: 1 },
      { id: "c2-a", col: 2, row: 2, rowSpan: 2, z: 1 },
      { id: "c2-b", col: 2, row: 4, rowSpan: 2, z: 1 },
      { id: "c2-c", col: 2, row: 6, rowSpan: 2, z: 1 },
      { id: "c3-a", col: 3, row: 1, rowSpan: 2, z: 1 },
      { id: "c3-b", col: 3, row: 3, rowSpan: 2, z: 1 },
      { id: "c3-c", col: 3, row: 5, rowSpan: 2, z: 1 },
      { id: "c4-a", col: 4, row: 2, rowSpan: 2, z: 1 },
      { id: "c4-b", col: 4, row: 4, rowSpan: 2, z: 1 },
      { id: "c4-c", col: 4, row: 6, rowSpan: 2, z: 1 },
      { id: "c5-a", col: 5, row: 1, rowSpan: 2, z: 1 },
      { id: "c5-b", col: 5, row: 3, rowSpan: 2, z: 1 },
      { id: "c5-c", col: 5, row: 5, rowSpan: 2, z: 1 }
    ]
  }
];

const state = {
  templateId: templates[0].id,
  background: templates[0].background,
  format: "image/png",
  gap: 0,
  radius: 0,
  selectedSlotId: null,
  pendingSlotId: null,
  images: new Map()
};

const stage = document.querySelector("#stage");
const templateList = document.querySelector("#templateList");
const backgroundColor = document.querySelector("#backgroundColor");
const formatSelect = document.querySelector("#formatSelect");
const gapControl = document.querySelector("#gapControl");
const gapValue = document.querySelector("#gapValue");
const radiusControl = document.querySelector("#radiusControl");
const radiusValue = document.querySelector("#radiusValue");
const fileInput = document.querySelector("#fileInput");
const slotTools = document.querySelector("#slotTools");
const clearButton = document.querySelector("#clearButton");
const downloadButton = document.querySelector("#downloadButton");

let activeDrag = null;

loadPreferences();

function getTemplate() {
  return templates.find((template) => template.id === state.templateId);
}

function px(value, axis) {
  const total = axis === "x" ? CANVAS_WIDTH : CANVAS_HEIGHT;
  return `${(value / total) * 100}%`;
}

function renderTemplates() {
  templateList.innerHTML = "";
  templates.forEach((template) => {
    const button = document.createElement("button");
    button.className = "template-card";
    button.type = "button";
    button.role = "radio";
    button.setAttribute("aria-checked", String(template.id === state.templateId));
    button.innerHTML = `
      <span>
        <strong>${template.name}</strong>
        <span>${template.description}</span>
      </span>
    `;
    button.addEventListener("click", () => selectTemplate(template.id));
    templateList.appendChild(button);
  });
}

function selectTemplate(templateId) {
  state.templateId = templateId;
  state.selectedSlotId = null;
  savePreferences();
  renderTemplates();
  renderStage();
  renderSlotTools();
}

function renderStage() {
  const template = getTemplate();
  stage.style.background = state.background;
  stage.innerHTML = "";
  const layer = document.createElement("div");
  layer.className = "slot-layer";
  layer.style.left = px(template.grid.x, "x");
  layer.style.top = px(template.grid.y, "y");
  layer.style.width = px(template.grid.w, "x");
  layer.style.height = px(template.grid.h, "y");
  layer.style.gridTemplateColumns = template.grid.columns.map((size) => `${size}fr`).join(" ");
  layer.style.gridTemplateRows = template.grid.rows.map((size) => `${size}fr`).join(" ");
  layer.style.columnGap = `${(getGridGap(template) / template.grid.w) * 100}%`;
  layer.style.rowGap = `${(getGridGap(template) / template.grid.h) * 100}%`;
  layer.style.transform = getLayerTransform(template);

  template.slots.forEach((slot) => {
    const displaySlot = getDisplaySlot(slot, template);
    const data = state.images.get(slot.id);
    const slotEl = document.createElement("button");
    slotEl.className = `slot${data ? " has-image" : ""}${state.selectedSlotId === slot.id ? " selected" : ""}`;
    slotEl.type = "button";
    slotEl.dataset.slotId = slot.id;
    slotEl.style.gridColumn = `${slot.col} / span ${slot.colSpan || 1}`;
    slotEl.style.gridRow = `${slot.row} / span ${slot.rowSpan || 1}`;
    slotEl.style.zIndex = slot.z;
    slotEl.style.transform = `rotate(${slot.r || 0}deg)`;
    slotEl.style.borderRadius = pxRadius(displaySlot);
    slotEl.setAttribute("aria-label", "Image slot. Drop or select an image.");

    if (data) {
      const img = document.createElement("img");
      img.alt = "";
      img.src = data.url;
      applyImagePlacement(img, displaySlot, data);
      slotEl.appendChild(img);
    }

    attachSlotEvents(slotEl, slot);
    layer.appendChild(slotEl);
  });
  stage.appendChild(layer);
}

function getLayerTransform(template) {
  const rotation = template.rotation || 0;
  const scale = template.scale || 1;
  return `rotate(${rotation}deg) scale(${scale})`;
}

function getGridGap(template) {
  const columnCount = template.grid.columns.length;
  const rowCount = template.grid.rows.length;
  const maxColumnGap = columnCount > 1 ? (template.grid.w - columnCount * 20) / (columnCount - 1) : state.gap;
  const maxRowGap = rowCount > 1 ? (template.grid.h - rowCount * 20) / (rowCount - 1) : state.gap;
  return Math.max(0, Math.min(state.gap, maxColumnGap, maxRowGap));
}

function getDisplaySlot(slot, template = getTemplate()) {
  const grid = template.grid;
  const gap = getGridGap(template);
  const colSpan = slot.colSpan || 1;
  const rowSpan = slot.rowSpan || 1;
  const columnTracks = getTracks(grid.columns, grid.w, gap);
  const rowTracks = getTracks(grid.rows, grid.h, gap);
  const x = grid.x + getTrackStart(columnTracks, gap, slot.col - 1);
  const y = grid.y + getTrackStart(rowTracks, gap, slot.row - 1);
  const w = getTrackSpan(columnTracks, gap, slot.col - 1, colSpan);
  const h = getTrackSpan(rowTracks, gap, slot.row - 1, rowSpan);
  return { ...slot, x, y, w, h };
}

function getTracks(weights, size, gap) {
  const available = size - gap * (weights.length - 1);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => (available * weight) / total);
}

function getTrackStart(tracks, gap, index) {
  return tracks.slice(0, index).reduce((sum, track) => sum + track, 0) + gap * index;
}

function getTrackSpan(tracks, gap, index, span) {
  return tracks.slice(index, index + span).reduce((sum, track) => sum + track, 0) + gap * (span - 1);
}

function pxRadius(slot) {
  const radius = Math.min(state.radius, slot.w / 2, slot.h / 2);
  return `${(radius / slot.w) * 100}% / ${(radius / slot.h) * 100}%`;
}

function attachSlotEvents(slotEl, slot) {
  slotEl.addEventListener("click", () => {
    if (state.images.has(slot.id)) {
      state.selectedSlotId = slot.id;
      renderStage();
      renderSlotTools();
    } else {
      openPicker(slot.id);
    }
  });

  slotEl.addEventListener("dblclick", () => openPicker(slot.id));

  slotEl.addEventListener("dragover", (event) => {
    event.preventDefault();
    slotEl.classList.add("drag-over");
  });

  slotEl.addEventListener("dragleave", () => slotEl.classList.remove("drag-over"));

  slotEl.addEventListener("drop", (event) => {
    event.preventDefault();
    slotEl.classList.remove("drag-over");
    const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("image/"));
    if (file) loadImageIntoSlot(file, slot.id);
  });

  slotEl.addEventListener("pointerdown", (event) => {
    if (!state.images.has(slot.id)) return;
    event.preventDefault();
    state.selectedSlotId = slot.id;
    const data = state.images.get(slot.id);
    activeDrag = {
      slotId: slot.id,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: data.offsetX,
      offsetY: data.offsetY
    };
    slotEl.setPointerCapture(event.pointerId);
    renderSlotTools();
  });

  slotEl.addEventListener("pointermove", (event) => {
    if (!activeDrag || activeDrag.slotId !== slot.id) return;
    const rect = slotEl.getBoundingClientRect();
    const data = state.images.get(slot.id);
    const displaySlot = getDisplaySlot(slot);
    data.offsetX = activeDrag.offsetX + ((event.clientX - activeDrag.startX) / rect.width);
    data.offsetY = activeDrag.offsetY + ((event.clientY - activeDrag.startY) / rect.height);
    clampImage(displaySlot, data);
    const img = slotEl.querySelector("img");
    if (img) applyImagePlacement(img, displaySlot, data);
    renderSlotTools();
  });

  slotEl.addEventListener("pointerup", () => {
    activeDrag = null;
  });

  slotEl.addEventListener("pointercancel", () => {
    activeDrag = null;
  });
}

function openPicker(slotId) {
  state.pendingSlotId = slotId;
  fileInput.value = "";
  fileInput.click();
}

function loadImageIntoSlot(file, slotId) {
  const image = new Image();
  const url = URL.createObjectURL(file);
  image.onload = () => {
    const previous = state.images.get(slotId);
    if (previous) URL.revokeObjectURL(previous.url);

    const slot = getDisplaySlot(getTemplate().slots.find((item) => item.id === slotId));
    const data = {
      url,
      image,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      zoom: 1,
      offsetX: 0,
      offsetY: 0
    };
    clampImage(slot, data);
    state.images.set(slotId, data);
    state.selectedSlotId = slotId;
    renderStage();
    renderSlotTools();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    alert("That image could not be loaded.");
  };
  image.src = url;
}

function removeImage(slotId) {
  const data = state.images.get(slotId);
  if (data) URL.revokeObjectURL(data.url);
  state.images.delete(slotId);
  if (state.selectedSlotId === slotId) state.selectedSlotId = null;
  renderStage();
  renderSlotTools();
}

function clearImages() {
  state.images.forEach((data) => URL.revokeObjectURL(data.url));
  state.images.clear();
  state.selectedSlotId = null;
  renderStage();
  renderSlotTools();
}

function getCoverMetrics(slot, data) {
  const baseScale = Math.max(slot.w / data.naturalWidth, slot.h / data.naturalHeight);
  const scale = baseScale * data.zoom;
  const width = data.naturalWidth * scale;
  const height = data.naturalHeight * scale;
  return { scale, width, height };
}

function clampImage(slot, data) {
  const { width, height } = getCoverMetrics(slot, data);
  const overflowX = Math.max(0, width - slot.w);
  const overflowY = Math.max(0, height - slot.h);
  const maxX = overflowX / 2 / slot.w;
  const maxY = overflowY / 2 / slot.h;
  data.offsetX = Math.min(maxX, Math.max(-maxX, data.offsetX));
  data.offsetY = Math.min(maxY, Math.max(-maxY, data.offsetY));
}

function applyImagePlacement(img, slot, data) {
  const { width, height } = getCoverMetrics(slot, data);
  const left = (slot.w - width) / 2 + data.offsetX * slot.w;
  const top = (slot.h - height) / 2 + data.offsetY * slot.h;
  img.style.width = `${(width / slot.w) * 100}%`;
  img.style.height = `${(height / slot.h) * 100}%`;
  img.style.left = `${(left / slot.w) * 100}%`;
  img.style.top = `${(top / slot.h) * 100}%`;
}

function renderSlotTools() {
  const slotId = state.selectedSlotId;
  const data = slotId ? state.images.get(slotId) : null;
  const slot = slotId ? getDisplaySlot(getTemplate().slots.find((item) => item.id === slotId)) : null;

  if (!data || !slot) {
    slotTools.innerHTML = '<p class="muted">Select a filled slot to adjust it.</p>';
    return;
  }

  slotTools.innerHTML = `
    <label class="range-field">
      <span>Zoom <output>${data.zoom.toFixed(2)}x</output></span>
      <input id="zoomControl" type="range" min="1" max="3" step="0.01" value="${data.zoom}">
    </label>
    <button class="secondary" id="replaceSelected" type="button">Replace Selected Image</button>
    <button class="secondary danger" id="removeSelected" type="button">Remove Selected Image</button>
  `;

  slotTools.querySelector("#zoomControl").addEventListener("input", (event) => {
    data.zoom = Number(event.target.value);
    clampImage(slot, data);
    renderStage();
    renderSlotTools();
  });
  slotTools.querySelector("#replaceSelected").addEventListener("click", () => openPicker(slotId));
  slotTools.querySelector("#removeSelected").addEventListener("click", () => removeImage(slotId));
}

async function downloadCollage() {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  const template = getTemplate();

  ctx.fillStyle = state.background || "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const orderedSlots = [...template.slots].sort((a, b) => a.z - b.z);
  ctx.save();
  applyTemplateTransform(ctx, template);
  orderedSlots.forEach((slot) => {
    const data = state.images.get(slot.id);
    if (!data) return;
    drawSlot(ctx, getDisplaySlot(slot, template), data);
  });
  ctx.restore();

  const type = state.format;
  const extension = type === "image/jpeg" ? "jpg" : "png";
  const quality = type === "image/jpeg" ? 0.92 : undefined;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) {
    alert("The collage could not be exported.");
    return;
  }

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `iris-collage-${template.id}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function applyTemplateTransform(ctx, template) {
  const rotation = ((template.rotation || 0) * Math.PI) / 180;
  const scale = template.scale || 1;
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
}

function drawSlot(ctx, slot, data) {
  const { scale, width, height } = getCoverMetrics(slot, data);
  const left = (slot.w - width) / 2 + data.offsetX * slot.w;
  const top = (slot.h - height) / 2 + data.offsetY * slot.h;

  ctx.save();
  ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
  ctx.rotate(((slot.r || 0) * Math.PI) / 180);
  roundedRectPath(ctx, -slot.w / 2, -slot.h / 2, slot.w, slot.h, Math.min(state.radius, slot.w / 2, slot.h / 2));
  ctx.clip();
  ctx.drawImage(
    data.image,
    -slot.w / 2 + left,
    -slot.h / 2 + top,
    data.naturalWidth * scale,
    data.naturalHeight * scale
  );
  ctx.restore();
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const hasSavedBackground = typeof saved.background === "string";
    if (templates.some((template) => template.id === saved.templateId)) state.templateId = saved.templateId;
    state.background = hasSavedBackground ? saved.background : getTemplate().background;
    if (saved.format === "image/png" || saved.format === "image/jpeg") state.format = saved.format;
    if (Number.isFinite(saved.gap)) state.gap = Math.min(80, Math.max(0, saved.gap));
    if (Number.isFinite(saved.radius)) state.radius = Math.min(80, Math.max(0, saved.radius));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Preferences are optional; the editor still works without storage access.
    }
  }
}

function savePreferences() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      templateId: state.templateId,
      background: state.background,
      format: state.format,
      gap: state.gap,
      radius: state.radius
    }));
  } catch {
    // Storage can be unavailable for local files in some browser privacy modes.
  }
}

function syncPreferenceControls() {
  backgroundColor.value = state.background;
  formatSelect.value = state.format;
  gapControl.value = String(state.gap);
  radiusControl.value = String(state.radius);
  gapValue.textContent = `${state.gap} px`;
  radiusValue.textContent = `${state.radius} px`;
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file && state.pendingSlotId) loadImageIntoSlot(file, state.pendingSlotId);
});

backgroundColor.addEventListener("input", (event) => {
  state.background = event.target.value;
  stage.style.background = state.background;
  savePreferences();
});

formatSelect.addEventListener("change", (event) => {
  state.format = event.target.value;
  savePreferences();
});

gapControl.addEventListener("input", (event) => {
  state.gap = Number(event.target.value);
  gapValue.textContent = `${state.gap} px`;
  renderStage();
  renderSlotTools();
  savePreferences();
});

radiusControl.addEventListener("input", (event) => {
  state.radius = Number(event.target.value);
  radiusValue.textContent = `${state.radius} px`;
  renderStage();
  savePreferences();
});

clearButton.addEventListener("click", clearImages);
downloadButton.addEventListener("click", downloadCollage);

syncPreferenceControls();
renderTemplates();
renderStage();
renderSlotTools();
