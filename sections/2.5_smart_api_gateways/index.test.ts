import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, reloadNginx, setupTestConfig, teardownTestConfig
} from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("Rejects request with no token", () => {
  const body = curlApi("/api/", ["-s", "-w", "%{http_code}"]);
  expect(body.endsWith("403")).toBe(true);
});

test("Allows request with valid token", () => {
  const body = curlApi("/api/", [
    "-s", "-H", "Authorization: Bearer tenant123"
  ]);
  expect(body).toContain("API Response for tenant: tenant123");
});

test("Rejects request with invalid token", () => {
  const body = curlApi("/api/", [
    "-s", "-H", "Authorization: Bearer wrong"
  ]);
  expect(body).not.toContain("API Response");
});

test("Applies rate limiting per tenant", async () => {
  let successCount = 0;
  let limitedCount = 0;

  for (let i = 0; i < 30; i++) {
    const body = curlApi("/api/", [
      "-s", "-w", "%{http_code}",
      "-H", "Authorization: Bearer tenant123"
    ]);

    if (body.endsWith("200")) successCount++;
    if (body.endsWith("503")) limitedCount++;
    await Bun.sleep(100);
  }

  expect(successCount).toBeGreaterThan(0);
  expect(limitedCount).toBeGreaterThan(0);
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
