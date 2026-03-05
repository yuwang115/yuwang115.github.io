"use strict";

const CONSTANTS = Object.freeze({
  rhoIce: 918.0,
  rhoWater: 1028.0,
  gravity: 9.81,
});

const DEFAULTS = Object.freeze({
  nodes: 160,
  domainLength: 600e3,
  bedPreset: "linear",
  AExponent: -24.0,
  CExponent: 6.2,
  basalMeltMyr: 0.5,
  miciButtressing: 0.65,
  miciCriticalFreeboard: 40.0,
  miciFailureTimescale: 1.2,
  miciExponent: 2.0,
  miciRateCap: 8000.0,
  showVelocityColormap: false,
  showFlowParticles: true,
  velocityColorCap: 3000.0,
  flowParticleCount: 260,
  penguinCount: 8,
  penguinDiveDurationSeconds: 1.35,
  flowParticleVisualTimeScale: 0.32,
  timeSpeed: 1.0,
  dtYears: 0.02,
  chartSampleYears: 0.1,
  maxChartPoints: 2500,
  icebergDefaultDriftSpeed: 100.0,
  icebergMeltHRate: 25.0,
  icebergMeltWidthRate: 70.0,
});

const A_REF = 1e-24;
const C_REF = 10 ** 6.2;
const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

const BED_PRESETS = Object.freeze({
  linear: {
    name: "MISMIP EXP 1 (linear down-slope)",
    bedFn: (x) => 120.0 - 1.2e-3 * x,
  },
  retrograde: {
    name: "MISMIP+ style (retrograde polynomial)",
    bedFn: (x, L) => {
      const xi = x / L;
      return -150.0 - 700.0 * xi + 1300.0 * xi * xi - 600.0 * xi * xi * xi;
    },
  },
});

function createModelState() {
  const grid = buildStaggeredGrid(DEFAULTS.nodes, DEFAULTS.domainLength);
  return {
    constants: CONSTANTS,
    params: {
      ...DEFAULTS,
      A: 10 ** DEFAULTS.AExponent,
      C: 10 ** DEFAULTS.CExponent,
    },
    grid,
    bed: new Float64Array(grid.xH.length),
    H: new Float64Array(grid.xH.length),
    u: new Float64Array(grid.xU.length),
    iceBase: new Float64Array(grid.xH.length),
    surface: new Float64Array(grid.xH.length),
    afloat: new Uint8Array(grid.xH.length),
    groundingLineX: DEFAULTS.domainLength,
    volume: 0,
    timeYears: 0,
    accumulatedCalving: 0.0,
    icebergs: [],
    flowParticles: [],
    penguins: [],
    calving: {
      retreatRate: 0.0,
      freeboard: 0.0,
      criticalFreeboard: DEFAULTS.miciCriticalFreeboard,
      buttressingEffective: 0.0,
      active: false,
      groundedMarineCliff: false,
      cliffX: 0.0,
      lastEventX: Number.NaN,
      eventFlash: 0.0,
    },
    history: {
      time: [],
      groundingLineKm: [],
      volumeGm2: [],
    },
  };
}

function buildStaggeredGrid(nodes, domainLength) {
  const dx = domainLength / nodes;
  const xH = new Float64Array(nodes);
  const xU = new Float64Array(nodes + 1);
  for (let i = 0; i < nodes; i += 1) {
    xH[i] = (i + 0.5) * dx;
  }
  for (let i = 0; i <= nodes; i += 1) {
    xU[i] = i * dx;
  }
  return { nodes, domainLength, dx, xH, xU };
}

function initializeState(state) {
  applyBedPreset(state);
  initializeThickness(state);
  initializeVelocity(state);
  state.accumulatedCalving = 0.0;
  state.icebergs.length = 0;
  state.flowParticles.length = 0;
  state.penguins.length = 0;
  state.calving.retreatRate = 0.0;
  state.calving.freeboard = 0.0;
  state.calving.criticalFreeboard = state.params.miciCriticalFreeboard;
  state.calving.buttressingEffective = 0.0;
  state.calving.active = false;
  state.calving.groundedMarineCliff = false;
  state.calving.cliffX = 0.0;
  state.calving.lastEventX = Number.NaN;
  state.calving.eventFlash = 0.0;
  recomputeDerivedFields(state);
  initializeFlowParticles(state);
  initializePenguins(state);
  applyMiciCalvingStep(state, 0.0);
  state.timeYears = 0;
  resetHistory(state);
}

function applyBedPreset(state) {
  const { xH, domainLength } = state.grid;
  const bedFn = BED_PRESETS[state.params.bedPreset]?.bedFn ?? BED_PRESETS.linear.bedFn;
  for (let i = 0; i < xH.length; i += 1) {
    state.bed[i] = bedFn(xH[i], domainLength);
  }
}

function initializeThickness(state) {
  const { xH, domainLength } = state.grid;
  for (let i = 0; i < xH.length; i += 1) {
    const xi = xH[i] / domainLength;
    state.H[i] = 980.0 * Math.pow(1.0 - xi, 1.15) + 90.0;
  }
}

function initializeVelocity(state) {
  state.u.fill(0.0);
}

function recomputeDerivedFields(state) {
  const { rhoIce, rhoWater } = state.constants;
  const flotationFactor = rhoIce / rhoWater;
  const freeboardFactor = 1.0 - flotationFactor;

  for (let i = 0; i < state.H.length; i += 1) {
    const bed = state.bed[i];
    const H = Math.max(state.H[i], 0.0);
    const isFloating = bed < 0.0 && rhoIce * H <= -rhoWater * bed;
    state.afloat[i] = isFloating ? 1 : 0;
    state.iceBase[i] = isFloating ? -flotationFactor * H : bed;
    state.surface[i] = Math.max(bed + H, freeboardFactor * H);
  }

  state.groundingLineX = locateGroundingLine(state);
  state.volume = computeVolume(state);
}

function locateGroundingLine(state) {
  const { rhoIce, rhoWater } = state.constants;
  const { xH, domainLength } = state.grid;

  for (let i = 0; i < xH.length - 1; i += 1) {
    const f0 = rhoIce * state.H[i] + rhoWater * state.bed[i];
    const f1 = rhoIce * state.H[i + 1] + rhoWater * state.bed[i + 1];

    if (f0 > 0.0 && f1 <= 0.0) {
      const frac = f0 / (f0 - f1);
      return xH[i] + frac * (xH[i + 1] - xH[i]);
    }

    if (f0 === 0.0) {
      return xH[i];
    }
  }

  const firstNodeFloatCriterion = rhoIce * state.H[0] + rhoWater * state.bed[0];
  if (firstNodeFloatCriterion <= 0.0) {
    return 0.0;
  }
  return domainLength;
}

function computeVolume(state) {
  const { dx } = state.grid;
  let sum = 0.0;
  for (let i = 0; i < state.H.length; i += 1) {
    sum += Math.max(state.H[i], 0.0) * dx;
  }
  return sum;
}

function isFloatingCell(state, i) {
  const { rhoIce, rhoWater } = state.constants;
  return state.H[i] > 0.0 && state.bed[i] < 0.0 && rhoIce * state.H[i] <= -rhoWater * state.bed[i];
}

function findTerminusIndex(state, minThickness = 1.0) {
  for (let i = state.H.length - 1; i >= 0; i -= 1) {
    if (state.H[i] > minThickness) {
      return i;
    }
  }
  return -1;
}

function hasFloatingShelf(state) {
  for (let i = 0; i < state.H.length; i += 1) {
    if (state.H[i] > 1.0 && state.afloat[i] === 1) {
      return true;
    }
  }
  return false;
}

function findMiciCliffIndex(state, terminusIndex) {
  const iMax = terminusIndex >= 0 ? terminusIndex : findTerminusIndex(state, 1.0);
  for (let i = iMax; i >= 0; i -= 1) {
    if (state.H[i] > 1.0 && state.afloat[i] === 0) {
      return i;
    }
  }
  return -1;
}

function spawnIceberg(state, x, width, H, driftSpeed = state.params.icebergDefaultDriftSpeed) {
  if (H <= 0.0 || width <= 0.0) {
    return;
  }
  state.icebergs.push({
    x,
    width,
    H,
    driftSpeed,
  });
}

function resetHistory(state) {
  state.history.time.length = 0;
  state.history.groundingLineKm.length = 0;
  state.history.volumeGm2.length = 0;
  appendHistoryPoint(state);
}

function appendHistoryPoint(state) {
  state.history.time.push(state.timeYears);
  state.history.groundingLineKm.push(state.groundingLineX / 1000.0);
  state.history.volumeGm2.push(state.volume / 1e9);

  const maxPoints = state.params.maxChartPoints;
  if (state.history.time.length > maxPoints) {
    state.history.time.shift();
    state.history.groundingLineKm.shift();
    state.history.volumeGm2.shift();
  }
}

function scientificString(value, digits = 2) {
  return value.toExponential(digits);
}

function clamp(value, minValue, maxValue) {
  return Math.min(Math.max(value, minValue), maxValue);
}

