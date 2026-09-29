// Atmosphere for the Experience-page globe, drawn in CSS around the globe's on-screen disk.
// MapLibre's own scattering pass assumes a dark sky behind the globe: on the light page its
// sunlit limb composites to a flat white crescent, so it is switched off in the map style.

export const CAMERA_DISTANCE = 1.5; // camera-to-center distance in viewport heights
const TILE_WORLD_SIZE = 512; // MapLibre's world size at zoom 0, in CSS pixels
const PITCH_FADE = [15, 35]; // degrees; the disk turns elliptical, so fade the rings out
const HIDE_BEYOND = 2.5; // disk radii past which the rim is far off-screen, in half-diagonals

const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Globe radius in CSS pixels. MapLibre scales the globe by 1/cos(center latitude) so the map
// scale at the center matches Web Mercator.
function globeRadius(zoom, lat) {
  const cosLat = Math.cos((lat * Math.PI) / 180);
  return (TILE_WORLD_SIZE * 2 ** zoom) / (2 * Math.PI * cosLat);
}

// On-screen silhouette of the globe for a camera CAMERA_DISTANCE viewport heights above the
// center point, tilted back by `pitch`. Pitch pushes the globe's center straight down the
// screen (bearing only spins the globe about the view axis).
function globeDisk(map, width, height) {
  const cameraDistance = CAMERA_DISTANCE * height;
  const radius = globeRadius(map.getZoom(), map.getCenter().lat);
  const pitch = (map.getPitch() * Math.PI) / 180;
  const toCenter = Math.sqrt(radius ** 2 + 2 * radius * cameraDistance * Math.cos(pitch) + cameraDistance ** 2);
  const sinHalfAngle = Math.min(radius / toCenter, 0.999);
  const offset = (cameraDistance * radius * Math.sin(pitch)) / (radius * Math.cos(pitch) + cameraDistance);
  return {
    x: width / 2,
    y: height / 2 + offset,
    r: (cameraDistance * sinHalfAngle) / Math.sqrt(1 - sinHalfAngle ** 2),
  };
}

function ringOpacity(map, disk, width, height) {
  if (map.getProjection()?.type !== 'globe') return 0;
  const [fadeStart, fadeEnd] = PITCH_FADE;
  const pitchFade = 1 - clamp01((map.getPitch() - fadeStart) / (fadeEnd - fadeStart));
  const tooBig = disk.r > HIDE_BEYOND * Math.hypot(width, height) / 2;
  return tooBig ? 0 : pitchFade;
}

// Adds a halo behind the (transparent) canvas and limb shading on top of the imagery. The
// shading sits directly after the canvas, so markers and popups still render above it.
export function addAtmosphere(map, container) {
  const canvas = map.getCanvas();
  const halo = document.createElement('div');
  const limb = document.createElement('div');
  halo.className = 'journey-halo';
  limb.className = 'journey-limb';
  halo.setAttribute('aria-hidden', 'true');
  limb.setAttribute('aria-hidden', 'true');
  canvas.before(halo);
  canvas.after(limb);

  const update = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const disk = globeDisk(map, width, height);
    const opacity = ringOpacity(map, disk, width, height);
    container.style.setProperty('--globe-x', `${disk.x}px`);
    container.style.setProperty('--globe-y', `${disk.y}px`);
    container.style.setProperty('--globe-r', `${disk.r}px`);
    container.style.setProperty('--globe-atmosphere', String(opacity));
    container.classList.toggle('journey-map--no-atmosphere', opacity === 0);
  };

  map.on('move', update);
  map.on('resize', update);
  map.on('projectiontransition', update);
  update();
}
