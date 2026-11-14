export const CITIES = ["New Carthage", "Chicago", "Miami", "London", "Tokyo", "Cebu"];
export const UNIT_TYPES = [
  { id: "patrol", name: "Patrol Cruiser", agency: "POLICE", icon: "P", color: "#77b7f2", speed: 58 },
  { id: "motorcycle", name: "Traffic Motorcycle", agency: "POLICE", icon: "M", color: "#77b7f2", speed: 68 },
  { id: "swat", name: "SWAT Van", agency: "POLICE", icon: "S", color: "#77b7f2", speed: 45 },
  { id: "fire", name: "Fire Engine", agency: "FIRE", icon: "F", color: "#ff8075", speed: 42 },
  { id: "rescue", name: "Rescue Van", agency: "FIRE", icon: "R", color: "#ff8075", speed: 48 },
  { id: "ambulance", name: "ALS Ambulance", agency: "EMS", icon: "A", color: "#77e0b0", speed: 52 },
  { id: "heli-police", name: "Police Helicopter", agency: "POLICE", icon: "H", color: "#77b7f2", speed: 90, aerial: true },
  { id: "heli-ems", name: "Medevac Helicopter", agency: "EMS", icon: "H", color: "#77e0b0", speed: 95, aerial: true }
];
export const PERSONNEL = [
  { name: "Sgt. Maya Chen", role: "Police", skill: "Crisis response", gear: "Body armor", fatigue: 18 },
  { name: "Officer Luis Ortega", role: "Police", skill: "Traffic control", gear: "First aid kit", fatigue: 8 },
  { name: "Officer Jordan Blake", role: "Police", skill: "Negotiation", gear: "Taser", fatigue: 24 },
  { name: "Capt. Aisha Patel", role: "Fire", skill: "Incident command", gear: "Rescue tools", fatigue: 12 },
  { name: "Firefighter Noah Kim", role: "Fire", skill: "Hazmat", gear: "Breathing apparatus", fatigue: 15 },
  { name: "Paramedic Elena Ruiz", role: "EMS", skill: "Advanced life support", gear: "Defibrillator", fatigue: 10 },
  { name: "Paramedic Sam Osei", role: "EMS", skill: "Trauma care", gear: "Trauma kit", fatigue: 20 },
  { name: "Pilot Avery Morgan", role: "Air", skill: "Urban flight", gear: "Flight kit", fatigue: 14 }
];
export const INCIDENTS = [
  { title: "Collision with injuries", category: "EMS", priority: "HIGH", lines: ["There has been a crash at the intersection. One person is hurt and traffic is backing up.", "Are you in a safe place? Tell me how many vehicles are involved."] },
  { title: "Smoke from an apartment", category: "FIRE", priority: "HIGH", lines: ["I can see smoke coming from a building across the street.", "Stay outside and away from the smoke. Do you see anyone still inside?"] },
  { title: "Suspicious activity", category: "POLICE", priority: "ROUTINE", lines: ["Someone is trying doors in the parking garage. I'm watching from across the street.", "Keep your distance. Can you tell me what they're wearing?"] },
  { title: "Medical emergency", category: "EMS", priority: "URGENT", lines: ["My father collapsed and isn't responding. We're at the corner by the pharmacy.", "Help is being sent. Is he breathing normally?"] },
  { title: "Road obstruction", category: "MULTI", priority: "ROUTINE", lines: ["A delivery truck has blocked both lanes and cars can't get around.", "Thank you. Keep a safe distance while we send a unit."] },
  { title: "Alarm activation", category: "POLICE", priority: "ROUTINE", lines: ["An alarm has been sounding at the closed shop for several minutes.", "Please don't approach the building. A unit will check the area."] }
];
const PERSONNEL_BY_ROLE = { POLICE: ["Police", "Air"], FIRE: ["Fire"], EMS: ["EMS", "Air"], MULTI: ["Police", "Fire", "EMS"] };
export function eligibleUnits(category) {
  const roles = PERSONNEL_BY_ROLE[category] || PERSONNEL_BY_ROLE.MULTI;
  return UNIT_TYPES.filter(unit => roles.includes(unit.agency) || (category === "MULTI" && unit.agency === "EMS"));
}
export function makeCityGraph(seed = 1, cols = 8, rows = 7) {
  const nodes = [], edges = [];
  const riverColumn = 2 + (seed % Math.max(1, cols - 4));
  const bridgeRow = seed % rows;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (x === riverColumn) continue;
    const id = `${x},${y}`;
    nodes.push({ id, x: (x + .5) / cols, y: (y + .5) / rows });
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (x === riverColumn) continue;
    const from = `${x},${y}`;
    if (x === riverColumn - 1 && y === bridgeRow) edges.push({ from, to: `${x + 2},${y}`, bridge: true });
    else if (x < riverColumn - 1 && x + 1 < cols) edges.push({ from, to: `${x + 1},${y}` });
    else if (x > riverColumn && x + 1 < cols) edges.push({ from, to: `${x + 1},${y}` });
    if (y + 1 < rows) edges.push({ from, to: `${x},${y + 1}` });
  }
  return { nodes, edges, riverColumn, bridgeRow };
}
export const CUSTOM_SCENARIO_KEY = "dispatch.customScenarios.v1";
