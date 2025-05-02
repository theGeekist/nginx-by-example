import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  reloadNginx,
  getCertPath,
  setupTestConfig,
  teardownTestConfig,
} from "@utils/env";
import { spawnSync } from "bun";

beforeAll(() => {
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("Dynamic subdomain routing", () => {
  const domains = ["test", "freebies"];
  for (const sub of domains) {
    const result = spawnSync({
      cmd: [
        "curl", "-v", "-L",
        `https://${sub}.localhost:8443`,
        "--cacert", getCertPath("ca.crt")
      ],
      stdout: "pipe",
      stderr: "pipe"
    });
    const stdout = result.stdout.toString();
    expect(stdout.includes(`Hello from ${sub}`)).toBe(true);
  }
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
