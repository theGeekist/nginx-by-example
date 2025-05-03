import { test, expect, beforeAll, afterAll } from "bun:test";
import { reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig } from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("Blue-Green traffic split approximation", () => {
  const ITERATIONS = 200;
  let blue = 0, green = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const result = spawnCurl({
      hostname: "test.localhost",
      path: "/",
      port: 8443,
      protocol: "https",
      silent: true
    });

    const body = result.stdout.toString();
    if (body.includes("BLUE")) blue++;
    if (body.includes("GREEN")) green++;
  }

  const blueRatio = (blue / ITERATIONS) * 100;
  const greenRatio = (green / ITERATIONS) * 100;

  // Assert it's within an acceptable margin
  expect(blueRatio).toBeGreaterThan(85);
  expect(greenRatio).toBeLessThan(15);
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
