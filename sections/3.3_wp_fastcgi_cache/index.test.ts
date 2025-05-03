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
  let res = "";
  for (let i = 0; i < 5; i++) {
    res = curlApi(testUrl, ["-s", "-D", "-", "-o", "/dev/null"]);
    if (!res.includes("404 Not Found")) break;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); // sleep 250ms
  }
  expect(res).toMatch(/X-Cache: (MISS|BYPASS)/);
});

test("Second request should HIT the cache", () => {
  let res2 = "";
  for (let i = 0; i < 5; i++) {
    res2 = curlApi(testUrl, ["-s", "-D", "-", "-o", "/dev/null"]);
    if (!res2.includes("404 Not Found")) break;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }
  expect(res2).toMatch(/X-Cache: HIT/);
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
