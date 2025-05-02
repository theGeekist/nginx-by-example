import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, reloadNginx, setupTestConfig, teardownTestConfig
} from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("X-Accel-Redirect serves internal image", () => {
  const result = curlApi("/avatar", [
    "-s", "-D", "-", "-o", "/dev/null"
  ]);

  expect(result).toMatch(/200 OK/);
  
  expect(result).toMatch(/X-Accel-Redirect: \/images\/logo.png/);
});

test("Internal location is not directly accessible", () => {
  const result = curlApi("/images/", [
    "-s", "-D", "-", "-o", "/dev/null"
  ]);

  expect(result).toMatch(/404/); // Because of "internal;"
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
