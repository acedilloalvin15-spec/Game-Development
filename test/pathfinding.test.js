import test from "node:test";
import assert from "node:assert/strict";
import { findPath, routeForUnit } from "../www/js/pathfinding.js";
import { makeCityGraph } from "../www/js/data.js";

const graph = { nodes: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 1, y: 0 }, { id: "c", x: 1, y: 1 }, { id: "d", x: 0, y: 1 }], edges: [{ from: "a", to: "d" }, { from: "d", to: "c" }, { from: "a", to: "b" }, { from: "b", to: "c" }] };
test("A* returns connected road-node path between nearest intersections", () => {
  const path = findPath(graph, { x: 0, y: 0 }, { x: 1, y: 1 });
  assert.equal(path[0].id, "a");
  assert.equal(path.at(-1).id, "c");
  assert.equal(path.length, 3);
});
test("aerial units use a direct route rather than road graph turns", () => {
  const route = routeForUnit({ aerial: true, position: { x: 0, y: 0 } }, graph, { x: 1, y: 1 });
  assert.equal(route.length, 2);
});
test("unconnected destinations return no ground path", () => {
  assert.deepEqual(findPath({ nodes: graph.nodes, edges: [] }, "a", "c"), []);
});
test("city traffic crosses the water only at its bridge and stays on road nodes", () => {
  const city = makeCityGraph(3);
  const river = city.riverColumn;
  const path = findPath(city, `0,0`, `7,0`);
  assert.ok(path.length > 2);
  for (let index = 1; index < path.length; index++) {
    const from = path[index - 1].id, to = path[index].id;
    assert.ok(city.edges.some(edge => edge.from === from && edge.to === to || edge.from === to && edge.to === from));
  }
  assert.equal(path.filter(node => Number(node.id.split(",")[0]) < river).length > 0, true);
  assert.equal(path.filter(node => Number(node.id.split(",")[0]) > river).length > 0, true);
});
