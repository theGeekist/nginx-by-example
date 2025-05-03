import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig
} from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("X-Accel-Redirect serves internal image", () => {
  const result = spawnCurl({
    hostname: "test.local",
    path: "/avatar",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"]
  });

  const output = result.stdout.toString().trim();
  expect(output).toMatch(/200 OK/);
  expect(output).toMatch(/X-Accel-Redirect: \/images\/logo.png/);
});

test("Internal location is not directly accessible", () => {
  const result = spawnCurl({
    hostname: "test.local",
    path: "/images/",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"]
  });

  const output = result.stdout.toString().trim();
  expect(output).toMatch(/404/); // Because of "internal;"
});


afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
