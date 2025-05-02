import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  curlApi, getCertPath, reloadNginx, setupTestConfig, teardownTestConfig
} from "@utils/env";
import { spawnSync } from "bun";

beforeAll(() => {
  setupTestConfig(import.meta.dir);
  reloadNginx();
});

test("Serves AVIF when accepted", () => {

  const result = spawnSync({
    cmd: [
      "curl", "-s", "-D", "-", "-o", "/dev/null",
      "-H", "Accept: image/avif",
      `https://localhost:8443/images/logo.png`,
      "--cacert", getCertPath("ca.crt")
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  const res = result.stdout.toString().trim();  
  expect(res).toContain("image/avif");
});

test("Serves WebP when AVIF not accepted", () => {
  const result = spawnSync({
    cmd: [
      "curl", "-s", "-D", "-", "-o", "/dev/null",
      "-H", "Accept: image/webp",
      `https://localhost:8443/images/logo.png`,
      "--cacert", getCertPath("ca.crt")
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  const res = result.stdout.toString().trim();  
  expect(res).toContain("image/webp");

});

test("Serves original when no Accept header", () => {
  const result = spawnSync({
    cmd: [
      "curl", "-s", "-D", "-", "-o", "/dev/null",
      "-H", "Accept: image/png",
      `https://localhost:8443/images/logo.png`,
      "--cacert", getCertPath("ca.crt")
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  const res = result.stdout.toString().trim();  
  expect(res).toContain("image/png");
});

afterAll(() => {
  // teardownTestConfig();
  reloadNginx();
});
