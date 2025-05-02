import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, reloadNginx, setupTestConfig, teardownTestConfig,
} from "@utils/env";


beforeAll(() => {
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("Cluster 1: Normal response from primary", () => {
  const body = curlApi("/always-success/", ["-s"]);
  expect(body).toContain("A: success");
});

test("Cluster 2: Primary fails, fallback to 2nd node (503)", () => {
  const body = curlApi("/fallback-error/", ["-s"]);
  expect(body).toContain("A: success");
});

test("Cluster 3: Primary + secondary fail, fallback to backup", () => {
  const body = curlApi("/force-backup/", ["-s"]);
  expect(body).toContain("C: backup");
});

test("Cluster 4: No retry, returns 503 from primary", () => {
  const output = curlApi("/no-retry/", ["-s"]);

  // Check body or status code
  expect(output.includes("B: error")).toBe(true);
});


afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
