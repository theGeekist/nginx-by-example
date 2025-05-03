import { test, expect, beforeAll, afterAll } from "bun:test";
import { WebSocket } from "ws";
import { setTimeout } from "timers/promises";

import { startWs, stopWs } from "@sections/2.1_real_time_protocols/ws";
import { startSSE, stopSSE } from "@sections/2.1_real_time_protocols/sse";
import { startPoll, stopPoll } from "@sections/2.1_real_time_protocols/poll";
import { reloadNginx, setupTestConfig, teardownTestConfig, spawnCurl } from "@utils/env";

beforeAll(async () => {
  startWs();     // Starts mock WebSocket server
  startSSE();    // Starts mock Server-Sent Events server
  startPoll();   // Starts long-polling mock server

  setupTestConfig(import.meta.dir);
  reloadNginx();

  // Wait a few seconds to ensure all servers and nginx are ready
  await setTimeout(1e3); // 2 seconds should be safe, adjust if needed
});


test("WebSocket upgrade (fetch) fails as expected", async () => {
  const result = spawnCurl({
    hostname: "test.local",
    port: 8443,
    protocol: "https",
    headers: [
      "Connection: Upgrade",
      "Upgrade: websocket"
    ],
    verbose: true,
    extraCommands: ["--http1.1"]
  });

  const status = result.stdout.toString().trim();
  expect(status).toContain("404");
});

test("WS server echoes standalone", async () => {
  const ws = new WebSocket("ws://localhost:9001/ws");

  const msg = await new Promise<string>((resolve, reject) => {
    ws.onopen = () => ws.send("hello ws");
    ws.onmessage = (event) => resolve(event.data.toString());
    ws.onerror = reject;
    ws.onclose = () => reject("Connection closed before message received");
  });

  expect(msg).toBe("echo:hello ws");
});

test("SSE emits events and reaches client", async () => {
  const result = spawnCurl({
    hostname: "test.local",
    path: "/events/",
    port: 8443,
    protocol: "https",
    headers: ["Accept: text/event-stream"],
    extraCommands: ["--no-buffer"], // matches legacy curlApi call
    silent: true
  });

  const output = result.stdout.toString();
  expect(output.includes("message")).toBe(true);
});

test("Long polling endpoint waits and responds", async () => {
  const start = Date.now();

  const result = spawnCurl({
    hostname: "test.local",
    path: "/poll/",
    port: 8443,
    protocol: "https",
    silent: true
  });

  const elapsed = Date.now() - start;
  const stdout = result.stdout.toString();

  expect(stdout.includes("poll: update ready")).toBe(true);
  expect(elapsed).toBeGreaterThanOrEqual(1900); // allow 100ms buffer slop
});

afterAll(async () => {
  await stopWs();
  await stopSSE();
  await stopPoll();
  teardownTestConfig();
  reloadNginx();
});
