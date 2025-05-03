import { mkdirSync, existsSync, readdirSync, copyFileSync, unlinkSync, symlinkSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { spawnSync } from "bun";

const CWD = import.meta.dir;
export const PROJECT_ROOT = join(CWD, "..");
export const DOCKER_ROOT = join(PROJECT_ROOT, "docker");
export const HTML = join(DOCKER_ROOT, "srv");
export const SITES_ENABLED = join(DOCKER_ROOT, "sites-enabled");
export const CONFD_ENABLED = join(DOCKER_ROOT, "conf.d");
export const CERTS = join(DOCKER_ROOT, "ssl");

export const getConfDPath = (file: string) => {
  return join(CONFD_ENABLED, file)
}

export const getHtmlPath = (file: string) => {
  return join(HTML, file)
}

export const getSitesEnabledPath = (file: string) => {
  return join(SITES_ENABLED, file)
}
export const getCertPath = (file: string) => {
  return join(CERTS, file)
}

export function setupTestConfig(localDir: string, filename = "default.conf") {
  const confFile = join(localDir, filename);
  const symlink = getSitesEnabledPath(filename);
  copyFile(confFile, symlink);
}

export function teardownTestConfig(filename = "default.conf") {
  const symlink = getSitesEnabledPath(filename);
  unlink(symlink);
}

export function copyFile(from: string, to: string) {
  copyFileSync(from, to);
}

export function copyDir(src: string, dest: string) {
  if (!existsSync(src)) return;

  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src)) {
    copyFileSync(join(src, file), join(dest, file));
  }
}

export function unlink(path: string) {
  unlinkSync(path);
}

export function reloadNginx(container = "nginx-by-example-nginx") {
  try {
    execSync(`docker exec ${container} nginx -s reload`, { stdio: "ignore" });
  } catch (err) {
    console.warn(`⚠️ Failed to reload nginx [${container}]:`, (err as Error).message);
  }
}
export const curlApi = (path: string, flags:string[] = []) => {
  const result = spawnSync({
    cmd: [
      "curl", ...flags,
      `https://test.localhost:8443${path}`,
      "--cacert", getCertPath("ca.crt")
    ],
    stdout: "pipe",
    stderr: "pipe"
  });

  return result.stdout.toString().trim();
};

interface CurlOptions {
  subdomain?: string;        // Optional subdomain, e.g. "freebies"
  hostname?: string;         // Full hostname override, e.g. "localhost" or "my.site"
  path?: string;             // Path after domain, default "/"
  port?: number;             // Port number, default 8443
  protocol?: "http" | "https"; // Default "https"
  verbose?: boolean;         // -v
  followRedirect?: boolean;  // -L
  headers?: string[];        // Custom headers
  silent?: boolean;          // -s
  discardBody?: boolean;     // -o /dev/null
  onlyStatus?: boolean;      // -w %{http_code}
  extraCommands?: string[];
}

export function spawnCurl(opts: CurlOptions) {
  const {
    hostname,
    path = "/",
    port = 8443,
    protocol = "https",
    verbose = false,
    followRedirect = false,
    headers = [],
    silent = false,
    discardBody = false,
    onlyStatus = false,
    extraCommands = [],
  } = opts;

  // Prefer `hostname`, fallback to `subdomain.localhost`, fallback to `localhost`
  const url = `${protocol}://${hostname}:${port}${path}`;

  const cmd = ["curl"];
  cmd.push("--resolve", `test.localhost:8181:127.0.0.1`);
  cmd.push("--resolve", `test.localhost:8443:127.0.0.1`);
  cmd.push("--resolve", `freebies.localhost:8181:127.0.0.1`);
  cmd.push("--resolve", `freebies.localhost:8443:127.0.0.1`);

  if (verbose) cmd.push("-v");
  if (followRedirect) cmd.push("-L");
  if (silent) cmd.push("-s");
  if (discardBody) cmd.push("-o", "/dev/null");
  if (onlyStatus) cmd.push("-w", "%{http_code}");
  cmd.push("--cacert", getCertPath("ca.crt"));
  for(const c of extraCommands) {
    cmd.push(c);
  }

  for (const h of headers) {
    cmd.push("-H", h);
  }

  cmd.push(url);

  return spawnSync({ cmd, stdout: "pipe", stderr: "pipe" });
}