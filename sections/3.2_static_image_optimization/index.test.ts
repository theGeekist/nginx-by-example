import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, getCertPath, reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig
} from "@utils/env";
import { spawnSync } from "bun";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("Serves AVIF when accepted", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    path: "/images/logo.png",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"],
    headers: ["Accept: image/avif"]
  });

  const res = result.stdout.toString().trim();
  expect(res).toContain("image/avif");
});

test("Serves WebP when AVIF not accepted", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    path: "/images/logo.png",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"],
    headers: ["Accept: image/webp"]
  });

  const res = result.stdout.toString().trim();
  expect(res).toContain("image/webp");
});

test("Serves original when no Accept header", () => {
  const result = spawnCurl({
    hostname: "test.localhost",
    path: "/images/logo.png",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"],
    headers: ["Accept: image/png"]
  });

  const res = result.stdout.toString().trim();
  expect(res).toContain("image/png");
});


afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
