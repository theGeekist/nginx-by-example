import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, reloadNginx, setupTestConfig, teardownTestConfig
} from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("Serves Brotli when requested", () => {
  const headers = curlApi("/compressed.html", [
    "-s", "-D", "-", "-o", "/dev/null",
    "-H", "Accept-Encoding: br"
  ]);
  expect(headers).toContain("Content-Encoding: br");
});

test("Serves Gzip when Brotli not accepted", () => {
  const headers = curlApi("/compressed.html", [
    "-s", "-D", "-", "-o", "/dev/null",
    "-H", "Accept-Encoding: gzip"
  ]);
  expect(headers).toContain("Content-Encoding: gzip");
});

test("Falls back to original when no encoding is accepted", () => {
  const headers = curlApi("/compressed.html", [
    "-s", "-D", "-", "-o", "/dev/null",
    "-H", "Accept-Encoding:"
  ]);
  expect(headers).not.toContain("Content-Encoding");
});

afterAll(() => {
  // teardownTestConfig();
  reloadNginx();
});
