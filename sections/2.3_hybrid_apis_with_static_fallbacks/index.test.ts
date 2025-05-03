import { test, expect, beforeAll, afterAll } from "bun:test";
import { reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig } from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("Returns static JSON if API fails", () => {
  const result = spawnCurl({
    hostname: "test.local",
    path: "/api/stats",
    protocol: "https",
    silent: true
  });

  const body = result.stdout.toString().trim();
  expect(body).toContain('"visitors": 42000');
  expect(body).toContain('"uptime": "99.99%"');
});

test("Returns upstream JSON if API succeeds", () => {
  const result = spawnCurl({
    hostname: "freebies.local",
    path: "/api/stats",
    port: 8443,
    protocol: "https",
    silent: true
  });

  const body = result.stdout.toString().trim();
  expect(body).toContain('"visitors":42000');
  expect(body).toContain('"uptime":"100.00%"');
});


afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
