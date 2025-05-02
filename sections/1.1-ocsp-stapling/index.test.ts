import { test, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";
import { copyFile, reloadNginx, unlink, getSitesEnabledPath, getCertPath } from "@utils/env";
import { spawnSync } from "bun";

const CWD = import.meta.dir;
const CA_CERT_PATH = getCertPath("ca.crt");
const CONF_SYMLINK = getSitesEnabledPath("default.conf");
const SSL_SYMLINK = getSitesEnabledPath("ssl_params");
const CONF_PARAMS = join(CWD, "default.conf");
const SSL_FILE = join(CWD, "ssl_params");


beforeAll(() => {
  copyFile(CONF_PARAMS, CONF_SYMLINK);
  copyFile(SSL_FILE, SSL_SYMLINK);  
  reloadNginx();
})

test("OCSP stapling is enabled via curl", () => {
  const result = spawnSync({
    cmd: [
      "curl",
      "-v",
      "https://localhost:8443",
      "--cacert", CA_CERT_PATH
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  const stdout = result.stdout.toString();

  expect(result.success).toBe(true);
  expect(stdout).toContain("OCSP stapling test passed.");

});

afterAll(() => {
  unlink(CONF_SYMLINK)
  // unlink(SSL_SYMLINK); // reused for all other tests
  reloadNginx();
})