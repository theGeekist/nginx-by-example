import { test, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";
import { copyFile, reloadNginx, unlink, getSitesEnabledPath, spawnCurl } from "@utils/env";

const CWD = import.meta.dir;
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
  const res = spawnCurl({
    hostname: "localhost",
    path: "/ocsp/whatever",
    port: 8181,
    protocol: "http",
    silent: true,
    discardBody: true,
    onlyStatus: true
  });
  expect(res.stdout.toString().trim()).toBe("200");
});

afterAll(() => {
  unlink(CONF_SYMLINK)
  // unlink(SSL_SYMLINK); // reused for all other tests
  reloadNginx();
})