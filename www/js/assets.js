export const assetUrl = path => new URL(`../assets/${path}`, import.meta.url).href;
export async function loadCityGraph(city) {
  try {
    const response = await fetch(assetUrl("maps/cities.json"));
    if (!response.ok) throw new Error(`City graph request failed (${response.status})`);
    const data = await response.json();
    return data[city] || null;
  } catch (error) {
    console.warn("Using the built-in local road graph.", error);
    return null;
  }
}
export function drawUnit(ctx, unit, x, y, angle = 0, time = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (unit.aerial) {
    ctx.globalAlpha = .17; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(4, 8, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.rotate(angle);
  ctx.fillStyle = unit.color; ctx.strokeStyle = "#0b1014"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-7, -4, 14, 8, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#eaf5f2"; ctx.fillRect(1, -2.5, 3, 5);
  if (unit.aerial) {
    ctx.strokeStyle = "#d9e7e7"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(3 * Math.sin(time / 55), 0); ctx.moveTo(0, -7); ctx.lineTo(0, 7); ctx.stroke();
  }
  ctx.restore();
}
