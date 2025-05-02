import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, reloadNginx, setupTestConfig, teardownTestConfig
} from "@utils/env";

let testUrl: string;

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
  testUrl = `/index.php?date=${Date.now()}`;
});

test("First request should MISS the cache", () => {
  const res = curlApi(testUrl, ["-s", "-D", "-", "-o", "/dev/null"]);
  expect(res).toMatch(/X-Cache: (MISS|BYPASS)/);
});

test("Second request should HIT the cache", () => {
  // warm it up
  curlApi("/", ["-s", "-o", "/dev/null"]);

  const res = curlApi(testUrl, ["-s", "-D", "-", "-o", "/dev/null"]);
  expect(res).toMatch(/X-Cache: HIT/);
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});