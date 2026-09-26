// Interactive "Research Journey" globe on the Experience page (MapLibre GL JS, self-hosted).
import * as maplibregl from '../vendor/maplibre-gl/6.11.2/maplibre-gl.mjs';
import { CATEGORIES, STOPS } from './journey-stops.js';

const MAP_ID = 'experience-map';
const LIST_ID = 'journey-stops';
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const HOME_CENTER = [135, -10];
const GLOBE_FILL = 0.8; // on-screen globe diameter as a fraction of the map's shorter side
const CAMERA_DISTANCE = 1.5; // camera-to-center distance in viewport heights
const SPIN_DEG_PER_SEC = 3;
const SPIN_MAX_ZOOM = 3;
const CATEGORY_ORDER = ['base', 'field', 'event'];
const NARROW_MAP_WIDTH = 640; // px; MapLibre's own compact-attribution breakpoint

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Esri World Imagery plus a transparent boundaries-and-places overlay; both are keyless.
function buildStyle() {
  const tiles = (service) => [`${ESRI}/${service}/MapServer/tile/{z}/{y}/{x}`];
  return {
    version: 8,
    projection: { type: 'globe' },
    sky: { 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0] },
    sources: {
      imagery: {
        type: 'raster',
        tiles: tiles('World_Imagery'),
        tileSize: 256,
        maxzoom: 19,
        attribution:
          'Imagery and labels &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      },
      labels: {
        type: 'raster',
        tiles: tiles('Reference/World_Boundaries_and_Places'),
        tileSize: 256,
        maxzoom: 19,
      },
    },
    layers: [
      { id: 'imagery', type: 'raster', source: 'imagery' },
      { id: 'labels', type: 'raster', source: 'labels', paint: { 'raster-opacity': 0.85 } },
    ],
  };
}

// Zoom at which the globe's silhouette spans GLOBE_FILL of the container's shorter side.
// The camera sits CAMERA_DISTANCE viewport heights above the center point (MapLibre's
// default field of view), so the visible disk is smaller than the globe radius suggests.
function homeZoom(container) {
  const height = container.clientHeight || 480;
  const width = container.clientWidth || height;
  const cameraDistance = CAMERA_DISTANCE * height;
  const tanHalfAngle = (GLOBE_FILL * Math.min(width, height)) / 2 / cameraDistance;
  const sinHalfAngle = tanHalfAngle / Math.hypot(1, tanHalfAngle);
  const radius = (sinHalfAngle * cameraDistance) / (1 - sinHalfAngle);
  const cosLat = Math.cos((HOME_CENTER[1] * Math.PI) / 180);
  return Math.log2((2 * Math.PI * radius * cosLat) / 512);
}

