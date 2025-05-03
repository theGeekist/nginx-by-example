import { test, expect, beforeAll, afterAll } from "bun:test";
import { reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig } from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("Serves Brotli when requested", () => {
  const result = spawnCurl({
    hostname: "test.local",
    path: "/compressed.html",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"], // dump headers to stdout
    headers: ["Accept-Encoding: br"]
  });

  const headers = result.stdout.toString().trim();
  expect(headers).toContain("Content-Encoding: br");
});

test("Serves Gzip when Brotli not accepted", () => {
  const result = spawnCurl({
    hostname: "test.local",
    path: "/compressed.html",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"],
    headers: ["Accept-Encoding: gzip"]
  });

  const headers = result.stdout.toString().trim();
  expect(headers).toContain("Content-Encoding: gzip");
});

test("Falls back to original when no encoding is accepted", () => {
  const result = spawnCurl({
    hostname: "test.local",
    path: "/compressed.html",
    protocol: "https",
    port: 8443,
    silent: true,
    discardBody: true,
    extraCommands: ["-D", "-"],
    headers: ["Accept-Encoding:"]
  });

  const headers = result.stdout.toString().trim();
  expect(headers).not.toContain("Content-Encoding");
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
