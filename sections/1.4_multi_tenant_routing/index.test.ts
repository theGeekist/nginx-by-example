import { test, expect, beforeAll, afterAll } from "bun:test";
import {
  reloadNginx,
  getCertPath,
  setupTestConfig,
  teardownTestConfig,
  spawnCurl,
} from "@utils/env";

beforeAll(() => {
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("Dynamic subdomain routing", () => {
  const domains = ["test", "freebies"];
  for (const sub of domains) {
    const result = spawnCurl({
      hostname: `${sub}.local`,
      port: 8443,
      protocol: "https", // original test used HTTP not HTTPS
      followRedirect: true,
      verbose: true
    });
    const stdout = result.stdout.toString();
    expect(stdout.includes(`Hello from ${sub}`)).toBe(true);
  }
});

afterAll(() => {
  teardownTestConfig();
  reloadNginx();
});