function getVelocityColor(u, uMax) {
  const normalized = clamp(u / Math.max(uMax, 1e-6), 0.0, 1.0);
  const hue = 240.0 * (1.0 - normalized);
  const saturation = 88;
  const lightness = 55 - 7 * normalized;
  return `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness.toFixed(1)}%)`;
}

function interpolateCenteredFieldAtX(state, field, x) {
  const { xH, dx, nodes } = state.grid;
  const xClamped = clamp(x, xH[0], xH[nodes - 1]);
  const idxFloat = xClamped / dx - 0.5;
  const i0 = Math.max(0, Math.min(nodes - 1, Math.floor(idxFloat)));
  const i1 = Math.max(0, Math.min(nodes - 1, i0 + 1));
  if (i0 === i1) {
    return field[i0];
  }
  const x0 = xH[i0];
  const x1 = xH[i1];
  const frac = clamp((xClamped - x0) / Math.max(x1 - x0, 1e-9), 0.0, 1.0);
  return field[i0] * (1.0 - frac) + field[i1] * frac;
}

function interpolateEdgeVelocityAtX(state, x) {
  const { xU, dx, domainLength, nodes } = state.grid;
  const xClamped = clamp(x, 0.0, domainLength);
  const idxFloat = xClamped / dx;
  const i0 = Math.max(0, Math.min(nodes, Math.floor(idxFloat)));
  const i1 = Math.max(0, Math.min(nodes, i0 + 1));
  if (i0 === i1) {
    return state.u[i0];
  }
  const x0 = xU[i0];
  const x1 = xU[i1];
  const frac = clamp((xClamped - x0) / Math.max(x1 - x0, 1e-9), 0.0, 1.0);
  return state.u[i0] * (1.0 - frac) + state.u[i1] * frac;
}

function getTerminusX(state, minThickness = 1.0) {
  const idx = findTerminusIndex(state, minThickness);
  if (idx < 0) {
    return 0.0;
  }
  return state.grid.xU[idx + 1];
}

function recycleFlowParticle(state, particle) {
  const seedLength = Math.max(Math.min(getTerminusX(state, 1.0), 0.08 * state.grid.domainLength), state.grid.dx);
  particle.x = Math.random() * seedLength;
  particle.relative_depth = 0.08 + 0.86 * Math.random();
}

function initializeFlowParticles(state) {
  state.flowParticles.length = 0;
  const particleCount = state.params.flowParticleCount;
  const terminusX = getTerminusX(state, 1.0);
  const initialMaxX = Math.max(terminusX, state.grid.dx);
  for (let i = 0; i < particleCount; i += 1) {
    state.flowParticles.push({
      x: Math.random() * initialMaxX * 0.98,
      relative_depth: 0.08 + 0.86 * Math.random(),
    });
  }
}

function updateFlowParticles(state, elapsedSeconds) {
  if (state.flowParticles.length === 0 || elapsedSeconds <= 0.0) {
    return;
  }

  const dtVisualYears = elapsedSeconds * state.params.flowParticleVisualTimeScale;
  const terminusX = getTerminusX(state, 1.0);
  if (terminusX <= state.grid.dx) {
    for (let i = 0; i < state.flowParticles.length; i += 1) {
      recycleFlowParticle(state, state.flowParticles[i]);
    }
    return;
  }

  for (let i = 0; i < state.flowParticles.length; i += 1) {
    const p = state.flowParticles[i];
    const uLocal = Math.max(interpolateEdgeVelocityAtX(state, p.x), 0.0);
    p.x += uLocal * dtVisualYears;

    const zTop = interpolateCenteredFieldAtX(state, state.surface, p.x);
    const zBase = interpolateCenteredFieldAtX(state, state.iceBase, p.x);
    const localThickness = zTop - zBase;
    if (p.x >= terminusX || localThickness <= 1.0 || !Number.isFinite(localThickness)) {
      recycleFlowParticle(state, p);
    }
  }
}

function resetPenguinToIce(state, penguin) {
  const terminusX = getTerminusX(state, 2.0);
  const minX = state.grid.dx;
  const maxX = Math.max(
    minX + 0.5 * state.grid.dx,
    Math.min(0.22 * state.grid.domainLength, 0.3 * Math.max(terminusX, state.grid.dx)),
  );
  penguin.x = minX + Math.random() * Math.max(maxX - minX, 0.25 * state.grid.dx);
  penguin.phase = Math.random() * Math.PI * 2.0;
  penguin.scale = 0.76 + 0.22 * Math.random();
  penguin.status = "on_ice";
  penguin.diveT = 0.0;
  penguin.diveDuration = state.params.penguinDiveDurationSeconds;
  penguin.diveStartX = penguin.x;
  penguin.diveStartZ = 0.0;
  penguin.diveForward = 0.0;
  penguin.diveArc = 0.0;
  penguin.diveDepth = 0.0;
}

function initializePenguins(state) {
  state.penguins.length = 0;
  for (let i = 0; i < state.params.penguinCount; i += 1) {
    const penguin = {};
    resetPenguinToIce(state, penguin);
    penguin.phase += i * 0.57;
    state.penguins.push(penguin);
  }
}

function penguinHasIceSupport(state, penguin) {
  const x = clamp(penguin.x, 0.0, state.grid.domainLength);
  const terminusX = getTerminusX(state, 1.0);
  if (x >= terminusX - 0.12 * state.grid.dx) {
    return false;
  }
  const zTop = interpolateCenteredFieldAtX(state, state.surface, x);
  const zBase = interpolateCenteredFieldAtX(state, state.iceBase, x);
  const thickness = zTop - zBase;
  if (!Number.isFinite(zTop) || !Number.isFinite(thickness)) {
    return false;
  }
  return thickness > 5.0 && zTop > -0.5;
}

function startPenguinDive(state, penguin) {
  if (penguin.status === "diving") {
    return;
  }
  const x = clamp(penguin.x, 0.0, state.grid.domainLength);
  const zTop = interpolateCenteredFieldAtX(state, state.surface, x);
  penguin.status = "diving";
  penguin.diveT = 0.0;
  penguin.diveDuration =
    state.params.penguinDiveDurationSeconds * (0.9 + 0.28 * Math.random());
  penguin.diveStartX = x;
  penguin.diveStartZ = Number.isFinite(zTop) ? Math.max(zTop, 0.0) : 0.0;
  penguin.diveForward = (0.16 + 0.26 * Math.random()) * state.grid.dx;
  penguin.diveArc = 6.0 + 7.0 * Math.random();
  penguin.diveDepth = 10.0 + 16.0 * Math.random();
}

function updatePenguins(state, dtYears, elapsedSeconds) {
  if (state.penguins.length === 0) {
    return;
  }

  const dtAdvect = Math.max(dtYears, 0.0);
  const dtVisual = Math.max(elapsedSeconds, 0.0);

  for (let i = 0; i < state.penguins.length; i += 1) {
    const penguin = state.penguins[i];
    if (penguin.status === "on_ice") {
      const uLocal = Math.max(interpolateEdgeVelocityAtX(state, penguin.x), 0.0);
      penguin.x = clamp(penguin.x + uLocal * dtAdvect, 0.0, state.grid.domainLength);
      if (!penguinHasIceSupport(state, penguin)) {
        startPenguinDive(state, penguin);
      }
      continue;
    }

    if (penguin.status === "diving") {
      penguin.diveT += dtVisual;
      if (penguin.diveT >= penguin.diveDuration) {
        resetPenguinToIce(state, penguin);
      }
    }
  }
}

function minInArray(arr) {
  let minVal = Number.POSITIVE_INFINITY;
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] < minVal) {
      minVal = arr[i];
    }
  }
  return minVal;
}

function maxInArray(arr) {
  let maxVal = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] > maxVal) {
      maxVal = arr[i];
    }
  }
  return maxVal;
}

function buildNiceTicks(minValue, maxValue, targetCount) {
  const span = Math.max(maxValue - minValue, 1e-6);
  const raw = span / targetCount;
  const exponent = 10 ** Math.floor(Math.log10(raw));
  const factors = [1, 2, 5, 10];
  let step = exponent;
  for (let i = 0; i < factors.length; i += 1) {
    const testStep = exponent * factors[i];
    if (testStep >= raw) {
      step = testStep;
      break;
    }
  }

  const start = Math.ceil(minValue / step) * step;
  const ticks = [];
  for (let value = start; value <= maxValue + 0.5 * step; value += step) {
    ticks.push(value);
  }
  return ticks;
}

class FlowlineRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.state = state;
    this.width = 1;
    this.height = 1;
    this.padding = {
      left: 64,
      right: 20,
      top: 16,
      bottom: 44,
    };

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeToContainer();
    });
    this.resizeObserver.observe(canvas.parentElement);
    this.resizeToContainer();
  }

  resizeToContainer() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.width = width;
    this.height = height;
    this.draw();
  }

  makeFrame() {
    const zMinData = Math.min(minInArray(this.state.bed), minInArray(this.state.iceBase), -200.0);
    const zMaxData = Math.max(maxInArray(this.state.surface), 120.0);
    const zMin = zMinData - 100.0;
    const zMax = zMaxData + 100.0;

    const left = this.padding.left;
    const right = this.width - this.padding.right;
    const top = this.padding.top;
    const bottom = this.height - this.padding.bottom;

    const xToPx = (x) => left + (x / this.state.grid.domainLength) * (right - left);
    const zToPx = (z) => top + ((zMax - z) / (zMax - zMin)) * (bottom - top);
    return { left, right, top, bottom, zMin, zMax, xToPx, zToPx };
  }

  traceRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    if (typeof this.ctx.roundRect === "function") {
      this.ctx.roundRect(x, y, width, height, radius);
    } else {
      this.ctx.rect(x, y, width, height);
    }
  }

  traceBedPolygon(frame) {
    const { xH, domainLength } = this.state.grid;
    this.ctx.beginPath();
    this.ctx.moveTo(frame.xToPx(0.0), frame.bottom);
    for (let i = 0; i < xH.length; i += 1) {
      this.ctx.lineTo(frame.xToPx(xH[i]), frame.zToPx(this.state.bed[i]));
    }
    this.ctx.lineTo(frame.xToPx(domainLength), frame.bottom);
    this.ctx.closePath();
  }

  traceBedLine(frame) {
    const { xH } = this.state.grid;
    this.ctx.beginPath();
    for (let i = 0; i < xH.length; i += 1) {
      const x = frame.xToPx(xH[i]);
      const y = frame.zToPx(this.state.bed[i]);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
  }

  traceIcePolygon(frame) {
    const { xH } = this.state.grid;
    this.ctx.beginPath();
    for (let i = 0; i < xH.length; i += 1) {
      const x = frame.xToPx(xH[i]);
      const y = frame.zToPx(this.state.surface[i]);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    for (let i = xH.length - 1; i >= 0; i -= 1) {
      this.ctx.lineTo(frame.xToPx(xH[i]), frame.zToPx(this.state.iceBase[i]));
    }
    this.ctx.closePath();
  }

  traceSurfaceLine(frame) {
    const { xH } = this.state.grid;
    this.ctx.beginPath();
    for (let i = 0; i < xH.length; i += 1) {
      const x = frame.xToPx(xH[i]);
      const y = frame.zToPx(this.state.surface[i]);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
  }

  traceIceBaseLine(frame) {
    const { xH } = this.state.grid;
    this.ctx.beginPath();
    for (let i = 0; i < xH.length; i += 1) {
      const x = frame.xToPx(xH[i]);
      const y = frame.zToPx(this.state.iceBase[i]);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
  }

  drawBackground(frame) {
    const grad = this.ctx.createLinearGradient(0, frame.top, 0, frame.bottom);
    grad.addColorStop(0, "#d9f0ff");
    grad.addColorStop(0.36, "#b6d8eb");
    grad.addColorStop(1, "#789eb7");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top);

    const sun = this.ctx.createRadialGradient(
      frame.left + 0.18 * (frame.right - frame.left),
      frame.top + 0.18 * (frame.bottom - frame.top),
      8,
      frame.left + 0.18 * (frame.right - frame.left),
      frame.top + 0.18 * (frame.bottom - frame.top),
      0.55 * (frame.right - frame.left),
    );
    sun.addColorStop(0, "rgba(255, 249, 224, 0.52)");
    sun.addColorStop(1, "rgba(255, 249, 224, 0)");
    this.ctx.fillStyle = sun;
    this.ctx.fillRect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top);

    const coldBloom = this.ctx.createRadialGradient(
      frame.right - 0.1 * (frame.right - frame.left),
      frame.top + 0.08 * (frame.bottom - frame.top),
      0,
      frame.right - 0.1 * (frame.right - frame.left),
      frame.top + 0.08 * (frame.bottom - frame.top),
      0.5 * (frame.right - frame.left),
    );
    coldBloom.addColorStop(0, "rgba(186, 232, 255, 0.18)");
    coldBloom.addColorStop(1, "rgba(186, 232, 255, 0)");
    this.ctx.fillStyle = coldBloom;
    this.ctx.fillRect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top);
  }

  drawOcean(frame) {
    const ySea = frame.zToPx(0.0);
    const yStart = Math.max(frame.top, ySea);
    if (yStart < frame.bottom) {
      const grad = this.ctx.createLinearGradient(0, yStart, 0, frame.bottom);
      grad.addColorStop(0, "rgba(69, 155, 198, 0.34)");
      grad.addColorStop(0.42, "rgba(19, 100, 140, 0.48)");
      grad.addColorStop(1, "rgba(8, 55, 86, 0.72)");
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(frame.left, yStart, frame.right - frame.left, frame.bottom - yStart);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(frame.left, yStart, frame.right - frame.left, frame.bottom - yStart);
      this.ctx.clip();

      const phase = this.state.timeYears * 2.3;
      for (let band = 0; band < 5; band += 1) {
        const y = ySea + 8 + band * 12;
        this.ctx.beginPath();
        for (let x = frame.left; x <= frame.right + 8; x += 12) {
          const wave =
            y +
            Math.sin((x - frame.left) * (0.016 + band * 0.002) + phase + band * 0.9) * (2.2 - 0.28 * band);
          if (x === frame.left) {
            this.ctx.moveTo(x, wave);
          } else {
            this.ctx.lineTo(x, wave);
          }
        }
        this.ctx.strokeStyle = `rgba(205, 240, 255, ${0.18 - band * 0.02})`;
        this.ctx.lineWidth = 1.0;
        this.ctx.stroke();
      }

      for (let i = 0; i < 26; i += 1) {
        const x = frame.left + ((i * 97) % Math.max(frame.right - frame.left, 1));
        const y = ySea + 10 + ((i * 19) % 120);
        this.ctx.fillStyle = "rgba(194, 236, 255, 0.08)";
        this.ctx.fillRect(x, y, 20 + (i % 4) * 6, 1);
      }
      this.ctx.restore();
    }
  }

  drawBed(frame) {
    this.ctx.save();
    this.traceBedPolygon(frame);
    this.ctx.clip();

    const grad = this.ctx.createLinearGradient(0, frame.top, 0, frame.bottom);
    grad.addColorStop(0, "#8d6b51");
    grad.addColorStop(0.4, "#6b4f3d");
    grad.addColorStop(1, "#352821");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top);

    this.ctx.strokeStyle = "rgba(235, 196, 150, 0.12)";
    this.ctx.lineWidth = 1;
    for (let x = frame.left - 120; x <= frame.right + 120; x += 14) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, frame.bottom + 8);
      this.ctx.lineTo(x + 150, frame.top - 24);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = "rgba(38, 25, 18, 0.15)";
    for (let x = frame.left - 120; x <= frame.right + 120; x += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, frame.top - 14);
      this.ctx.lineTo(x + 145, frame.bottom + 12);
      this.ctx.stroke();
    }
    this.ctx.restore();

    this.traceBedLine(frame);
    this.ctx.strokeStyle = "#4f3728";
    this.ctx.lineWidth = 2.2;
    this.ctx.stroke();

    this.traceBedLine(frame);
    this.ctx.strokeStyle = "rgba(220, 172, 130, 0.35)";
    this.ctx.lineWidth = 0.9;
    this.ctx.stroke();
  }

  getIceEdgeFields() {
    const { nodes } = this.state.grid;
    const surfaceEdge = new Float64Array(nodes + 1);
    const baseEdge = new Float64Array(nodes + 1);
    for (let edge = 0; edge <= nodes; edge += 1) {
      if (edge === 0) {
        surfaceEdge[edge] = this.state.surface[0];
        baseEdge[edge] = this.state.iceBase[0];
      } else if (edge === nodes) {
        surfaceEdge[edge] = this.state.surface[nodes - 1];
        baseEdge[edge] = this.state.iceBase[nodes - 1];
      } else {
        surfaceEdge[edge] = 0.5 * (this.state.surface[edge - 1] + this.state.surface[edge]);
        baseEdge[edge] = 0.5 * (this.state.iceBase[edge - 1] + this.state.iceBase[edge]);
      }
    }
    return { surfaceEdge, baseEdge };
  }

  drawVelocityColormapBody(frame) {
    const { nodes, xU } = this.state.grid;
    const { surfaceEdge, baseEdge } = this.getIceEdgeFields();
    const uCap = this.state.params.velocityColorCap;

    for (let i = 0; i < nodes; i += 1) {
      if (this.state.H[i] <= 0.5) {
        continue;
      }
      const uCell = 0.5 * (this.state.u[i] + this.state.u[i + 1]);
      this.ctx.fillStyle = getVelocityColor(uCell, uCap);
      this.ctx.beginPath();
      this.ctx.moveTo(frame.xToPx(xU[i]), frame.zToPx(surfaceEdge[i]));
      this.ctx.lineTo(frame.xToPx(xU[i + 1]), frame.zToPx(surfaceEdge[i + 1]));
      this.ctx.lineTo(frame.xToPx(xU[i + 1]), frame.zToPx(baseEdge[i + 1]));
      this.ctx.lineTo(frame.xToPx(xU[i]), frame.zToPx(baseEdge[i]));
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Soft sheen to keep the colormap physically readable but visually smooth.
    this.ctx.save();
    this.traceIcePolygon(frame);
    this.ctx.clip();
    const sheen = this.ctx.createLinearGradient(frame.left, frame.top, frame.right, frame.bottom);
    sheen.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    sheen.addColorStop(1, "rgba(255, 255, 255, 0.02)");
    this.ctx.fillStyle = sheen;
    this.ctx.fillRect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top);
    this.ctx.restore();
  }

  drawIce(frame) {
    if (this.state.params.showVelocityColormap) {
      this.drawVelocityColormapBody(frame);
    } else {
      this.ctx.save();
      this.traceIcePolygon(frame);
      this.ctx.clip();

      const bodyGrad = this.ctx.createLinearGradient(0, frame.top, 0, frame.bottom);
      bodyGrad.addColorStop(0, "rgba(255, 255, 255, 0.96)");
      bodyGrad.addColorStop(0.38, "rgba(248, 252, 255, 0.92)");
      bodyGrad.addColorStop(1, "rgba(226, 236, 245, 0.84)");
      this.ctx.fillStyle = bodyGrad;
      this.ctx.fillRect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top);

      const rimLight = this.ctx.createLinearGradient(frame.left, frame.top, frame.right, frame.bottom);
      rimLight.addColorStop(0, "rgba(255, 255, 255, 0.48)");
      rimLight.addColorStop(1, "rgba(255, 255, 255, 0)");
      this.ctx.fillStyle = rimLight;
      this.ctx.fillRect(frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top);

      const phase = this.state.timeYears * 1.7;
      for (let x = frame.left + 6; x <= frame.right; x += 18) {
        const wave = Math.sin(x * 0.025 + phase) * 6;
        this.ctx.beginPath();
        this.ctx.moveTo(x, frame.top + 8 + wave);
        this.ctx.lineTo(x - 3, frame.bottom - 8 + 0.5 * wave);
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    this.traceSurfaceLine(frame);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
    this.ctx.lineWidth = 2.2;
    this.ctx.stroke();

    this.traceSurfaceLine(frame);
    this.ctx.strokeStyle = "rgba(232, 240, 247, 0.86)";
    this.ctx.lineWidth = 1.0;
    this.ctx.stroke();

    this.traceIceBaseLine(frame);
    this.ctx.strokeStyle = "rgba(120, 145, 163, 0.72)";
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();
  }

  drawFlowParticles(frame) {
    if (!this.state.params.showFlowParticles || this.state.flowParticles.length === 0) {
      return;
    }

    const terminusX = getTerminusX(this.state, 1.0);
    this.ctx.save();
    this.traceIcePolygon(frame);
    this.ctx.clip();

    for (let i = 0; i < this.state.flowParticles.length; i += 1) {
      const p = this.state.flowParticles[i];
      if (p.x <= 0.0 || p.x >= terminusX) {
        continue;
      }
      const zTop = interpolateCenteredFieldAtX(this.state, this.state.surface, p.x);
      const zBase = interpolateCenteredFieldAtX(this.state, this.state.iceBase, p.x);
      const z = zBase + p.relative_depth * (zTop - zBase);
      if (!Number.isFinite(z)) {
        continue;
      }
      const xPx = frame.xToPx(p.x);
      const yPx = frame.zToPx(z);
      const radius = 1.15 + 0.65 * p.relative_depth;
      this.ctx.beginPath();
      this.ctx.arc(xPx, yPx, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(94, 108, 122, 0.78)";
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawPenguinSprite(scale, phase, animationScale = 1.0) {
    const wingSwing = 0.5 * animationScale * Math.sin(this.state.timeYears * 4.2 + phase);
    const bob = 0.7 * animationScale * Math.sin(this.state.timeYears * 3.1 + phase);

    this.ctx.save();
    this.ctx.translate(0, bob);
    this.ctx.scale(scale, scale);

    this.ctx.fillStyle = "rgba(25, 42, 60, 0.2)";
    this.ctx.beginPath();
    this.ctx.ellipse(0, 9.6, 5.8, 1.55, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#f49c2e";
    this.ctx.beginPath();
    this.ctx.ellipse(-2.1, 8.2, 1.6, 0.85, 0, 0, Math.PI * 2);
    this.ctx.ellipse(2.1, 8.2, 1.6, 0.85, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#0f1a28";
    this.ctx.beginPath();
    this.ctx.ellipse(0, 1.5, 4.7, 7.6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = "#0b1622";
    this.ctx.lineWidth = 1.05;
    this.ctx.beginPath();
    this.ctx.moveTo(-3.9, 0.8);
    this.ctx.quadraticCurveTo(-6.0, 2.9 + wingSwing, -4.9, 5.7);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(3.9, 0.8);
    this.ctx.quadraticCurveTo(6.0, 2.9 - wingSwing, 4.9, 5.7);
    this.ctx.stroke();

    this.ctx.fillStyle = "#f6fbff";
    this.ctx.beginPath();
    this.ctx.ellipse(0, 2.8, 2.35, 4.7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#0f1a28";
    this.ctx.beginPath();
    this.ctx.arc(0, -5.55, 3.0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(-1.0, -5.95, 0.62, 0, Math.PI * 2);
    this.ctx.arc(1.0, -5.95, 0.62, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#1f2730";
    this.ctx.beginPath();
    this.ctx.arc(-1.0, -5.95, 0.28, 0, Math.PI * 2);
    this.ctx.arc(1.0, -5.95, 0.28, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#f49c2e";
    this.ctx.beginPath();
    this.ctx.moveTo(0.0, -4.7);
    this.ctx.lineTo(-1.15, -4.2);
    this.ctx.lineTo(1.15, -4.2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  drawPenguinDiveSplash(xPx, ySeaPx, progress) {
    const s = clamp((progress - 0.45) / 0.55, 0.0, 1.0);
    if (s <= 0.0) {
      return;
    }

    const ringRadius = 3.0 + 18.0 * s;
    this.ctx.save();
    this.ctx.strokeStyle = `rgba(224, 247, 255, ${(0.42 * (1.0 - 0.55 * s)).toFixed(3)})`;
    this.ctx.lineWidth = Math.max(0.8, 2.2 - 1.2 * s);
    this.ctx.beginPath();
    this.ctx.ellipse(xPx, ySeaPx + 0.8, ringRadius, 1.8 + 1.1 * s, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    for (let i = 0; i < 3; i += 1) {
      const t = (s + i * 0.17) % 1.0;
      const dropX = xPx + (i - 1) * (4.0 + 3.2 * t);
      const dropY = ySeaPx - (8.0 * t * (1.0 - 0.35 * s));
      this.ctx.fillStyle = `rgba(225, 248, 255, ${(0.35 * (1.0 - t)).toFixed(3)})`;
      this.ctx.beginPath();
      this.ctx.arc(dropX, dropY, 1.0 + 0.7 * (1.0 - t), 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawPenguins(frame) {
    if (this.state.penguins.length === 0) {
      return;
    }

    const slopeDx = 0.7 * this.state.grid.dx;
    const ySeaPx = frame.zToPx(0.0);
    for (let i = 0; i < this.state.penguins.length; i += 1) {
      const penguin = this.state.penguins[i];
      if (penguin.status === "on_ice") {
        const x = clamp(penguin.x, 0.0, this.state.grid.domainLength);
        const zTop = interpolateCenteredFieldAtX(this.state, this.state.surface, x);
        const zBase = interpolateCenteredFieldAtX(this.state, this.state.iceBase, x);
        if (!Number.isFinite(zTop) || !Number.isFinite(zBase) || zTop - zBase <= 1.0) {
          continue;
        }

        const zL = interpolateCenteredFieldAtX(this.state, this.state.surface, Math.max(x - slopeDx, 0.0));
        const zR = interpolateCenteredFieldAtX(
          this.state,
          this.state.surface,
          Math.min(x + slopeDx, this.state.grid.domainLength),
        );
        const surfaceSlope = (zR - zL) / Math.max(2.0 * slopeDx, 1e-6);
        const tilt = clamp(-1.7 * surfaceSlope, -0.18, 0.18);
        const xPx = frame.xToPx(x);
        const yPx = frame.zToPx(zTop) - 1.4;

        this.ctx.save();
        this.ctx.translate(xPx, yPx);
        this.ctx.rotate(tilt);
        this.drawPenguinSprite(penguin.scale, penguin.phase);
        this.ctx.restore();
        continue;
      }

      if (penguin.status === "diving") {
        const progress = clamp(
          penguin.diveT / Math.max(penguin.diveDuration, 1e-6),
          0.0,
          1.0,
        );
        const x = penguin.diveStartX + penguin.diveForward * progress;
        const z =
          penguin.diveStartZ +
          penguin.diveArc * Math.sin(Math.PI * progress) -
          penguin.diveDepth * progress * progress;
        const xPx = frame.xToPx(x);
        const yPx = frame.zToPx(z) - 1.2;
        const tilt = 0.22 + 1.2 * progress;

        this.ctx.save();
        this.ctx.translate(xPx, yPx);
        this.ctx.rotate(tilt);
        this.drawPenguinSprite(
          Math.max(0.72, penguin.scale * 0.96),
          penguin.phase + 0.6 * progress,
          0.36,
        );
        this.ctx.restore();
        this.drawPenguinDiveSplash(xPx, ySeaPx, progress);
      }
    }
  }

  drawSeaLevel(frame) {
    const ySea = frame.zToPx(0.0);
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(199, 241, 255, 0.5)";
    this.ctx.lineWidth = 4.6;
    this.ctx.beginPath();
    this.ctx.moveTo(frame.left, ySea);
    this.ctx.lineTo(frame.right, ySea);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(frame.left, ySea);
    this.ctx.lineTo(frame.right, ySea);
    this.ctx.strokeStyle = "#1f6f93";
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();

    const phase = this.state.timeYears * 2.1;
    this.ctx.beginPath();
    for (let x = frame.left; x <= frame.right + 6; x += 10) {
      const y = ySea + Math.sin((x - frame.left) * 0.026 + phase) * 1.6;
      if (x === frame.left) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = "rgba(220, 248, 255, 0.7)";
    this.ctx.lineWidth = 1.1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawGroundingLine(frame) {
    const x = frame.xToPx(this.state.groundingLineX);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x, frame.top);
    this.ctx.lineTo(x, frame.bottom);
    this.ctx.strokeStyle = "rgba(255, 176, 92, 0.24)";
    this.ctx.lineWidth = 5.6;
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 5]);
    this.ctx.moveTo(x, frame.top);
    this.ctx.lineTo(x, frame.bottom);
    this.ctx.strokeStyle = "#d07a2e";
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();
    this.ctx.restore();

    const yMarker = frame.zToPx(0.0);
    this.ctx.beginPath();
    this.ctx.arc(x, yMarker, 6.1, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(255, 193, 123, 0.38)";
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(x, yMarker, 3.5, 0, Math.PI * 2);
    this.ctx.fillStyle = "#d47b2f";
    this.ctx.fill();

    const labelX = clamp(x + 8, frame.left + 4, frame.right - 32);
    const labelY = frame.top + 6;
    this.traceRoundedRect(labelX, labelY, 24, 14, 7);
    this.ctx.fillStyle = "rgba(255, 240, 223, 0.9)";
    this.ctx.fill();
    this.ctx.strokeStyle = "rgba(175, 104, 42, 0.6)";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.font = '11px "IBM Plex Mono", monospace';
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "#8a4d1c";
    this.ctx.fillText("GL", labelX + 6, labelY + 7.4);
    this.ctx.restore();
  }

  drawIcebergs(frame) {
    const { rhoIce, rhoWater } = this.state.constants;
    if (this.state.icebergs.length === 0) {
      return;
    }

    const freeboardFactor = 1.0 - rhoIce / rhoWater;
    const draftFactor = rhoIce / rhoWater;
    const ySea = frame.zToPx(0.0);

    for (let i = 0; i < this.state.icebergs.length; i += 1) {
      const berg = this.state.icebergs[i];
      const x0 = berg.x - 0.5 * berg.width;
      const x1 = berg.x + 0.5 * berg.width;
      const top = freeboardFactor * berg.H;
      const bottom = -draftFactor * berg.H;

      const left = frame.xToPx(x0);
      const right = frame.xToPx(x1);
      const yTop = frame.zToPx(top);
      const yBottom = frame.zToPx(bottom);
      const widthPx = Math.max(right - left, 1.5);
      const heightPx = Math.max(yBottom - yTop, 2.0);

      if (right < frame.left - 10 || left > frame.right + 10) {
        continue;
      }

      const capHeight = Math.max(ySea - yTop, 1.2);
      const submergedHeight = Math.max(yBottom - ySea, 0);

      const capGrad = this.ctx.createLinearGradient(0, yTop, 0, ySea);
      capGrad.addColorStop(0, "rgba(255, 255, 255, 0.96)");
      capGrad.addColorStop(1, "rgba(196, 232, 250, 0.92)");
      this.ctx.fillStyle = capGrad;
      this.ctx.fillRect(left, yTop, widthPx, capHeight);

      if (submergedHeight > 0.2) {
        const submergedGrad = this.ctx.createLinearGradient(0, ySea, 0, yBottom);
        submergedGrad.addColorStop(0, "rgba(141, 201, 230, 0.8)");
        submergedGrad.addColorStop(1, "rgba(88, 151, 184, 0.74)");
        this.ctx.fillStyle = submergedGrad;
        this.ctx.fillRect(left, ySea, widthPx, submergedHeight);
      }

      this.ctx.strokeStyle = "rgba(98, 157, 192, 0.96)";
      this.ctx.lineWidth = 1.0;
      this.ctx.strokeRect(left, yTop, widthPx, heightPx);

      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
      this.ctx.lineWidth = 0.9;
      this.ctx.beginPath();
      this.ctx.moveTo(left + 1, yTop + 1.4);
      this.ctx.lineTo(left + widthPx - 1, yTop + 1.4);
      this.ctx.stroke();
    }
  }

  drawCalvingEvent(frame) {
    const flash = this.state.calving.eventFlash;
    if (flash <= 0.0 || !Number.isFinite(this.state.calving.lastEventX)) {
      return;
    }

    const x = frame.xToPx(this.state.calving.lastEventX);
    const ySea = frame.zToPx(0.0);
    const amp = clamp(flash, 0.0, 1.0);

    this.ctx.save();
    this.ctx.strokeStyle = `rgba(229, 250, 255, ${(0.65 * amp).toFixed(3)})`;
    this.ctx.lineWidth = 1.0 + 2.0 * amp;
    this.ctx.beginPath();
    this.ctx.ellipse(x, ySea + 1.2, 7 + 22 * (1.0 - amp), 2.2 + 1.8 * (1.0 - amp), 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = `rgba(241, 251, 255, ${(0.8 * amp).toFixed(3)})`;
    for (let i = 0; i < 6; i += 1) {
      const spread = (i - 2.5) * 3.2;
      const lift = 10.0 * amp * (0.35 + 0.1 * (i % 3));
      this.ctx.beginPath();
      this.ctx.arc(x + spread, ySea - lift, 1.1 + 0.9 * amp, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawAxes(frame) {
    const xTicks = 6;
    const yTicks = buildNiceTicks(frame.zMin, frame.zMax, 6);

    this.ctx.strokeStyle = "rgba(95, 136, 156, 0.24)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= xTicks; i += 1) {
      const xMeters = (this.state.grid.domainLength * i) / xTicks;
      const x = frame.xToPx(xMeters);
      this.ctx.beginPath();
      this.ctx.moveTo(x, frame.top);
      this.ctx.lineTo(x, frame.bottom);
      this.ctx.stroke();
    }
    for (let i = 0; i < yTicks.length; i += 1) {
      const y = frame.zToPx(yTicks[i]);
      this.ctx.beginPath();
      this.ctx.moveTo(frame.left, y);
      this.ctx.lineTo(frame.right, y);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = "#2f4f62";
    this.ctx.lineWidth = 1.1;
    this.ctx.beginPath();
    this.ctx.moveTo(frame.left, frame.top);
    this.ctx.lineTo(frame.left, frame.bottom);
    this.ctx.lineTo(frame.right, frame.bottom);
    this.ctx.stroke();

    this.ctx.font = '10.5px "IBM Plex Mono", monospace';
    this.ctx.fillStyle = "#214556";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";

    for (let i = 0; i <= xTicks; i += 1) {
      const xMeters = (this.state.grid.domainLength * i) / xTicks;
      const x = frame.xToPx(xMeters);
      this.ctx.beginPath();
      this.ctx.moveTo(x, frame.bottom);
      this.ctx.lineTo(x, frame.bottom + 5);
      this.ctx.stroke();
      this.ctx.fillText(`${(xMeters / 1000).toFixed(0)}`, x, frame.bottom + 7);
    }
    this.ctx.fillText("Distance x (km)", 0.5 * (frame.left + frame.right), this.height - 15);

    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    for (let i = 0; i < yTicks.length; i += 1) {
      const z = yTicks[i];
      const y = frame.zToPx(z);
      this.ctx.beginPath();
      this.ctx.moveTo(frame.left - 5, y);
      this.ctx.lineTo(frame.left, y);
      this.ctx.stroke();
      this.ctx.fillText(`${Math.round(z)}`, frame.left - 8, y);
    }

    this.ctx.save();
    this.ctx.translate(16, 0.5 * (frame.top + frame.bottom));
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.textAlign = "center";
    this.ctx.fillText("Elevation z (m)", 0, 0);
    this.ctx.restore();
  }

  drawLegend(frame) {
    const showVelocityLegend = this.state.params.showVelocityColormap;
    const boxX = frame.right - 170;
    const boxY = frame.top + 8;
    const boxWidth = 162;
    const boxHeight = showVelocityLegend ? 110 : 90;

    const panelGrad = this.ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
    panelGrad.addColorStop(0, "rgba(246, 253, 255, 0.84)");
    panelGrad.addColorStop(1, "rgba(220, 239, 248, 0.7)");
    this.ctx.fillStyle = panelGrad;
    this.ctx.strokeStyle = "rgba(49, 92, 113, 0.44)";
    this.ctx.lineWidth = 1;
    this.traceRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = '11px "IBM Plex Mono", monospace';
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    this.ctx.fillStyle = "#5f4636";
    this.ctx.fillRect(boxX + 9, boxY + 14, 14, 8);
    this.ctx.fillStyle = "#213f4e";
    this.ctx.fillText("Bedrock", boxX + 28, boxY + 18);

    this.ctx.fillStyle = "rgba(248, 252, 255, 0.98)";
    this.ctx.fillRect(boxX + 9, boxY + 33, 14, 8);
    this.ctx.strokeStyle = "rgba(177, 198, 214, 0.9)";
    this.ctx.lineWidth = 1.0;
    this.ctx.strokeRect(boxX + 9, boxY + 33, 14, 8);
    this.ctx.fillStyle = "#213f4e";
    this.ctx.fillText("Ice", boxX + 28, boxY + 37);

    this.ctx.strokeStyle = "#cf7b30";
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(boxX + 10, boxY + 55);
    this.ctx.lineTo(boxX + 24, boxY + 55);
    this.ctx.stroke();
    this.ctx.fillStyle = "#213f4e";
    this.ctx.fillText("Grounding line", boxX + 28, boxY + 55);

    this.ctx.fillStyle = "rgba(244, 252, 255, 0.98)";
    this.ctx.fillRect(boxX + 9, boxY + 67, 14, 8);
    this.ctx.strokeStyle = "rgba(109, 167, 201, 0.88)";
    this.ctx.lineWidth = 1.0;
    this.ctx.strokeRect(boxX + 9, boxY + 67, 14, 8);
    this.ctx.fillStyle = "#213f4e";
    this.ctx.fillText("Icebergs", boxX + 28, boxY + 71);

    if (showVelocityLegend) {
      const rampX = boxX + 9;
      const rampY = boxY + 86;
      const rampW = 104;
      const rampH = 8;
      const ramp = this.ctx.createLinearGradient(rampX, 0, rampX + rampW, 0);
      ramp.addColorStop(0, getVelocityColor(0, this.state.params.velocityColorCap));
      ramp.addColorStop(0.5, getVelocityColor(0.5 * this.state.params.velocityColorCap, this.state.params.velocityColorCap));
      ramp.addColorStop(1, getVelocityColor(this.state.params.velocityColorCap, this.state.params.velocityColorCap));
      this.ctx.fillStyle = ramp;
      this.ctx.fillRect(rampX, rampY, rampW, rampH);
      this.ctx.strokeStyle = "rgba(53, 90, 111, 0.42)";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(rampX, rampY, rampW, rampH);
      this.ctx.fillStyle = "#1e4358";
      this.ctx.font = '9.5px "IBM Plex Mono", monospace';
      this.ctx.fillText("u", rampX + rampW + 8, rampY + 4);
      this.ctx.fillText("0", rampX, rampY + 12);
      this.ctx.fillText(`${Math.round(this.state.params.velocityColorCap)}`, rampX + rampW - 20, rampY + 12);
    }
  }

  draw() {
    const frame = this.makeFrame();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground(frame);
    this.drawOcean(frame);
    this.drawBed(frame);
    this.drawIce(frame);
    this.drawFlowParticles(frame);
    this.drawPenguins(frame);
    this.drawSeaLevel(frame);
    this.drawIcebergs(frame);
    this.drawCalvingEvent(frame);
    this.drawGroundingLine(frame);
    this.drawAxes(frame);
    this.drawLegend(frame);
  }
}

class Dashboard {
  constructor(state, renderer) {
    this.state = state;
    this.renderer = renderer;

    this.el = {
      bedPreset: document.getElementById("bedPreset"),
      aSlider: document.getElementById("aSlider"),
      cSlider: document.getElementById("cSlider"),
      meltSlider: document.getElementById("meltSlider"),
      timeSpeedSlider: document.getElementById("timeSpeedSlider"),
      miciButtressingSlider: document.getElementById("miciButtressingSlider"),
      miciCriticalFreeboardSlider: document.getElementById("miciCriticalFreeboardSlider"),
      miciFailureTimescaleSlider: document.getElementById("miciFailureTimescaleSlider"),
      showVelocityColormap: document.getElementById("showVelocityColormap"),
      showFlowParticles: document.getElementById("showFlowParticles"),
      aValue: document.getElementById("aValue"),
      cValue: document.getElementById("cValue"),
      meltValue: document.getElementById("meltValue"),
      timeSpeedValue: document.getElementById("timeSpeedValue"),
      miciButtressingValue: document.getElementById("miciButtressingValue"),
      miciCriticalFreeboardValue: document.getElementById("miciCriticalFreeboardValue"),
      miciFailureTimescaleValue: document.getElementById("miciFailureTimescaleValue"),
      miciDiagFreeboard: document.getElementById("miciDiagFreeboard"),
      miciDiagCritical: document.getElementById("miciDiagCritical"),
      miciDiagRate: document.getElementById("miciDiagRate"),
      miciDiagState: document.getElementById("miciDiagState"),
      simStatus: document.getElementById("simStatus"),
      timeMetric: document.getElementById("timeMetric"),
      glMetric: document.getElementById("glMetric"),
      volumeMetric: document.getElementById("volumeMetric"),
      icebergMetric: document.getElementById("icebergMetric"),
      startBtn: document.getElementById("startBtn"),
      pauseBtn: document.getElementById("pauseBtn"),
      resetBtn: document.getElementById("resetBtn"),
      hydrofractureBtn: document.getElementById("hydrofractureBtn"),
      glChartCanvas: document.getElementById("glChart"),
      volumeChartCanvas: document.getElementById("volumeChart"),
    };

    this.onStart = null;
    this.onPause = null;
    this.onReset = null;
    this.onHydrofracture = null;
    this.charts = {
      groundingLine: null,
      volume: null,
    };

    this.initCharts();
    this.bindEvents();
    this.syncInputsFromState();
    this.updateReadouts();
    this.updateMetrics();
    this.updateCharts();
    this.setStatus("Ready");
    this.setRunning(false);
  }

  initCharts() {
    if (typeof Chart === "undefined") {
      this.setStatus("Chart.js failed to load");
      return;
    }

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      parsing: false,
      normalized: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "nearest", intersect: false },
      },
      elements: {
        point: { radius: 0 },
        line: { tension: 0.14, borderWidth: 2 },
      },
      scales: {
        x: {
          type: "linear",
          title: { display: true, text: "Time (yr)" },
          grid: { color: "rgba(34, 78, 97, 0.11)" },
          ticks: { color: "#315060", maxTicksLimit: 6 },
        },
      },
    };

    this.charts.groundingLine = new Chart(this.el.glChartCanvas.getContext("2d"), {
      type: "line",
      data: {
        datasets: [
          {
            borderColor: "#1b789d",
            backgroundColor: "rgba(27, 120, 157, 0.18)",
            data: [],
          },
        ],
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            title: { display: true, text: "x_GL (km)" },
            grid: { color: "rgba(34, 78, 97, 0.11)" },
            ticks: { color: "#315060", maxTicksLimit: 5 },
          },
        },
      },
    });

    this.charts.volume = new Chart(this.el.volumeChartCanvas.getContext("2d"), {
      type: "line",
      data: {
        datasets: [
          {
            borderColor: "#0f8d6a",
            backgroundColor: "rgba(15, 141, 106, 0.18)",
            data: [],
          },
        ],
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            title: { display: true, text: "Volume (x10^9 m^2)" },
            grid: { color: "rgba(34, 78, 97, 0.11)" },
            ticks: { color: "#315060", maxTicksLimit: 5 },
          },
        },
      },
    });
  }

  bindEvents() {
    this.el.aSlider.addEventListener("input", () => {
      this.state.params.AExponent = Number(this.el.aSlider.value);
      this.state.params.A = 10 ** this.state.params.AExponent;
      this.updateReadouts();
    });

    this.el.cSlider.addEventListener("input", () => {
      this.state.params.CExponent = Number(this.el.cSlider.value);
      this.state.params.C = 10 ** this.state.params.CExponent;
      this.updateReadouts();
    });

    this.el.meltSlider.addEventListener("input", () => {
      this.state.params.basalMeltMyr = Number(this.el.meltSlider.value);
      this.updateReadouts();
    });

    this.el.timeSpeedSlider.addEventListener("input", () => {
      this.state.params.timeSpeed = Number(this.el.timeSpeedSlider.value);
      this.updateReadouts();
    });

    this.el.miciButtressingSlider.addEventListener("input", () => {
      this.state.params.miciButtressing = Number(this.el.miciButtressingSlider.value);
      applyMiciCalvingStep(this.state, 0.0);
      this.updateReadouts();
      this.updateMetrics();
      this.renderer.draw();
    });

    this.el.miciCriticalFreeboardSlider.addEventListener("input", () => {
      this.state.params.miciCriticalFreeboard = Number(this.el.miciCriticalFreeboardSlider.value);
      this.state.calving.criticalFreeboard = this.state.params.miciCriticalFreeboard;
      applyMiciCalvingStep(this.state, 0.0);
      this.updateReadouts();
      this.updateMetrics();
      this.renderer.draw();
    });

    this.el.miciFailureTimescaleSlider.addEventListener("input", () => {
      this.state.params.miciFailureTimescale = Number(this.el.miciFailureTimescaleSlider.value);
      applyMiciCalvingStep(this.state, 0.0);
      this.updateReadouts();
      this.updateMetrics();
      this.renderer.draw();
    });

    this.el.showVelocityColormap.addEventListener("change", () => {
      this.state.params.showVelocityColormap = this.el.showVelocityColormap.checked;
      this.renderer.draw();
    });

    this.el.showFlowParticles.addEventListener("change", () => {
      this.state.params.showFlowParticles = this.el.showFlowParticles.checked;
      if (this.state.params.showFlowParticles && this.state.flowParticles.length === 0) {
        initializeFlowParticles(this.state);
      }
      this.renderer.draw();
    });

    this.el.bedPreset.addEventListener("change", () => {
      this.state.params.bedPreset = this.el.bedPreset.value;
      initializeState(this.state);
      this.updateMetrics();
      this.updateCharts();
      this.renderer.draw();
    });

    this.el.startBtn.addEventListener("click", () => {
      if (typeof this.onStart === "function") {
        this.onStart();
      }
    });

    this.el.pauseBtn.addEventListener("click", () => {
      if (typeof this.onPause === "function") {
        this.onPause();
      }
    });

    this.el.resetBtn.addEventListener("click", () => {
      if (typeof this.onReset === "function") {
        this.onReset();
      }
    });

    this.el.hydrofractureBtn.addEventListener("click", () => {
      if (typeof this.onHydrofracture === "function") {
        this.onHydrofracture();
      }
    });
  }

  syncInputsFromState() {
    this.el.bedPreset.value = this.state.params.bedPreset;
    this.el.aSlider.value = String(this.state.params.AExponent);
    this.el.cSlider.value = String(this.state.params.CExponent);
    this.el.meltSlider.value = String(this.state.params.basalMeltMyr);
    this.el.timeSpeedSlider.value = String(this.state.params.timeSpeed);
    this.el.miciButtressingSlider.value = String(this.state.params.miciButtressing);
    this.el.miciCriticalFreeboardSlider.value = String(this.state.params.miciCriticalFreeboard);
    this.el.miciFailureTimescaleSlider.value = String(this.state.params.miciFailureTimescale);
    this.el.showVelocityColormap.checked = Boolean(this.state.params.showVelocityColormap);
    this.el.showFlowParticles.checked = Boolean(this.state.params.showFlowParticles);
  }

  updateReadouts() {
    this.el.aValue.textContent = scientificString(this.state.params.A, 2);
    this.el.cValue.textContent = scientificString(this.state.params.C, 2);
    this.el.meltValue.textContent = `${this.state.params.basalMeltMyr.toFixed(2)} m/yr`;
    this.el.timeSpeedValue.textContent = `${this.state.params.timeSpeed.toFixed(2)}x`;
    this.el.miciButtressingValue.textContent = `${this.state.params.miciButtressing.toFixed(2)}`;
    this.el.miciCriticalFreeboardValue.textContent = `${this.state.params.miciCriticalFreeboard.toFixed(0)} m`;
    this.el.miciFailureTimescaleValue.textContent = `${this.state.params.miciFailureTimescale.toFixed(2)} yr`;
  }

  updateMetrics() {
    this.el.timeMetric.textContent = `${this.state.timeYears.toFixed(2)} yr`;
    this.el.glMetric.textContent = `${(this.state.groundingLineX / 1000.0).toFixed(1)} km`;
    this.el.volumeMetric.textContent = `${(this.state.volume / 1e9).toFixed(3)} x10^9 m^2`;
    this.el.icebergMetric.textContent = `${this.state.icebergs.length}`;

    this.el.miciDiagFreeboard.textContent = `${this.state.calving.freeboard.toFixed(1)} m`;
    this.el.miciDiagCritical.textContent = `${this.state.calving.criticalFreeboard.toFixed(1)} m`;
    this.el.miciDiagRate.textContent = `${this.state.calving.retreatRate.toFixed(1)} m/yr`;
    this.el.miciDiagState.textContent = this.state.calving.active
      ? "Unstable (MICI on)"
      : this.state.calving.groundedMarineCliff
        ? "Stable marine cliff"
        : "No grounded marine cliff";
  }

  updateCharts() {
    if (!this.charts.groundingLine || !this.charts.volume) {
      return;
    }

    const glData = this.state.history.time.map((time, i) => ({
      x: time,
      y: this.state.history.groundingLineKm[i],
    }));
    const volumeData = this.state.history.time.map((time, i) => ({
      x: time,
      y: this.state.history.volumeGm2[i],
    }));

    this.charts.groundingLine.data.datasets[0].data = glData;
    this.charts.volume.data.datasets[0].data = volumeData;
    this.charts.groundingLine.update("none");
    this.charts.volume.update("none");
  }

  setStatus(text, running = false) {
    this.el.simStatus.textContent = text;
    this.el.simStatus.classList.toggle("running", running);
  }

  setRunning(isRunning) {
    this.el.startBtn.disabled = isRunning;
    this.el.pauseBtn.disabled = !isRunning;
    if (isRunning) {
      this.setStatus("Running", true);
    } else if (this.state.timeYears === 0.0) {
      this.setStatus("Ready", false);
    } else {
      this.setStatus("Paused", false);
    }
  }
}

function solveSSAForVelocity(state) {
  // Lightweight surrogate for the upcoming SSA solver.
  // Uses driving stress + parameter sensitivity to produce responsive edge velocities.
  const { rhoIce, gravity } = state.constants;
  const { dx, nodes } = state.grid;
  const softnessFactor = clamp(Math.pow(state.params.A / A_REF, 0.22), 0.25, 8.0);
  const frictionFactor = clamp(Math.pow(C_REF / state.params.C, 0.55), 0.15, 6.0);
  const uMax = 4500.0; // m/yr cap for stability in this prototype

  state.u[0] = 0.0; // divide boundary
  for (let edge = 1; edge < nodes; edge += 1) {
    const left = edge - 1;
    const right = edge;
    const HEdge = 0.5 * (Math.max(state.H[left], 0.0) + Math.max(state.H[right], 0.0));

    const surfaceSlope = (state.surface[right] - state.surface[left]) / dx;
    const drivingSlope = Math.max(-surfaceSlope, 0.0);
    const tauD = rhoIce * gravity * HEdge * drivingSlope; // Pa

    const deformVelocity = 7.5 * softnessFactor * state.params.A * Math.pow(tauD, 3) * SECONDS_PER_YEAR * HEdge;
    const slidingVelocity = 95.0 * frictionFactor * Math.pow(tauD / 1e5, 2);

    const floatBoost = 1.0 + 0.45 * 0.5 * (state.afloat[left] + state.afloat[right]);
    const edgeVelocity = (deformVelocity + slidingVelocity) * floatBoost;

    state.u[edge] = clamp(edgeVelocity, 0.0, uMax);
  }

  // Open boundary: weak extrapolation of terminal outflow.
  state.u[nodes] = clamp(1.02 * state.u[nodes - 1], 0.0, uMax);
  return state.u;
}

function updateThicknessMassConservation(state, dtYears) {
  // Explicit thickness update for prototype interaction:
  // dH/dt = -d(Hu)/dx + SMB - BasalMelt(floating)
  const { nodes, dx, xH, domainLength } = state.grid;
  const flux = new Float64Array(nodes + 1);
  const nextH = new Float64Array(nodes);

  flux[0] = 0.0;
  for (let edge = 1; edge < nodes; edge += 1) {
    const HEdge = 0.5 * (Math.max(state.H[edge - 1], 0.0) + Math.max(state.H[edge], 0.0));
    flux[edge] = HEdge * state.u[edge];
  }
  flux[nodes] = Math.max(state.H[nodes - 1], 0.0) * Math.max(state.u[nodes], 0.0);

  for (let i = 0; i < nodes; i += 1) {
    const xi = xH[i] / domainLength;
    const smb = clamp(0.55 - 0.9 * xi, -0.45, 0.65); // m/yr
    const basalMelt = state.afloat[i] ? state.params.basalMeltMyr : 0.0; // m/yr
    const fluxDiv = (flux[i + 1] - flux[i]) / dx; // m/yr
    const tendency = -fluxDiv + smb - basalMelt;
    nextH[i] = Math.max(state.H[i] + dtYears * tendency, 0.0);
  }

  // Mild smoothing damps grid-scale oscillations from explicit advection.
  for (let i = 1; i < nodes - 1; i += 1) {
    nextH[i] = 0.90 * nextH[i] + 0.05 * nextH[i - 1] + 0.05 * nextH[i + 1];
  }

  state.H.set(nextH);
  return { H: state.H, dtYears };
}

function groundingLineFluxParameterization(state) {
  // Placeholder hook: keep explicit call site for upcoming sub-grid GL flux closure.
  return state.groundingLineX;
}

function applyMiciCalvingStep(state, dtYears) {
  const { dx, xH } = state.grid;
  const terminusIndex = findTerminusIndex(state, 1.0);
  if (terminusIndex < 0) {
    state.calving.retreatRate = 0.0;
    state.calving.freeboard = 0.0;
    state.calving.criticalFreeboard = state.params.miciCriticalFreeboard;
    state.calving.buttressingEffective = 0.0;
    state.calving.active = false;
    state.calving.groundedMarineCliff = false;
    state.calving.cliffX = 0.0;
    state.accumulatedCalving = 0.0;
    return;
  }

  const cliffIndex = findMiciCliffIndex(state, terminusIndex);
  if (cliffIndex < 0) {
    state.calving.retreatRate = 0.0;
    state.calving.freeboard = 0.0;
    state.calving.criticalFreeboard = state.params.miciCriticalFreeboard;
    state.calving.buttressingEffective = 0.0;
    state.calving.active = false;
    state.calving.groundedMarineCliff = false;
    state.calving.cliffX = 0.0;
    return;
  }

  const bedCliff = state.bed[cliffIndex];
  const surfaceCliff = state.surface[cliffIndex];
  const freeboard = Math.max(surfaceCliff, 0.0);
  const groundedMarineCliff = bedCliff < 0.0;
  state.calving.cliffX = state.grid.xH[cliffIndex];

  const shelfPresent = terminusIndex > cliffIndex || hasFloatingShelf(state);
  const buttressingBase = clamp(state.params.miciButtressing, 0.0, 1.0);
  const buttressingEffective = shelfPresent ? buttressingBase : 0.0;
  const criticalFreeboard = Math.max(state.params.miciCriticalFreeboard, 1.0);
  const freeboardExcess = Math.max(freeboard - criticalFreeboard, 0.0);
  const instability = freeboardExcess / criticalFreeboard;

  const tauYears = Math.max(state.params.miciFailureTimescale, 0.1);
  const retreatScale = dx / tauYears;
  const exponent = Math.max(state.params.miciExponent, 1.0);
  const waterDepth = Math.max(-bedCliff, 0.0);
  const waterAmplification = 1.0 + 0.45 * clamp(waterDepth / 700.0, 0.0, 2.0);
  const buttressingDamp = Math.pow(1.0 - buttressingEffective, 2.0);

  const retreatRaw =
    retreatScale *
    Math.pow(instability, exponent) *
    waterAmplification *
    buttressingDamp;
  const retreatRate =
    groundedMarineCliff && freeboardExcess > 0.0
      ? Math.min(retreatRaw, state.params.miciRateCap)
      : 0.0;

  state.calving.retreatRate = retreatRate;
  state.calving.freeboard = freeboard;
  state.calving.criticalFreeboard = criticalFreeboard;
  state.calving.buttressingEffective = buttressingEffective;
  state.calving.active = retreatRate > 0.0;
  state.calving.groundedMarineCliff = groundedMarineCliff;

  state.accumulatedCalving += retreatRate * dtYears;
  let safety = 0;
  while (state.accumulatedCalving >= dx && safety < state.H.length) {
    const idx = findTerminusIndex(state, 1.0);
    if (idx < 0) {
      state.accumulatedCalving = 0.0;
      break;
    }

    const HCell = state.H[idx];
    if (HCell > 0.0) {
      state.H[idx] = 0.0;
      spawnIceberg(state, xH[idx], dx, HCell, state.params.icebergDefaultDriftSpeed);
      state.calving.lastEventX = xH[idx];
      state.calving.eventFlash = 1.0;
    }
    state.accumulatedCalving -= dx;
    safety += 1;
  }
}

function updateCalvingVisuals(state, elapsedSeconds) {
  if (!Number.isFinite(state.calving.eventFlash) || state.calving.eventFlash <= 0.0) {
    state.calving.eventFlash = 0.0;
    return;
  }
  const decay = Math.max(elapsedSeconds, 0.0) / 0.55;
  state.calving.eventFlash = Math.max(state.calving.eventFlash - decay, 0.0);
}

function updateIcebergParticles(state, dtYears) {
  if (state.icebergs.length === 0) {
    return;
  }

  const alive = [];
  for (let i = 0; i < state.icebergs.length; i += 1) {
    const berg = state.icebergs[i];
    berg.x += berg.driftSpeed * dtYears;
    berg.H -= state.params.icebergMeltHRate * dtYears;
    berg.width -= state.params.icebergMeltWidthRate * dtYears;
    if (berg.H > 0.0 && berg.width > 0.0) {
      alive.push(berg);
    }
  }
  state.icebergs = alive;
}

function triggerHydrofractureBreakShelf(state) {
  const { xH, dx } = state.grid;
  let detachedCount = 0;
  for (let i = 0; i < state.H.length; i += 1) {
    if (isFloatingCell(state, i)) {
      const HCell = state.H[i];
      if (HCell > 0.0) {
        state.H[i] = 0.0;
        spawnIceberg(state, xH[i], dx, HCell, state.params.icebergDefaultDriftSpeed);
        detachedCount += 1;
      }
    }
  }
  return detachedCount;
}

class SimulationController {
  constructor(state, renderer, dashboard) {
    this.state = state;
    this.renderer = renderer;
    this.dashboard = dashboard;
    this.running = false;
    this.rafId = null;
    this.lastFrameMs = 0;
    this.accumulator = 0;
    this.realStepSeconds = 1.0 / 30.0;

    this.dashboard.onStart = () => this.start();
    this.dashboard.onPause = () => this.pause();
    this.dashboard.onReset = () => this.reset();
    this.dashboard.onHydrofracture = () => this.triggerHydrofracture();
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastFrameMs = 0;
    this.accumulator = 0;
    this.dashboard.setRunning(true);
    this.rafId = requestAnimationFrame((timeMs) => this.loop(timeMs));
  }

  pause() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.dashboard.setRunning(false);
  }

  reset() {
    this.pause();
    initializeState(this.state);
    this.dashboard.syncInputsFromState();
    this.dashboard.updateReadouts();
    this.dashboard.updateMetrics();
    this.dashboard.updateCharts();
    this.renderer.draw();
  }

  triggerHydrofracture() {
    const detachedCount = triggerHydrofractureBreakShelf(this.state);
    if (detachedCount > 0) {
      recomputeDerivedFields(this.state);
      applyMiciCalvingStep(this.state, 0.0);
      updatePenguins(this.state, 0.0, 0.0);
      appendHistoryPoint(this.state);
      this.dashboard.setStatus(`Hydrofracture: ${detachedCount} shelf cells`, false);
      this.dashboard.updateMetrics();
      this.dashboard.updateCharts();
      this.renderer.draw();
    } else {
      this.dashboard.setStatus("Hydrofracture: no floating shelf", false);
    }
  }

  loop(timeMs) {
    if (!this.running) {
      return;
    }

    if (this.lastFrameMs === 0) {
      this.lastFrameMs = timeMs;
    }
    const elapsed = Math.min(0.25, (timeMs - this.lastFrameMs) / 1000.0);
    this.lastFrameMs = timeMs;
    const timeScale = Math.max(this.state.params.timeSpeed, 0.0);
    this.accumulator += elapsed * timeScale;

    while (this.accumulator >= this.realStepSeconds) {
      this.advanceOneModelStep();
      this.accumulator -= this.realStepSeconds;
    }

    updateFlowParticles(this.state, elapsed * timeScale);
    updatePenguins(this.state, 0.0, elapsed);
    updateCalvingVisuals(this.state, elapsed);
    this.renderer.draw();
    this.dashboard.updateMetrics();
    this.dashboard.updateCharts();
    this.rafId = requestAnimationFrame((nextTimeMs) => this.loop(nextTimeMs));
  }

  advanceOneModelStep() {
    solveSSAForVelocity(this.state);
    updateThicknessMassConservation(this.state, this.state.params.dtYears);
    groundingLineFluxParameterization(this.state);
    recomputeDerivedFields(this.state);
    applyMiciCalvingStep(this.state, this.state.params.dtYears);
    updateIcebergParticles(this.state, this.state.params.dtYears);

    this.state.timeYears += this.state.params.dtYears;
    recomputeDerivedFields(this.state);
    updatePenguins(this.state, this.state.params.dtYears, 0.0);

    const history = this.state.history.time;
    const lastSavedTime = history.length > 0 ? history[history.length - 1] : -Infinity;
    if (this.state.timeYears - lastSavedTime >= this.state.params.chartSampleYears) {
      appendHistoryPoint(this.state);
    }
  }
}

function boot() {
  const state = createModelState();
  initializeState(state);

  const canvas = document.getElementById("profileCanvas");
  const renderer = new FlowlineRenderer(canvas, state);
  const dashboard = new Dashboard(state, renderer);
  const controller = new SimulationController(state, renderer, dashboard);
  void controller;

  dashboard.updateReadouts();
  dashboard.updateMetrics();
  dashboard.updateCharts();
  renderer.draw();
}

if (document.readyState === "complete") {
  boot();
} else {
  window.addEventListener("load", boot, { once: true });
}
