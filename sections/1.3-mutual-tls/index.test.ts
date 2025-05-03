import { test, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";
import { copyFile, reloadNginx, unlink, getSitesEnabledPath, getCertPath, getConfDPath } from "@utils/env";
import { spawnSync } from "bun";

const CWD = import.meta.dir;
const CA_CERT_PATH = getCertPath("ca.crt");
const CLIENT_CERT_PATH = getCertPath("client.crt");
const CLIENT_KEY_PATH = getCertPath("client.key");
const CLIENT_CA = getCertPath("client_ca.pem");
const CONF_SYMLINK = getSitesEnabledPath("default.conf");
const CONFD_SYMLINK = getConfDPath("http_exception.conf");
const CONF_PARAMS = join(CWD, "default.conf");
const OCSP_PARAMS = join(CWD, "http_exception.conf");

beforeAll(() => {
  copyFile(CONF_PARAMS, CONF_SYMLINK);
  copyFile(OCSP_PARAMS, CONFD_SYMLINK);
  reloadNginx();  
});


test("mTLS fails without client cert", () => {
  const result = spawnSync({
    cmd: [
      "curl",
      "-s",
      "-o", "/dev/null",
      "-w", "%{http_code}",
      "https://test.localhost:8443",
      "--cacert", CA_CERT_PATH
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  const statusCode = result.stdout.toString().trim();
  expect(statusCode).toBe("400");
});

test("mTLS succeeds with client cert", () => {
  const result = spawnSync({
    cmd: [
      "curl", "-v",
      "https://test.localhost:8443",
      "--cert", CLIENT_CERT_PATH,
      "--key", CLIENT_KEY_PATH,
      "--cacert", CLIENT_CA
    ]
  });
  const body = result.stdout.toString();
  expect(body.includes("Client verified")).toBe(true);
});

afterAll(() => {
  unlink(CONF_SYMLINK);
  unlink(CONFD_SYMLINK);
  reloadNginx();    
});
