import { CUSTOM_SCENARIO_KEY } from "./data.js";

const readScenarios = () => {
  try {
    const value = JSON.parse(localStorage.getItem(CUSTOM_SCENARIO_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error("Could not read local scenarios.", error);
    return [];
  }
};
const writeScenarios = scenarios => localStorage.setItem(CUSTOM_SCENARIO_KEY, JSON.stringify(scenarios));
export function createScenarioEditor({ onTest }) {
  const dialog = document.querySelector("#scenario-dialog");
  const list = document.querySelector("#scenario-list");
  const render = () => {
    list.replaceChildren();
    readScenarios().forEach((scenario, index) => {
      const row = document.createElement("div");
      row.className = "scenario-item";
      const title = document.createElement("span");
      title.textContent = `${scenario.title} · ${scenario.agency}`;
      const test = document.createElement("button");
      test.textContent = "TEST";
      test.addEventListener("click", () => onTest(scenario));
      const remove = document.createElement("button");
      remove.textContent = "REMOVE";
      remove.addEventListener("click", () => {
        const scenarios = readScenarios();
        scenarios.splice(index, 1);
        writeScenarios(scenarios);
        render();
      });
      row.append(title, test, remove);
      list.append(row);
    });
  };
  document.querySelector("#open-scenarios").addEventListener("click", () => { render(); dialog.showModal(); });
  document.querySelector("#save-scenario").addEventListener("click", event => {
    event.preventDefault();
    const title = document.querySelector("#scenario-title").value.trim();
    const line = document.querySelector("#scenario-line").value.trim();
    if (!title || !line) return;
    const scenario = { id: crypto.randomUUID(), title, line, agency: document.querySelector("#scenario-agency").value, address: "Civic Center" };
    const scenarios = readScenarios();
    scenarios.push(scenario);
    writeScenarios(scenarios);
    document.querySelector("#scenario-title").value = "";
    document.querySelector("#scenario-line").value = "";
    render();
    onTest(scenario);
  });
  document.querySelector("#export-scenarios").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(readScenarios(), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dispatch-scenarios.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  document.querySelector("#import-scenarios").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported) || imported.some(item => typeof item.title !== "string" || typeof item.line !== "string" || !["POLICE", "FIRE", "EMS", "MULTI"].includes(item.agency))) throw new Error("Invalid scenario pack");
      writeScenarios([...readScenarios(), ...imported.map(item => ({ ...item, id: crypto.randomUUID() }))]);
      render();
    } catch (error) {
      console.error("Scenario import failed.", error);
      alert("This scenario pack is not valid.");
    } finally {
      event.target.value = "";
    }
  });
}
