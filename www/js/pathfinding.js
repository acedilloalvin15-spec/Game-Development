export function nearestNode(graph, point) {
  return graph.nodes.reduce((best, node) => distance(node, point) < distance(best, point) ? node : best, graph.nodes[0]);
}
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function findPath(graph, start, end) {
  const source = typeof start === "string" ? graph.nodes.find(n => n.id === start) : nearestNode(graph, start);
  const target = typeof end === "string" ? graph.nodes.find(n => n.id === end) : nearestNode(graph, end);
  if (!source || !target) return [];
  const open = new Set([source.id]), cameFrom = new Map(), g = new Map([[source.id, 0]]), f = new Map([[source.id, distance(source, target)]]);
  const lookup = new Map(graph.nodes.map(node => [node.id, node]));
  const neighbors = new Map(graph.nodes.map(node => [node.id, []]));
  for (const edge of graph.edges) {
    if (!lookup.has(edge.from) || !lookup.has(edge.to)) continue;
    neighbors.get(edge.from).push(edge.to);
    neighbors.get(edge.to).push(edge.from);
  }
  while (open.size) {
    let currentId;
    for (const id of open) if (currentId === undefined || f.get(id) < f.get(currentId)) currentId = id;
    if (currentId === target.id) {
      const path = [lookup.get(currentId)];
      while (cameFrom.has(currentId)) { currentId = cameFrom.get(currentId); path.unshift(lookup.get(currentId)); }
      return path;
    }
    open.delete(currentId);
    for (const neighborId of neighbors.get(currentId)) {
      const tentative = g.get(currentId) + distance(lookup.get(currentId), lookup.get(neighborId));
      if (tentative < (g.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, currentId);
        g.set(neighborId, tentative);
        f.set(neighborId, tentative + distance(lookup.get(neighborId), target));
        open.add(neighborId);
      }
    }
  }
  return [];
}
export function routeForUnit(unit, graph, destination) {
  if (unit.aerial) return [unit.position, destination];
  const path = findPath(graph, unit.position, destination);
  if (!path.length) return [];
  return [unit.position, ...path];
}
