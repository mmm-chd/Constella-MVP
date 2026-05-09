import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanetStage } from '@/src/types';

interface PlanetProps {
  stage: PlanetStage;
  emotion?: string;
  intensity?: number;
}

const EMOTION_COLORS: Record<string, { main: string; glow: string; alt: string }> = {
  angry:        { main: '#C0392B', glow: '#FF6B4D', alt: '#7B241C' },
  happy:        { main: '#FFB347', glow: '#FFE066', alt: '#E67E00' },
  sad:          { main: '#7A8BA8', glow: '#A8C8E8', alt: '#3A5070' },
  love:         { main: '#FF8FA3', glow: '#FFB7C5', alt: '#CC4466' },
  neutral:      { main: '#C8C4BC', glow: '#E8E4DC', alt: '#888480' },
  touched:      { main: '#76B4BD', glow: '#AED9E0', alt: '#3A8090' },
  disappointed: { main: '#8B7BAE', glow: '#C8B8D8', alt: '#5A4880' },
};

function getEmotionColor(emotion?: string) {
  const key = emotion?.toLowerCase() || 'neutral';
  return EMOTION_COLORS[key] || EMOTION_COLORS.neutral;
}

function seededRand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// ─── STAGE: ASTEROID ────────────────────────────────────────────────────────
function drawAsteroid(ctx: CanvasRenderingContext2D, size: number) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.34;

  ctx.clearRect(0, 0, size, size);

  const pts: { x: number; y: number }[] = [];
  const numPts = 14;
  for (let i = 0; i < numPts; i++) {
    const angle = (i / numPts) * Math.PI * 2;
    const noise = seededRand(i * 7.3) * r * 0.38 - r * 0.19;
    const dist = r + noise;
    pts.push({ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist });
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();

  const grad = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.32, r * 0.08, cx, cy, r * 1.1);
  grad.addColorStop(0, '#8A9BB0');
  grad.addColorStop(0.5, '#5C6B8A');
  grad.addColorStop(1, '#232830');
  ctx.fillStyle = grad;
  ctx.fill();

  // Craters
  const craters = [
    { x: cx * 0.75, y: cy * 0.8, r: r * 0.18 },
    { x: cx * 1.2, y: cy * 0.63, r: r * 0.13 },
    { x: cx * 0.92, y: cy * 1.2, r: r * 0.16 },
    { x: cx * 0.63, y: cy * 1.13, r: r * 0.1 },
  ];
  craters.forEach(c => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.clip();
    const cg = ctx.createRadialGradient(c.x - c.r * 0.2, c.y - c.r * 0.2, 0, c.x, c.y, c.r);
    cg.addColorStop(0, 'rgba(0,0,0,0.55)');
    cg.addColorStop(0.7, 'rgba(60,72,90,0.25)');
    cg.addColorStop(1, 'rgba(120,135,155,0.1)');
    ctx.fillStyle = cg;
    ctx.fillRect(c.x - c.r - 1, c.y - c.r - 1, (c.r + 1) * 2, (c.r + 1) * 2);
    ctx.restore();
  });

  // Cracks
  ctx.strokeStyle = 'rgba(15,20,28,0.55)';
  ctx.lineWidth = 0.8;
  const cracks: number[][] = [
    [cx * 0.7, cy * 0.92, cx * 0.97, cy * 0.75, cx * 1.03, cy * 0.8],
    [cx * 1.08, cy * 1.0, cx * 1.25, cy * 1.2],
    [cx * 0.83, cy * 0.63, cx * 0.75, cy * 0.87],
  ];
  cracks.forEach(pts2 => {
    ctx.beginPath();
    ctx.moveTo(pts2[0], pts2[1]);
    for (let i = 2; i < pts2.length; i += 2) ctx.lineTo(pts2[i], pts2[i + 1]);
    ctx.stroke();
  });

  // Highlight
  const hl = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.26, 0, cx - r * 0.1, cy - r * 0.14, r * 0.42);
  hl.addColorStop(0, 'rgba(255,255,255,0.28)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.arc(cx - r * 0.1, cy - r * 0.14, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

// ─── STAGE: MAGMA ────────────────────────────────────────────────────────────
function drawMagma(ctx: CanvasRenderingContext2D, size: number, t: number, emotion?: string) {
  const ec = getEmotionColor(emotion);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.37;
  const { r: gr, g: gg, b: gb } = hexToRgb(ec.glow);

  ctx.clearRect(0, 0, size, size);

  // Outer glow pulse
  const pulse = 0.65 + 0.35 * Math.sin(t * 0.04);
  const glow = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r * 1.55 * pulse);
  glow.addColorStop(0, `rgba(${gr},${gg},${gb},0.22)`);
  glow.addColorStop(0.6, `rgba(${gr},${gg},${gb},0.08)`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Rocky body - irregular
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const noise = seededRand(i * 5.1) * r * 0.3 - r * 0.15;
    const anim = Math.sin(t * 0.025 + i * 0.7) * 1.2;
    pts.push({
      x: cx + Math.cos(angle) * (r + noise + anim),
      y: cy + Math.sin(angle) * (r + noise + anim),
    });
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();

  const rockGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r * 1.1);
  rockGrad.addColorStop(0, '#4A4A58');
  rockGrad.addColorStop(0.55, '#2E2E3A');
  rockGrad.addColorStop(1, '#14141A');
  ctx.fillStyle = rockGrad;
  ctx.fill();
  ctx.clip();

  // Lava cracks
  const crackPaths: number[][][] = [
    [[cx * 0.7, cy * 1.17], [cx * 0.83, cy * 0.92], [cx * 1.03, cy * 0.8]],
    [[cx * 1.17, cy * 1.0], [cx * 1.03, cy * 1.2], [cx * 0.92, cy * 1.33]],
    [[cx * 0.8, cy * 0.7], [cx * 0.97, cy * 0.83], [cx * 1.17, cy * 0.73]],
    [[cx * 0.58, cy * 0.92], [cx * 0.75, cy * 1.03]],
  ];
  const { r: mr, g: mg, b: mb } = hexToRgb(ec.main);
  crackPaths.forEach((path, pi) => {
    const glowPulse = 0.5 + 0.5 * Math.sin(t * 0.05 + pi * 1.3);
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i][0], path[i][1]);
    ctx.strokeStyle = ec.main;
    ctx.lineWidth = 1.5 * (1 + glowPulse * 0.8);
    ctx.shadowColor = ec.glow;
    ctx.shadowBlur = 8 * glowPulse;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // Lava pools
  const pools = [[cx * 0.92, cy * 1.08, r * 0.18], [cx * 1.17, cy * 0.87, r * 0.12], [cx * 0.7, cy * 0.97, r * 0.14]];
  pools.forEach(([px, py, pr], i) => {
    const lp = ctx.createRadialGradient(px, py, 0, px, py, pr);
    const a = 0.55 + 0.45 * Math.sin(t * 0.03 + i * 1.1);
    lp.addColorStop(0, ec.glow);
    lp.addColorStop(0.5, `rgba(${mr},${mg},${mb},${a.toFixed(2)})`);
    lp.addColorStop(1, 'transparent');
    ctx.fillStyle = lp;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();

  // Highlight
  const hl = ctx.createRadialGradient(cx - r * 0.24, cy - r * 0.28, 0, cx - r * 0.12, cy - r * 0.16, r * 0.38);
  hl.addColorStop(0, 'rgba(255,255,255,0.22)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.arc(cx - r * 0.12, cy - r * 0.16, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

// ─── STAGE: OCEAN ─────────────────────────────────────────────────────────────
function drawOcean(ctx: CanvasRenderingContext2D, size: number, t: number, emotion?: string) {
  const ec = getEmotionColor(emotion);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.34;
  const { r: gr, g: gg, b: gb } = hexToRgb(ec.glow);
  const { r: mr, g: mg, b: mb } = hexToRgb(ec.main);

  ctx.clearRect(0, 0, size, size);

  // Atmospheric rings (AR style) — drawn BEHIND planet
  ctx.save();
  ctx.translate(cx, cy);

  const ringAngle = t * 0.012;

  // Ring 1
  ctx.save();
  ctx.rotate(ringAngle);
  ctx.scale(1, 0.26);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${gr},${gg},${gb},0.55)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Satellite dot
  const d1x = Math.cos(ringAngle * 1.8) * r * 1.6;
  const d1y = Math.sin(ringAngle * 1.8) * r * 1.6;
  ctx.fillStyle = ec.glow;
  ctx.beginPath();
  ctx.arc(d1x, d1y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ring 2 — dashed
  ctx.save();
  ctx.rotate(-ringAngle * 0.65 + 1.0);
  ctx.scale(0.3, 1);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${mr},${mg},${mb},0.4)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  // Satellite dot 2
  const d2x = Math.cos(-ringAngle * 0.65 * 2.2) * r * 1.5;
  const d2y = Math.sin(-ringAngle * 0.65 * 2.2) * r * 1.5;
  ctx.fillStyle = `rgba(${mr},${mg},${mb},0.8)`;
  ctx.beginPath();
  ctx.arc(d2x, d2y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  // Outer atmosphere halo
  const atmoGlow = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r * 1.28);
  atmoGlow.addColorStop(0, `rgba(${gr},${gg},${gb},0.18)`);
  atmoGlow.addColorStop(0.5, `rgba(${gr},${gg},${gb},0.07)`);
  atmoGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = atmoGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.28, 0, Math.PI * 2);
  ctx.fill();

  // Planet body clip
  ctx.save();
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const noise = seededRand(i * 3.7) * r * 0.22 - r * 0.11;
    pts.push({ x: cx + Math.cos(angle) * (r + noise), y: cy + Math.sin(angle) * (r + noise) });
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.clip();

  // Ocean base
  const oceanGrad = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.26, r * 0.05, cx, cy, r * 1.1);
  oceanGrad.addColorStop(0, '#4B7EC5');
  oceanGrad.addColorStop(0.5, '#2B5EA7');
  oceanGrad.addColorStop(1, '#122855');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, size, size);

  // Wave shimmer
  const waveY = cy + Math.sin(t * 0.02) * 3;
  for (let wi = 0; wi < 3; wi++) {
    ctx.beginPath();
    ctx.moveTo(cx - r, waveY + wi * 10 - 10);
    for (let wx = -r; wx <= r; wx += 4) {
      ctx.lineTo(cx + wx, waveY + wi * 10 - 10 + Math.sin((wx + t * 0.6 + wi * 20) * 0.18) * 3);
    }
    ctx.strokeStyle = `rgba(180,215,255,0.12)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Landmasses
  const lands = [
    { x: cx - r * 0.22, y: cy - r * 0.18, rx: r * 0.5, ry: r * 0.3, rot: 0.3 },
    { x: cx + r * 0.28, y: cy + r * 0.22, rx: r * 0.32, ry: r * 0.22, rot: -0.2 },
  ];
  lands.forEach(l => {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.fillStyle = '#2D6B3A';
    ctx.beginPath();
    ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3A8048';
    ctx.beginPath();
    ctx.ellipse(-l.rx * 0.1, -l.ry * 0.15, l.rx * 0.55, l.ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Emotion color tint
  ctx.fillStyle = `rgba(${mr},${mg},${mb},0.14)`;
  ctx.fillRect(0, 0, size, size);

  ctx.restore();

  // Highlight
  const hl = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.26, 0, cx - r * 0.1, cy - r * 0.13, r * 0.4);
  hl.addColorStop(0, 'rgba(255,255,255,0.28)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(cx - r * 0.1, cy - r * 0.13, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── STAGE: LIVING ────────────────────────────────────────────────────────────
function drawLiving(ctx: CanvasRenderingContext2D, size: number, t: number, emotion?: string) {
  const ec = getEmotionColor(emotion);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.38;
  const { r: gr, g: gg, b: gb } = hexToRgb(ec.glow);
  const { r: mr, g: mg, b: mb } = hexToRgb(ec.main);

  ctx.clearRect(0, 0, size, size);

  // Aura glow
  const auraPulse = 0.72 + 0.28 * Math.sin(t * 0.022);
  const aura = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r * 1.65 * auraPulse);
  aura.addColorStop(0, `rgba(${gr},${gg},${gb},0.38)`);
  aura.addColorStop(0.45, `rgba(${mr},${mg},${mb},0.14)`);
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.7, 0, Math.PI * 2);
  ctx.fill();

  // Planet body — perfect circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Base gradient from emotion
  const baseGrad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.36, r * 0.06, cx, cy, r * 1.15);
  baseGrad.addColorStop(0, ec.glow);
  baseGrad.addColorStop(0.45, ec.main);
  baseGrad.addColorStop(1, ec.alt);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // Cloud bands that drift
  [0, 1, 2].forEach(i => {
    const drift = Math.sin(t * 0.006 * (i % 2 === 0 ? 1 : -1) + i * 2.1) * r * 0.12;
    const by = cy - r * 0.3 + i * r * 0.3;
    ctx.fillStyle = `rgba(255,255,255,0.08)`;
    ctx.beginPath();
    ctx.ellipse(cx + drift, by, r * 0.75, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Shimmer/sparkle clusters
  [[0.67, 0.75], [1.2, 0.87], [0.92, 1.17], [0.58, 1.08]].forEach(([fx, fy], i) => {
    const sp = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.022 + i * 1.57));
    const sx = cx * fx, sy = cy * fy;
    ctx.fillStyle = `rgba(255,255,255,${(sp * 0.18).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, r * (0.1 + sp * 0.1), 0, Math.PI * 2);
    ctx.fill();
  });

  // Shadow side
  const shadow = ctx.createRadialGradient(cx + r * 0.52, cy + r * 0.42, 0, cx + r * 0.36, cy + r * 0.28, r * 1.05);
  shadow.addColorStop(0, 'rgba(0,0,0,0.5)');
  shadow.addColorStop(0.45, 'rgba(0,0,0,0.18)');
  shadow.addColorStop(1, 'transparent');
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 0, size, size);

  ctx.restore();

  // Specular highlight
  const hl = ctx.createRadialGradient(cx - r * 0.24, cy - r * 0.28, 0, cx - r * 0.14, cy - r * 0.17, r * 0.44);
  hl.addColorStop(0, 'rgba(255,255,255,0.45)');
  hl.addColorStop(0.4, 'rgba(255,255,255,0.12)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(cx - r * 0.14, cy - r * 0.17, r * 0.44, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── STAGE: EMPTY ─────────────────────────────────────────────────────────────
function drawEmpty(ctx: CanvasRenderingContext2D, size: number, t: number) {
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.018));
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.3);
  grd.addColorStop(0, `rgba(80,140,255,${(pulse * 0.18).toFixed(2)})`);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ─── STAGE: ASCENDED (same as LIVING but brighter aura) ───────────────────────
