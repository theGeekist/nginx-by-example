import { test, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";
import { copyFile, reloadNginx, unlink, getSitesEnabledPath, getCertPath, getConfDPath } from "@utils/env";
import { spawnSync } from "bun";

const CWD = import.meta.dir;
const CA_CERT_PATH = getCertPath("ca.crt");
const CONF_SYMLINK = getSitesEnabledPath("default.conf");
const CONFD_SYMLINK = getConfDPath("http_exception.conf");
const CONF_PARAMS = join(CWD, "default.conf");
const OCSP_PARAMS = join(CWD, "http_exception.conf");

beforeAll(() => {
  copyFile(CONF_PARAMS, CONF_SYMLINK);
  copyFile(OCSP_PARAMS, CONFD_SYMLINK);
  reloadNginx();  
});

test("OCSP responder bypasses redirect", () => {
  const result = spawnSync({
    cmd: [
      "curl",
      "-s", // silent (no progress)
      "-o", "/dev/null", // discard body
      "-w", "%{http_code}", // only return status code
      "http://localhost:8181/ocsp/whatever"
    ]
  });

  const status = result.stdout.toString().trim();
  expect(status).toBe("200");
});

test("HTTPS freebies.localhost responds correctly", () => {
  const result = spawnSync({
    cmd: [
      "curl",
      "-v",
      "-L",
      "http://freebies.localhost:8181",
      "--cacert", CA_CERT_PATH
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  const stdout = result.stdout.toString();
  expect(stdout.includes("freebies.localhost")).toBe(true);
});

test("HTTPS test.localhost responds correctly", () => {
  const result = spawnSync({
    cmd: [
      "curl",
      "-L",
      "http://test.localhost:8181",
      "--cacert", CA_CERT_PATH
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  const stdout = result.stdout.toString();
  expect(stdout.includes("test.localhost")).toBe(true);
});

afterAll(() => {
  unlink(CONF_SYMLINK);
  unlink(CONFD_SYMLINK);
  reloadNginx();    
});
