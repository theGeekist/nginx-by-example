import { test, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";
import { copyFile, reloadNginx, unlink, getSitesEnabledPath, getCertPath, getConfDPath, spawnCurl } from "@utils/env";
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
  const result = spawnCurl({
    hostname: "localhost",
    path: "/ocsp/whatever",
    port: 8181,
    protocol: "http",
    silent: true,
    discardBody: true,
    onlyStatus: true
  });

  const status = result.stdout.toString().trim();
  expect(status).toBe("200");
});

test("HTTPS freebies.local responds correctly", () => {
  const result = spawnCurl({
    hostname: "freebies.local",
    port: 8181,
    protocol: "http", // original test used HTTP not HTTPS
    followRedirect: true,
    verbose: true
  });

  const stdout = result.stdout.toString();
  expect(stdout.includes("freebies.local")).toBe(true);
});

test("HTTPS test.local responds correctly", () => {
  const result = spawnCurl({
    hostname: "test.local",
    port: 8181,
    protocol: "http", // original test used HTTP not HTTPS
    followRedirect: true,
    verbose: true
  });

  const stdout = result.stdout.toString();
  expect(stdout.includes("test.local")).toBe(true);
});

afterAll(() => {
  unlink(CONF_SYMLINK);
  unlink(CONFD_SYMLINK);
  reloadNginx();    
});