function drawAscended(ctx: CanvasRenderingContext2D, size: number, t: number, emotion?: string) {
  drawLiving(ctx, size, t, emotion);
  const ec = getEmotionColor(emotion);
  const cx = size / 2, cy = size / 2;
  const { r: gr, g: gg, b: gb } = hexToRgb(ec.glow);
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.03);
  const ring = ctx.createRadialGradient(cx, cy, (size * 0.38) * 0.9, cx, cy, size * 0.38 * 1.12);
  ring.addColorStop(0, `rgba(${gr},${gg},${gb},${(0.5 * pulse).toFixed(2)})`);
  ring.addColorStop(1, 'transparent');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.38 * 1.15, 0, Math.PI * 2);
  ctx.fill();
}

// ─── CANVAS PLANET COMPONENT ──────────────────────────────────────────────────
const PlanetCanvas: React.FC<{ stage: PlanetStage; emotion?: string }> = ({ stage, emotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const tRef = useRef<number>(0);

  // Size per stage
  const sizes: Record<PlanetStage, number> = {
    [PlanetStage.EMPTY]:    160,
    [PlanetStage.ASTEROID]: 200,
    [PlanetStage.MAGMA]:    240,
    [PlanetStage.OCEAN]:    280,
    [PlanetStage.LIVING]:   310,
    [PlanetStage.ASCENDED]: 310,
  };
  const size = sizes[stage] ?? 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      tRef.current++;
      const t = tRef.current;
      switch (stage) {
        case PlanetStage.EMPTY:    drawEmpty(ctx, size, t);                   break;
        case PlanetStage.ASTEROID: drawAsteroid(ctx, size);                    break;
        case PlanetStage.MAGMA:    drawMagma(ctx, size, t, emotion);           break;
        case PlanetStage.OCEAN:    drawOcean(ctx, size, t, emotion);           break;
        case PlanetStage.LIVING:   drawLiving(ctx, size, t, emotion);          break;
        case PlanetStage.ASCENDED: drawAscended(ctx, size, t, emotion);        break;
      }
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [stage, emotion, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
};

// ─── STAGE LABELS ─────────────────────────────────────────────────────────────
const STAGE_LABELS: Record<PlanetStage, string> = {
  [PlanetStage.EMPTY]:    'Void',
  [PlanetStage.ASTEROID]: 'Stellar Seed',
  [PlanetStage.MAGMA]:    'Igneous Core',
  [PlanetStage.OCEAN]:    'Oceanic World',
  [PlanetStage.LIVING]:   'Biosphere',
  [PlanetStage.ASCENDED]: 'Ascended',
};

// ─── MAIN PLANET COMPONENT ────────────────────────────────────────────────────
export const Planet: React.FC<PlanetProps> = ({ stage, emotion, intensity = 5 }) => {
  const resolvedStage = stage ?? PlanetStage.EMPTY;
  const label = resolvedStage === PlanetStage.LIVING || resolvedStage === PlanetStage.ASCENDED
    ? `${STAGE_LABELS[resolvedStage]}: ${emotion?.toLowerCase() || 'neutral'}`
    : STAGE_LABELS[resolvedStage];

  return (
    <div className="relative flex items-center justify-center p-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedStage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -14, 0] }}
          exit={{ scale: 1.08, opacity: 0 }}
          transition={{
            duration: 1.1,
            ease: 'easeOut',
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="relative flex items-center justify-center"
        >
          <PlanetCanvas stage={resolvedStage} emotion={emotion} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute -bottom-6 text-blue-200/30 font-mono text-[9px] tracking-[0.5em] uppercase font-bold">
        {label}
      </div>
    </div>
  );
};