function stopsBounds() {
  return STOPS.reduce(
    (bounds, stop) => bounds.extend(stop.coords),
    new maplibregl.LngLatBounds(STOPS[0].coords, STOPS[0].coords),
  );
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function chipLabel(stop) {
  return stop.label ?? stop.place.split(',')[0];
}

function buildPopupContent(stop) {
  const category = CATEGORIES[stop.category];
  const root = el('div', 'journey-popup');
  const meta = el('p', 'journey-popup__meta');
  const dot = el('span', 'journey-dot');
  dot.style.setProperty('--dot-color', category.color);
  meta.append(dot, `${category.label} · ${stop.years}`);
  root.append(
    meta,
    el('p', 'journey-popup__title', stop.place),
    el('p', 'journey-popup__institution', stop.institution),
    el('p', 'journey-popup__summary', stop.summary),
  );
  return root;
}

function buildMarkerElement(stop) {
  const button = el('button', `journey-marker journey-marker--${stop.category}`);
  button.type = 'button';
  button.style.setProperty('--dot-color', CATEGORIES[stop.category].color);
  button.setAttribute('aria-label', `${stop.place} — ${stop.institution} (${stop.years})`);
  button.title = stop.place;
  // The chips below the map are the keyboard route; markers on the far side of the
  // globe are invisible, so keep them out of the tab order.
  button.tabIndex = -1;
  button.append(el('span', 'journey-marker__dot'));
  return button;
}

// Stop chips grouped by category; doubles as the map legend. Without onSelect (map
// failed to start) the chips are rendered disabled, as a plain list of stops.
function buildStopList(list, onSelect) {
  const chips = new Map();
  CATEGORY_ORDER.forEach((key) => {
    const group = el('div', 'journey-group');
    const label = el('p', 'journey-group__label');
    const dot = el('span', 'journey-dot');
    dot.style.setProperty('--dot-color', CATEGORIES[key].color);
    label.append(dot, CATEGORIES[key].label);
    label.id = `journey-group-${key}`;
    group.setAttribute('role', 'group');
    group.setAttribute('aria-labelledby', label.id);
    const row = el('div', 'journey-group__chips');
    STOPS.filter((stop) => stop.category === key).forEach((stop) => {
      const chip = el('button', 'journey-chip');
      chip.type = 'button';
      chip.append(el('span', 'journey-chip__place', chipLabel(stop)));
      chip.append(el('span', 'journey-chip__years', stop.years));
      if (onSelect) chip.addEventListener('click', () => onSelect(stop));
      else chip.disabled = true;
      chips.set(stop.id, chip);
      row.append(chip);
    });
    group.append(label, row);
    list.append(group);
  });
  return chips;
}

function addMarkers(map, onSelect) {
  const markers = new Map();
  STOPS.forEach((stop) => {
    const element = buildMarkerElement(stop);
    element.addEventListener('click', (event) => {
      // Markers live inside the canvas container, so without this the map's own click
      // handling would close the popup that onSelect has just opened.
      event.stopPropagation();
      onSelect(stop);
    });
    const marker = new maplibregl.Marker({ element, opacityWhenCovered: 0 });
    markers.set(stop.id, marker.setLngLat(stop.coords).addTo(map));
  });
  return markers;
}

// Polite live region so keyboard and screen-reader users hear which stop was selected.
function createAnnouncer(parent) {
  const region = el('p', 'journey-sr-only');
  region.setAttribute('aria-live', 'polite');
  parent.append(region);
  return (message) => {
    region.textContent = message;
  };
}

// Slow idle rotation of the globe; stops for good once the user takes over.
function createSpinner(map, container) {
  let enabled = !reducedMotion.matches;
  let visible = true;

  const step = () => {
    if (!enabled || !visible || document.hidden) return;
    if (map.getProjection()?.type !== 'globe') return; // the Globe control can switch to flat
    if (map.isMoving() || map.getZoom() > SPIN_MAX_ZOOM) return;
    const center = map.getCenter();
    center.lng -= SPIN_DEG_PER_SEC;
    map.easeTo({ center, duration: 1000, easing: (t) => t });
  };
  const stop = () => {
    enabled = false;
  };

  map.on('moveend', step);
  map.on('projectiontransition', step);
  map.on('mousedown', stop);
  map.on('touchstart', stop);
  map.on('movestart', (event) => {
    if (event.originalEvent) stop();
  });
  document.addEventListener('visibilitychange', step);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    step();
  }).observe(container);

  return {
    stop,
    resume() {
      enabled = !reducedMotion.matches;
    },
    kick: step,
  };
}

// Owns the shared popup and the highlighted chip and marker of the selected stop.
function createStopSelector(map, spinner, { chips, markers, announce }) {
  // No focusAfterOpen: the popup opens while the camera is still flying, so it can sit far
  // off-screen, and focusing it would scroll the whole page.
  const popup = new maplibregl.Popup({
    offset: 16,
    maxWidth: '300px',
    className: 'journey-popup-shell',
    focusAfterOpen: false,
  });
  let activeId = null;

  const setActive = (id) => {
    [activeId, id].forEach((key) => {
      if (!key) return;
      const isActive = key === id;
      [chips.get(key), markers.get(key)?.getElement()].forEach((node) => {
        if (!node) return;
        node.classList.toggle('is-active', isActive);
        if (isActive) node.setAttribute('aria-current', 'true');
        else node.removeAttribute('aria-current');
      });
    });
    activeId = id;
  };
  popup.on('close', () => setActive(null));

  return {
    select(stop) {
      spinner.stop();
      // addTo() closes a popup that is already open, which fires 'close' and clears the
      // active stop, so highlight only after the popup is attached.
      popup.setLngLat(stop.coords).setDOMContent(buildPopupContent(stop)).addTo(map);
      setActive(stop.id);
      announce(`${stop.place}: ${stop.institution}, ${stop.years}. ${stop.summary}`);
      map.flyTo({ center: stop.coords, zoom: stop.zoom, speed: 1.4, curve: 1.6 });
    },
    clear() {
      popup.remove();
    },
  };
}

