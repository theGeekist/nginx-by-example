import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, reloadNginx, setupTestConfig, spawnCurl, teardownTestConfig
} from "@utils/env";

let testUrl: string;

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
  testUrl = `/index.php?date=${Date.now()}`;
});

test("First request should MISS the cache", () => {
  let res = "";
  const buf = new SharedArrayBuffer(4);
  const wait = () => Atomics.wait(new Int32Array(buf), 0, 0, 250); // 250ms sleep

  for (let i = 0; i < 5; i++) {
    const result = spawnCurl({
      hostname: "test.local",
      path: testUrl,
      protocol: "https",
      port: 8443,
      silent: true,
      discardBody: true,
      extraCommands: ["-D", "-"]
    });

    res = result.stdout.toString().trim();
    if (!res.includes("404 Not Found")) break;
    wait();
  }

  expect(res).toMatch(/X-Cache: (MISS|BYPASS)/);
});


test("Second request should HIT the cache", () => {
  let res2 = "";
  const buf = new SharedArrayBuffer(4);
  const wait = () => Atomics.wait(new Int32Array(buf), 0, 0, 250);

  for (let i = 0; i < 5; i++) {
    const result = spawnCurl({
      hostname: "test.local",
      path: testUrl,
      protocol: "https",
      port: 8443,
      silent: true,
      discardBody: true,
      extraCommands: ["-D", "-"]
    });

    res2 = result.stdout.toString().trim();
    if (!res2.includes("404 Not Found")) break;
    wait();
  }

  expect(res2).toMatch(/X-Cache: HIT/);
});


afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
