import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve("www/assets");
const files = {
  "maps/cities.json": JSON.stringify(Object.fromEntries(["New Carthage", "Chicago", "Miami", "London", "Tokyo", "Cebu"].map((city, i) => [city, makeGraph(i + 3)])), null, 2),
  "sprites/police_cruiser.svg": sprite("#77b7f2", "P"),
  "sprites/police_motorcycle.svg": sprite("#77b7f2", "M"),
  "sprites/swat_van.svg": sprite("#77b7f2", "S"),
  "sprites/police_heli.svg": sprite("#77b7f2", "H"),
  "sprites/fire_truck.svg": sprite("#ff8075", "F"),
  "sprites/fire_rescue_van.svg": sprite("#ff8075", "R"),
  "sprites/ems_ambulance.svg": sprite("#77e0b0", "A"),
  "sprites/ems_heli.svg": sprite("#77e0b0", "H"),
  "maps/nyc_map.svg": mapSvg("#687f82"),
  "maps/chicago_map.svg": mapSvg("#6e7c84"),
  "maps/miami_map.svg": mapSvg("#758d88"),
  "maps/london_map.svg": mapSvg("#778284"),
  "maps/tokyo_map.svg": mapSvg("#807d8b"),
  "maps/cebu_map.svg": mapSvg("#768a86")
};
for (const [path, content] of Object.entries(files)) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}
console.log(`Generated ${Object.keys(files).length} local, original SVG/JSON assets in ${root}. No network access required.`);

function makeGraph(seed) {
  const nodes = [], edges = [];
  const riverColumn = 2 + (seed % 4), bridgeRow = seed % 7;
  for (let y = 0; y < 7; y++) for (let x = 0; x < 8; x++) {
    if (x === riverColumn) continue;
    nodes.push({ id: `${x},${y}`, x: (x + .5) / 8, y: (y + .5) / 7 });
  }
  for (let y = 0; y < 7; y++) for (let x = 0; x < 8; x++) {
    if (x === riverColumn) continue;
    if (x === riverColumn - 1 && y === bridgeRow) edges.push({ from: `${x},${y}`, to: `${x + 2},${y}`, bridge: true });
    else if (x < riverColumn - 1) edges.push({ from: `${x},${y}`, to: `${x + 1},${y}` });
    else if (x > riverColumn && x < 7) edges.push({ from: `${x},${y}`, to: `${x + 1},${y}` });
    if (y < 6) edges.push({ from: `${x},${y}`, to: `${x},${y + 1}` });
  }
  return { id: seed, nodes, edges, riverColumn, bridgeRow };
}
function sprite(color, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="40" viewBox="0 0 72 40"><rect x="7" y="12" width="58" height="18" rx="5" fill="${color}"/><path d="M22 12 28 5h17l8 7" fill="${color}"/><rect x="30" y="7" width="13" height="5" rx="1" fill="#d9e7e7"/><circle cx="21" cy="31" r="5" fill="#10171b"/><circle cx="53" cy="31" r="5" fill="#10171b"/><text x="36" y="25" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#10171b">${label}</text></svg>`;
}
function mapSvg(color) {
  const lines = [];
  for (let i = 0; i < 10; i++) {
    const p = 7 + i * 9.5;
    lines.push(`<path d="M${p} 0v100M0 ${p}h100" stroke="#394a50" stroke-width="1"/>`);
  }
  lines.push(`<path d="M42 0v37l8 8v55" fill="none" stroke="${color}" stroke-width="4"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#101a1e"/>${lines.join("")}</svg>`;
}
