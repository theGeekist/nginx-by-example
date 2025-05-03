import { test, expect, beforeAll, afterAll } from "bun:test";
import { reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig } from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("Rejects request with no token", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    path: "/api/",
    port: 8443,
    protocol: "https",
    silent: true,
    onlyStatus: true
  });

  const status = result.stdout.toString().trim();
  expect(status).toContain("403");
});

test("Allows request with valid token", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    path: "/api/",
    port: 8443,
    protocol: "https",
    silent: true,
    headers: ["Authorization: Bearer tenant123"]
  });

  const body = result.stdout.toString();
  expect(body).toContain("API Response for tenant: tenant123");
});

test("Rejects request with invalid token", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    path: "/api/",
    port: 8443,
    protocol: "https",
    silent: true,
    headers: ["Authorization: Bearer wrong"]
  });

  const body = result.stdout.toString();
  expect(body).not.toContain("API Response");
});

test("Applies rate limiting per tenant", async () => {
  let successCount = 0;
  let limitedCount = 0;

  for (let i = 0; i < 30; i++) {
    const result = spawnCurl({
      hostname: "test.localhost",
      path: "/api/",
      port: 8443,
      protocol: "https",
      silent: true,
      headers: ["Authorization: Bearer tenant123"],
      extraCommands: ["-w", "%{http_code}"] // add status code after body
    });

    const output = result.stdout.toString().trim();
    const statusCode = output.slice(-3); // last 3 chars

    if (statusCode === "200") successCount++;
    if (statusCode === "503") limitedCount++;

    await Bun.sleep(100);
  }

  expect(successCount).toBeGreaterThan(0);
  expect(limitedCount).toBeGreaterThan(0);
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
