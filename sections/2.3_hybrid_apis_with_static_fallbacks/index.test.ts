import { test, expect, beforeAll, afterAll } from "bun:test";
import { curlApi, reloadNginx, setupTestConfig, teardownTestConfig } from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("Returns static JSON if API fails", () => {
  const body = curlApi("/api/stats", ["-s"]);
  expect(body).toContain('"visitors": 42000');
  expect(body).toContain('"uptime": "99.99%"');
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
