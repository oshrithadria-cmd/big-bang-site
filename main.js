(async () => {

// ---------- Helpers ----------
function clamp01(v){ return Math.max(0, Math.min(1, v)); }
function lerp(a,b,t){ return a + (b-a)*t; }
function easeInOutCubic(t){
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}
function easeOutExpo(t){ return t===1 ? 1 : 1 - Math.pow(2, -10*t); }
function phaseT(p,a,b){ return clamp01((p-a)/(b-a)); }

async function sampleStarsFromImage(imgUrl, count = 8000, threshold = 170) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imgUrl;
  await img.decode();

  const c = document.createElement("canvas");
  const ctx = c.getContext("2d", { willReadFrequently: true });

  const W = 512;
  const H = Math.round((img.height / img.width) * W);
  c.width = W; c.height = H;

  ctx.drawImage(img, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  const candidates = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      const lum = 0.2126*r + 0.7152*g + 0.0722*b;
      if (lum > threshold) candidates.push({ x, y, lum });
    }
  }

    if (candidates.length === 0) {
    // fallback כדי שלא יהיה מסך ריק
    const out = new Float32Array(count * 3);
    for (let k = 0; k < count; k++) {
      out[k*3+0] = (Math.random() * 2 - 1);
      out[k*3+1] = (Math.random() * 2 - 1);
      out[k*3+2] = (Math.random() * 2 - 1) * 0.02;
    }
    return out;
  }


  const out = new Float32Array(count * 3);
  for (let k = 0; k < count; k++) {
    const p = candidates[Math.floor(Math.random() * candidates.length)];
    const nx = (p.x / (W - 1)) * 2 - 1;
    const ny = -((p.y / (H - 1)) * 2 - 1);
    const z = (Math.random() * 2 - 1) * 0.02;

    out[k*3+0] = nx;
    out[k*3+1] = ny;
    out[k*3+2] = z;
  }
  return out;
}

function pointInDisk(radius = 0.25) {
  const a = Math.random() * Math.PI * 2;
  const r = radius * Math.sqrt(Math.random());
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

// ---------- Scene ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 200);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearAlpha(0); // חשוב! שהקנבס יהיה שקוף
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ---------- Particles setup ----------
const particleCount = 22000;   // 22,000 כוכבים - יותר לפיצוץ!
const leftCount = 4000;        // יותר בכדורים
const rightCount = 4000;

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const basePositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);


// Per-particle stable offsets (so it doesn't flicker)
const clusterOffsets = new Float32Array(particleCount * 3);

// Explosion directions
const explodeDirs = new Float32Array(particleCount * 3);

// Galaxy target params (stable per particle)
const galaxyR = new Float32Array(particleCount);
const galaxyTheta = new Float32Array(particleCount);
const galaxyZ = new Float32Array(particleCount);
const galaxyArm = new Float32Array(particleCount);

// --- Stage 2: stars seeded from background image ---
let sampled = null;
try {
  sampled = await sampleStarsFromImage("assets/space-bg.png.png", particleCount);
} catch (e) {
  console.error("sampleStarsFromImage failed:", e);
  sampled = null;
}

const STARFIELD_W = 20; // כמו שהיה לך
const STARFIELD_H = 12;
const STARFIELD_D = 12;

