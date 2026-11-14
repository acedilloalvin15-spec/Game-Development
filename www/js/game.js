import { CITIES, INCIDENTS, PERSONNEL, UNIT_TYPES, eligibleUnits, makeCityGraph } from "./data.js";
import { routeForUnit } from "./pathfinding.js";
import { drawUnit, loadCityGraph } from "./assets.js";
import { playSound } from "./audio.js";
import { speak } from "./voice.js";
import { createScenarioEditor } from "./admin.js";

const $ = selector => document.querySelector(selector);
const canvas = $("#city-map"), ctx = canvas.getContext("2d");
const initialGraph = makeCityGraph(3);
const state = {
  city: 0, graph: initialGraph, incidents: [], reputation: 82, resolved: 0, elapsed: 0,
  units: UNIT_TYPES.slice(0, 6).map((type, index) => ({ ...type, id: `u${index}`, person: PERSONNEL[index % 7], position: { x: initialGraph.nodes[index * 7].x, y: initialGraph.nodes[index * 7].y }, status: "READY", route: [], target: null })),
  calls: 0, toastTimer: 0
};
function toast(message) {
  const element = $("#toast"); element.textContent = message; element.classList.add("show");
  clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => element.classList.remove("show"), 1900);
}
function log(message, accent = false) {
  const row = document.createElement("li"), time = document.createElement("time");
  time.textContent = $("#clock").textContent;
  const text = document.createElement("span"); text.textContent = message;
  if (accent) text.className = "log-accent";
  row.append(time, text); $("#radio-log").prepend(row);
  while ($("#radio-log").children.length > 30) $("#radio-log").lastElementChild.remove();
}
function renderUnits() {
  const root = $("#unit-list"); root.replaceChildren();
  state.units.forEach(unit => {
    const row = document.createElement("div"); row.className = "unit-row";
    const info = document.createElement("div");
    const name = document.createElement("div"); name.className = "unit-name"; name.textContent = `${unit.name} · ${unit.person.name}`;
    const detail = document.createElement("div"); detail.className = "unit-detail"; detail.textContent = `${unit.person.skill} · ${unit.person.gear} · Fatigue ${unit.person.fatigue}%`;
    info.append(name, detail);
    const status = document.createElement("span"); status.className = `unit-state ${unit.status === "READY" ? "" : "busy"}`;
    status.innerHTML = `<i class="unit-dot"></i>${unit.status}`;
    row.append(info, status); root.append(row);
  });
  $("#unit-ready-count").textContent = `${state.units.filter(unit => unit.status === "READY").length} READY`;
}
function renderIncidents() {
  const root = $("#incident-list"); root.replaceChildren();
  state.incidents.forEach(incident => {
    const button = document.createElement("button"); button.className = "incident-card";
    button.innerHTML = `<div class="incident-top"><span class="incident-title"></span><span class="tag"></span></div><div class="incident-meta"><span></span><span></span></div>`;
    button.querySelector(".incident-title").textContent = incident.title;
    button.querySelector(".tag").textContent = incident.priority;
    button.querySelector(".incident-meta span:first-child").textContent = incident.address;
    button.querySelector(".incident-meta span:last-child").textContent = `${incident.category} · ${incident.age} MIN`;
    button.addEventListener("click", () => showCall(incident));
    root.append(button);
  });
  $("#incident-count").textContent = state.incidents.length;
}
function showCall(incident) {
  $("#call-category").textContent = `${incident.category} · ${incident.priority} PRIORITY`;
  $("#call-title").textContent = incident.title;
  $("#call-address").textContent = incident.address;
  $("#call-transcript").textContent = incident.line || incident.lines.join(" ");
  const actions = $("#call-actions"); actions.replaceChildren();
  const available = state.units.filter(unit => unit.status === "READY" && eligibleUnits(incident.category).some(type => type.id === unit.id.split("-")[0] || type.agency === unit.agency));
  for (const unit of available.slice(0, 3)) {
    const dispatch = document.createElement("button"); dispatch.className = "primary-button"; dispatch.textContent = `DISPATCH ${unit.icon} · ${unit.name}`;
    dispatch.addEventListener("click", () => { dispatchUnit(unit, incident); $("#call-dialog").close(); });
    actions.append(dispatch);
  }
  if (!available.length) actions.textContent = "No eligible crew is currently available.";
  $("#call-dialog").showModal();
  speak(incident.line || incident.lines[0], { tone: incident.tone || "afraid" }).catch(error => console.warn("Voice playback unavailable.", error));
}
function dispatchUnit(unit, incident) {
  const point = incident.position || { x: .3 + Math.random() * .5, y: .25 + Math.random() * .5 };
  unit.status = "EN ROUTE";
  unit.target = point;
  unit.incidentId = incident.id;
  unit.route = routeForUnit(unit, state.graph, point);
  if (!unit.route.length) {
    unit.status = "READY";
    toast("No connected route is available.");
    log(`No road route available for ${incident.title}.`);
    renderUnits();
    return;
  }
  incident.dispatched = true;
  renderIncidents(); renderUnits(); playSound("dispatch");
  log(`${unit.name} assigned to ${incident.title}.`, true);
}
function makeIncident(custom = null) {
  const base = custom || INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
  const address = `${10 + Math.floor(Math.random() * 880)} ${["Harbor", "Market", "Cedar", "Union", "River", "Park"][Math.floor(Math.random() * 6)]} ${["Street", "Avenue", "Road", "Boulevard"][Math.floor(Math.random() * 4)]}`;
  const destination = state.graph.nodes[Math.floor(Math.random() * state.graph.nodes.length)];
  const incident = { ...base, id: crypto.randomUUID(), address, age: 0, position: { x: destination.x, y: destination.y }, lines: base.lines || [base.line, "Units are being dispatched to your location."], priority: base.priority || "HIGH" };
  state.incidents.unshift(incident);
  renderIncidents();
  playSound("alert"); log(`Incoming ${incident.category} call — ${incident.title}.`, true);
  if (!custom) showCall(incident);
  return incident;
}
function drawMap(time) {
  const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) { canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = rect.width, h = rect.height;
  ctx.fillStyle = "#101a1e"; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#18252a"; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  if (state.graph.riverColumn !== undefined) {
    ctx.fillStyle = "#132b31";
    ctx.fillRect(state.graph.riverColumn / 8 * w, 0, w / 8, h);
  }
  const pt = node => ({ x: node.x * w, y: node.y * h });
  ctx.lineWidth = 4; ctx.strokeStyle = "#23343a"; ctx.lineCap = "round";
  for (const edge of state.graph.edges) {
    const from = state.graph.nodes.find(n => n.id === edge.from), to = state.graph.nodes.find(n => n.id === edge.to);
    if (!from || !to) continue;
    const a = pt(from), b = pt(to);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    if (edge.bridge) { ctx.strokeStyle = "#5f8c91"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 4; ctx.strokeStyle = "#23343a"; }
  }
  for (const node of state.graph.nodes) {
    const p = pt(node);     ctx.fillStyle = "#33464d"; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
  }
  for (const incident of state.incidents) {
    const pos = incident.position, x = pos.x * w, y = pos.y * h;
    ctx.beginPath(); ctx.arc(x, y, 7 + Math.sin(time / 300) * 2, 0, Math.PI * 2); ctx.strokeStyle = "#ff6e6e99"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#ff6e6e"; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
  state.units.forEach(unit => {
    if (unit.route.length > 1) {
      ctx.beginPath(); ctx.setLineDash([4, 5]); ctx.strokeStyle = `${unit.color}88`; ctx.lineWidth = 1.5;
      ctx.moveTo(unit.position.x * w, unit.position.y * h);
      unit.route.forEach(point => ctx.lineTo(point.x * w, point.y * h)); ctx.stroke(); ctx.setLineDash([]);
    }
    const angle = unit.heading || 0;
    drawUnit(ctx, unit, unit.position.x * w, unit.position.y * h, angle, time);
  });
}
function frame(time) {
  for (const unit of state.units) if (unit.route.length && unit.status === "EN ROUTE") {
    const target = unit.route[0], dx = target.x - unit.position.x, dy = target.y - unit.position.y, dist = Math.hypot(dx, dy);
    unit.heading = Math.atan2(dy, dx);
    if (dist < .012) {
      unit.position = { ...target }; unit.route.shift();
      if (!unit.route.length) {
        unit.status = "ON SCENE";
        const incident = state.incidents.find(item => item.id === unit.incidentId);
        if (incident) { state.incidents = state.incidents.filter(item => item !== incident); state.resolved++; $("#resolved").textContent = state.resolved; state.reputation = Math.min(99, state.reputation + 1); $("#reputation").textContent = state.reputation; log(`${unit.name} on scene. Incident cleared.`, true); }
        setTimeout(() => { unit.status = "READY"; renderUnits(); }, 2300);
        renderIncidents(); renderUnits();
      }
    } else {
      const step = Math.min(dist, unit.speed / 3600 / 8);
      unit.position.x += dx / dist * step; unit.position.y += dy / dist * step;
    }
  }
  drawMap(time); requestAnimationFrame(frame);
}
async function changeCity() {
  state.city = (state.city + 1) % CITIES.length;
  $("#city-name").textContent = CITIES[state.city];
  state.graph = await loadCityGraph(CITIES[state.city]) || makeCityGraph(state.city + 4);
  log(`City operations switched to ${CITIES[state.city]}.`);
}
function installEvents() {
  $("#city-select").addEventListener("click", changeCity);
  $("#next-call").addEventListener("click", () => makeIncident());
  $("#new-call").addEventListener("click", () => makeIncident());
  $("#clear-log").addEventListener("click", () => $("#radio-log").replaceChildren());
  document.querySelectorAll(".mobile-nav button").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".mobile-nav button").forEach(item => item.classList.remove("nav-active"));
    button.classList.add("nav-active");
    const targets = { map: ".map-panel", calls: ".incident-panel", fleet: ".units-panel", log: ".activity-panel" };
    document.querySelector(targets[button.dataset.nav])?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  createScenarioEditor({ onTest: scenario => { const incident = makeIncident({ ...scenario, line: scenario.line, priority: "TRAINING" }); showCall(incident); } });
  setInterval(() => { state.elapsed++; const minutes = 8 * 60 + state.elapsed; $("#clock").textContent = `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`; }, 60000);
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Offline cache setup failed.", error));
}
function boot() {
  installEvents(); renderUnits(); renderIncidents();
  $("#reputation").textContent = state.reputation;
  $("#response-time").textContent = "4.2m";
  log("Metro dispatch network online.", true);
  log("All response units checked in.");
  requestAnimationFrame(frame);
}
boot();