class HomeControl {
  constructor(onHome) {
    this.onHome = onHome;
  }

  onAdd() {
    this.container = el('div', 'maplibregl-ctrl maplibregl-ctrl-group');
    const button = el('button', 'journey-home-button');
    button.type = 'button';
    button.title = 'Reset view';
    button.setAttribute('aria-label', 'Reset view');
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    button.addEventListener('click', this.onHome);
    this.container.append(button);
    return this.container;
  }

  onRemove() {
    this.container.remove();
  }
}

function createMap(container) {
  const map = new maplibregl.Map({
    container,
    style: buildStyle(),
    center: HOME_CENTER,
    zoom: homeZoom(container),
    maxZoom: 18,
    cooperativeGestures: true,
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  map.addControl(new maplibregl.GlobeControl(), 'top-right');
  map.addControl(new maplibregl.FullscreenControl(), 'top-right');
  return map;
}

// MapLibre's compact attribution starts expanded and only collapses on the first drag.
// On phone-sized maps the expanded text covers the bottom of the globe, so start those
// collapsed behind the (i) button; wider maps keep the full credit visible.
function collapseCompactAttribution(container) {
  if (container.clientWidth > NARROW_MAP_WIDTH) return;
  const attribution = container.querySelector('.maplibregl-ctrl-attrib.maplibregl-compact');
  if (!attribution) return;
  attribution.classList.remove('maplibregl-compact-show');
  attribution.removeAttribute('open');
}

function showFallback(container, list, error) {
  console.error('Journey map failed to start:', error);
  container.classList.add('journey-map--fallback');
  container.removeAttribute('role');
  container.removeAttribute('aria-label');
  container.replaceChildren(
    el('p', 'journey-fallback', 'The interactive map could not start in this browser (it needs WebGL). The stops are listed below.'),
  );
  buildStopList(list, null);
}

// Resolves once the container has a real size. Built at 0x0 (page CSS not applied yet, or
// a tab laid out while hidden), MapLibre falls back to a 400x300 canvas and the home zoom
// is computed for the wrong size.
function whenSized(container) {
  const sized = () => container.clientWidth > 0 && container.clientHeight > 0;
  if (sized()) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new ResizeObserver(() => {
      if (!sized()) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(container);
  });
}

async function initJourneyMap() {
  const container = document.getElementById(MAP_ID);
  const list = document.getElementById(LIST_ID);
  if (!container || !list) return;
  await whenSized(container);

  let map;
  try {
    map = createMap(container);
  } catch (error) {
    showFallback(container, list, error);
    return;
  }

  const spinner = createSpinner(map, container);
  const onSelect = (stop) => selector.select(stop);
  const selector = createStopSelector(map, spinner, {
    chips: buildStopList(list, onSelect),
    markers: addMarkers(map, onSelect),
    announce: createAnnouncer(list.parentElement),
  });

  map.addControl(
    new HomeControl(() => {
      selector.clear();
      if (map.getProjection()?.type === 'globe') {
        spinner.resume();
        map.flyTo({ center: HOME_CENTER, zoom: homeZoom(container), bearing: 0, pitch: 0 });
      } else {
        map.fitBounds(stopsBounds(), { padding: 48, bearing: 0, pitch: 0 });
      }
    }),
    'top-right',
  );
  map.once('load', () => {
    collapseCompactAttribution(container);
    spinner.kick();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initJourneyMap);
} else {
  initJourneyMap();
}