for (let i = 0; i < particleCount; i++){
  const ix = i*3;

  let x, y, z;

  if (sampled) {
    // sampled ב-NDC (-1..1) => ממירים לעולם שלך (20x12)
    const nx = sampled[ix];
    const ny = sampled[ix+1];
    x = nx * (STARFIELD_W * 0.5);
    y = ny * (STARFIELD_H * 0.5);
    z = (Math.random() - 0.5) * STARFIELD_D; // עומק אמיתי
  } else {
    // fallback – שלא יהיה ריק
    x = (Math.random() - 0.5) * STARFIELD_W;
    y = (Math.random() - 0.5) * STARFIELD_H;
    z = (Math.random() - 0.5) * STARFIELD_D;
  }

  positions[ix]=x; positions[ix+1]=y; positions[ix+2]=z;
  basePositions[ix]=x; basePositions[ix+1]=y; basePositions[ix+2]=z;

  // brightness
  const b = 0.55 + Math.random() * 0.45;
  colors[ix] = b; colors[ix+1] = b; colors[ix+2] = b;

  // clusterOffsets נשאיר לשימושים אחרים/גיוון, אבל לא חובה לגאת’ר העגול שלנו
  let ox = (Math.random() * 2 - 1);
  let oy = (Math.random() * 2 - 1);
  let oz = (Math.random() * 2 - 1);
  const olen = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
  ox /= olen; oy /= olen; oz /= olen;
  const rr = Math.pow(Math.random(), 0.55);
  clusterOffsets[ix]   = ox * rr;
  clusterOffsets[ix+1] = oy * rr;
  clusterOffsets[ix+2] = oz * rr;

  // explode dir
  let dx=(Math.random()-0.5), dy=(Math.random()-0.5), dz=(Math.random()-0.5);
  const len = Math.sqrt(dx*dx+dy*dy+dz*dz) || 1;
  explodeDirs[ix]=dx/len; explodeDirs[ix+1]=dy/len; explodeDirs[ix+2]=dz/len;

  // galaxy params (כמו שהיה לך)
  const u = Math.random();
  const rG = 0.3 + Math.pow(u, 0.55) * 5.0;
  galaxyR[i] = rG;
  galaxyArm[i] = Math.floor(Math.random() * 3);
  galaxyTheta[i] = Math.random() * Math.PI * 2;
  galaxyZ[i] = (Math.random() - 0.5) * 0.8;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

function makeStarTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  const g = ctx.createRadialGradient(
    size/2, size/2, 0,
    size/2, size/2, size/2
  );

  // מרכז בהיר + היילו רך
  g.addColorStop(0.00, "rgba(255,255,255,1)");
  g.addColorStop(0.15, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.25)");
  g.addColorStop(1.00, "rgba(255,255,255,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

const starTex = makeStarTexture();

const material = new THREE.PointsMaterial({
  size: 0.080,                // יותר “עגול” ובולט (תשחקי עם זה)
  map: starTex,               // 👈 עושה את הנקודות עגולות עם היילו
  transparent: true,
  opacity: 0.95,
  vertexColors: true,         // 👈 משתמש ב-colors שהוספנו
  depthWrite: false,          // 👈 שלא “יחנק” אחד את השני
  blending: THREE.AdditiveBlending, // 👈 מתמזג יפה לרקע כמו "בוקה"
  sizeAttenuation: true
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// ---------- Flash/Radiation Effect - HTML overlay ----------
const flashImg = document.createElement("img");
flashImg.src = "assets/flash-boom.png";
flashImg.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  width: 100vw;
  max-width: 1600px;
  height: auto;
  pointer-events: none;
  opacity: 0;
  z-index: 10;
  mix-blend-mode: screen;
  filter: brightness(1.2) contrast(1.2);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: auto;
  mask-image: radial-gradient(ellipse 75% 55% at center, transparent 12%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,1) 60%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 75% 55% at center, transparent 12%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,1) 60%, transparent 80%);
`;
document.body.appendChild(flashImg);

// Explosion speed per particle
const explodeSpeeds = new Float32Array(particleCount);
for (let i = 0; i < particleCount; i++) {
  explodeSpeeds[i] = 0.3 + Math.random() * 1.0 + (i % 9) * 0.07;
}

// Targets - אלכסוני: שמאל-למעלה, ימין-למטה
const leftTarget  = new THREE.Vector3(-5.2, 3.0, 0.0);   // שמאל למעלה
const rightTarget = new THREE.Vector3( 5.2, -3.0, 0.0);  // ימין למטה
const centerTarget= new THREE.Vector3( 0.0, 0.0, 0.0);

// --- Stage 3: circular gather targets (per particle) ---
const gatherTargets = new Float32Array(particleCount * 3);

// רדיוס הענן העגול בזמן איסוף (תשחקי 0.6..1.4)
const GATHER_RADIUS = 1.0;

for (let i = 0; i < particleCount; i++) {
  const ix = i * 3;

  const isLeft  = i < leftCount;
  const isRight = i >= leftCount && i < leftCount + rightCount;

  if (isLeft || isRight) {
    const c = isLeft ? leftTarget : rightTarget;

    // נקודה בתוך דיסקה (עגול!)
    const p = pointInDisk(GATHER_RADIUS);

    gatherTargets[ix]   = c.x + p.x;
    gatherTargets[ix+1] = c.y + p.y;
    gatherTargets[ix+2] = c.z + (Math.random() - 0.5) * 0.25; // עומק קטן, לא "קופסה"
  } else {
    // מי שלא משתתף באיסוף – נשאר במקור
    gatherTargets[ix]   = basePositions[ix];
    gatherTargets[ix+1] = basePositions[ix+1];
    gatherTargets[ix+2] = basePositions[ix+2];
  }
}


// ---------- Scroll progress ----------
let scrollProgress = 0;
function updateScrollProgress(){
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollProgress = clamp01(window.scrollY / maxScroll);
}
window.addEventListener("scroll", updateScrollProgress, { passive:true });
updateScrollProgress();

// ---------- Animation ----------
function animate(){
  requestAnimationFrame(animate);

  // phases - פיצוץ איטי ודרמטי!
const tGather     = easeInOutCubic(phaseT(scrollProgress, 0.00, 0.08));
const tCollide    = easeInOutCubic(phaseT(scrollProgress, 0.08, 0.15));

// *** FLASH - בום לבן! (0.15 עד 0.20) ***
const flashRaw = phaseT(scrollProgress, 0.15, 0.20);
const tFlash = flashRaw < 0.5 
  ? easeOutExpo(flashRaw * 2)
  : 1 - easeOutExpo((flashRaw - 0.5) * 2);

// פיצוץ זוהר! (0.15 עד 0.28) - יותר איטי
const explodeRaw = phaseT(scrollProgress, 0.15, 0.28);
let tExplode;
if (explodeRaw < 0.7) {
  tExplode = (explodeRaw / 0.7) * 0.25;
} else {
  const fastPart = (explodeRaw - 0.7) / 0.3;
  tExplode = 0.25 + easeOutExpo(fastPart) * 0.75;
}

// חזרה לכוכבים (0.26 עד 0.29) - נגמר לפני BLACK HOLES
const tAfter      = easeInOutCubic(phaseT(scrollProgress, 0.26, 0.29));

// *** BLACK HOLE - DISABLED ***
const tHole = 0;

// חזרה לכוכבים רגילים - DISABLED
const tStarsBack = 0;

// Purple phase - normal stars (0.58+)
const tPurple     = scrollProgress >= 0.58 ? 1.0 : 0;

// Galaxy formation phase (0.68+)
const tGalaxyForm = phaseT(scrollProgress, 0.68, 0.78);

// גלקסיה (0.70 עד 0.80)
const tGalaxy     = easeInOutCubic(phaseT(scrollProgress, 0.70, 0.80));

// הורדה הדרגתית של כוכבים: מ-14,000 ל-10,000 (בין 0.29 ל-0.88)
const starStart = leftCount + rightCount; // 8000
const totalRegularStars = particleCount - starStart; // 14000
const starsToHide = totalRegularStars - 10000; // 4000
const tFadeStars = phaseT(scrollProgress, 0.29, 0.88);
const visibleRegularStars = totalRegularStars - Math.floor(tFadeStars * starsToHide);

  const posArr = geometry.attributes.position.array;

  // knobs
  const gatherTightness = 0.45;    // smaller = tighter clusters
  const explodeDistance = 22;      // bigger = stronger explosion (היה 16)

  const time = performance.now() * 0.001;

  for (let i=0; i<particleCount; i++){
    const ix = i*3;

    const bx = basePositions[ix];
    const by = basePositions[ix+1];
    const bz = basePositions[ix+2];

    // star drift - מהירות אחידה לכל האתר
    const driftMultiplier = 1.0;
    const driftSpeed = 1.0;
    
    let x = bx + Math.sin(time * 1.3 * driftSpeed + i*0.01) * 0.05 * driftMultiplier;
    let y = by + Math.cos(time * 1.2 * driftSpeed + i*0.008) * 0.05 * driftMultiplier;
    let z = bz + Math.sin(time * 0.6 * driftSpeed + i*0.004) * 0.03 * driftMultiplier;

    const isLeft  = i < leftCount;
    const isRight = i >= leftCount && i < leftCount + rightCount;

if (isLeft || isRight) {

  // 1) gather toward circular per-particle target
  const tx = gatherTargets[ix];
  const ty = gatherTargets[ix+1];
  const tz = gatherTargets[ix+2];

  const gx = lerp(x, tx, tGather);
  const gy = lerp(y, ty, tGather);
  const gz = lerp(z, tz, tGather);

  // 2) collide - שומר על גודל הכדור! רק מזיז את המרכז
  const clusterCenter = isLeft ? leftTarget : rightTarget;
  const offsetX = tx - clusterCenter.x;
  const offsetY = ty - clusterCenter.y;
  const offsetZ = tz - clusterCenter.z;
  
  // המרכז זז לכיוון (0,0,0) אבל החלקיק שומר על המרחק שלו מהמרכז
  const newCenterX = lerp(clusterCenter.x, centerTarget.x, tCollide);
  const newCenterY = lerp(clusterCenter.y, centerTarget.y, tCollide);
  const newCenterZ = lerp(clusterCenter.z, centerTarget.z, tCollide);
  
  const cx = lerp(gx, newCenterX + offsetX, tCollide);
  const cy = lerp(gy, newCenterY + offsetY, tCollide);
  const cz = lerp(gz, newCenterZ + offsetZ, tCollide);

  x = cx; y = cy; z = cz;
}

    // 3) explosion - BOOM! רק אשכולות (8000 חלקיקים)
    const shouldExplode = isLeft || isRight;
    if (shouldExplode && tExplode > 0) {
      const dx = explodeDirs[ix];
      const dy = explodeDirs[ix+1];
      const dz = explodeDirs[ix+2];

      const speed = explodeSpeeds[i];
      const distance = explodeDistance * tExplode * speed * 2.5;

      // מיקום פיצוץ - ישירות מהמרכז החוצה
      const ex = dx * distance;
      const ey = dy * distance;
      const ez = dz * distance;

      x = ex;
      y = ey;
      z = ez;
      
      // צבעים לפי מהירות - יותר חזקים!
      const speedRatio = clamp01((speed - 0.4) / 1.2);
      
      let r, g, b;
      if (speedRatio < 0.25) {
        // מרכז - לבן/צהוב בוהק מאוד
        r = 1.0;
        g = lerp(1.0, 0.9, speedRatio / 0.25);
        b = lerp(0.9, 0.2, speedRatio / 0.25);
      } else if (speedRatio < 0.55) {
        // כתום-אדום חזק!
        const t = (speedRatio - 0.25) / 0.3;
        r = 1.0;
        g = lerp(0.75, 0.25, t);
        b = lerp(0.15, 0.05, t);
      } else {
        // סגול/מג'נטה עז בקצוות!
        const t = (speedRatio - 0.55) / 0.45;
        r = lerp(1.0, 0.6, t);
        g = lerp(0.15, 0.1, t);
        b = lerp(0.5, 1.0, t);
      }
      
      colors[ix] = r;
      colors[ix+1] = g;
      colors[ix+2] = b;
    } else if (tExplode === 0 && tAfter === 0) {
      // לפני הפיצוץ - צבע לבן רגיל
      const origB = 0.55 + ((i * 0.618033) % 1) * 0.45;
      colors[ix] = origB;
      colors[ix+1] = origB;
      colors[ix+2] = origB;
    }

    // אחרי 0.29 – אפקט הפיצוץ נגמר: מסתירים את כל חלקיקי האשכולות (לא תראי אותם יותר)
    if (scrollProgress >= 0.29 && (isLeft || isRight)) {
      x = 1000;
      y = 1000;
      z = 1000;
    }

    // הורדה הדרגתית: מ-0.29 עד 0.88, מוריד כוכבים רגילים מ-14,000 ל-10,000
    if (i >= starStart + visibleRegularStars) {
      x = 1000;
      y = 1000;
      z = 1000;
    }

    posArr[ix]=x; posArr[ix+1]=y; posArr[ix+2]=z;
  } // end of for loop

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
  
  // *** FLASH EFFECT - בום לבן מהתמונה! ***
  if (scrollProgress >= 0.15 && scrollProgress <= 0.20) {
    flashImg.style.opacity = tFlash * 0.85;
    const flashScale = 0.6 + flashRaw * 0.6;
    flashImg.style.transform = `translate(-50%, -50%) scale(${flashScale})`;
  } else {
    flashImg.style.opacity = 0;
  }
  
  // גודל חלקיקים
  if (tExplode > 0) {
    material.size = 0.10;
    material.opacity = 0.95;
  } else {
    material.size = 0.080;
    material.opacity = 0.95;
  }

  // tiny camera breathing
  camera.position.x = Math.sin(time*0.25) * 0.06;
  camera.position.y = Math.cos(time*0.22) * 0.06;

  renderer.render(scene, camera);
}
animate();

// ---------- Resize ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const bgInner = document.querySelector(".bg-inner");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  bgInner.style.transform = `translateY(${scrollY * 0.08}px) scale(1.09)`;
});

})();
