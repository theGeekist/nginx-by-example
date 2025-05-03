import { test, expect, beforeAll, afterAll } from "bun:test";
import { reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig } from "@utils/env";


beforeAll(() => {
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("Cluster 1: Normal response from primary", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    protocol: "https",
    path: "/always-success/",
    silent: true
  });
  const body = result.stdout.toString().trim();
  expect(body).toContain("A: success");
});

test("Cluster 2: Primary fails, fallback to 2nd node (503)", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    protocol: "https",
    path: "/fallback-error/",
    silent: true
  });
  const body = result.stdout.toString().trim();
  expect(body).toContain("A: success");
});

test("Cluster 3: Primary + secondary fail, fallback to backup", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    protocol: "https",
    path: "/force-backup/",
    silent: true
  });
  const body = result.stdout.toString().trim();
  expect(body).toContain("C: backup");
});

test("Cluster 4: No retry, returns 503 from primary", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    protocol: "https",
    path: "/no-retry/",
    silent: true
  });

  const output = result.stdout.toString().trim();
  expect(output.includes("B: error")).toBe(true);
});


afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
