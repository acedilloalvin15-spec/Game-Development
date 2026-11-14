import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

test("Vercel builds and serves the web app from www", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(config.outputDirectory, "www");
  assert.equal(config.buildCommand, "npm run build");
  assert.equal(packageJson.scripts.build, "npm run setup-assets");
  await access(new URL("../www/index.html", import.meta.url));
  await access(new URL("../www/js/game.js", import.meta.url));
});
