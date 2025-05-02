import { test, expect, beforeAll, afterAll } from "bun:test";
import { WebSocket } from "ws";

import { startWs, stopWs } from "@sections/2.1_real_time_protocols/ws";
import { startSSE, stopSSE } from "@sections/2.1_real_time_protocols/sse";
import { startPoll, stopPoll } from "@sections/2.1_real_time_protocols/poll";
import {
  reloadNginx,
  curlApi,
  setupTestConfig,
  teardownTestConfig,
} from "@utils/env";

beforeAll(() => {
  startWs();
  startSSE();
  startPoll();
  setupTestConfig(import.meta.dir)
  reloadNginx();
});

test("WebSocket upgrade (fetch) fails as expected", async () => {
  const result = await fetch("https://test.localhost:8443/ws", {
    method: "GET",
    headers: {
      Connection: "Upgrade",
      Upgrade: "websocket",
    },
  }).catch((err) => err);

  expect(result instanceof Error).toBe(true);
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
  const output = curlApi("/events/", ["--no-buffer"])
  expect(output.includes("message")).toBe(true);
});

test("Long polling endpoint waits and responds", async () => {
  const start = Date.now();
  const stdout = curlApi("/poll/", ["-s"])
  const elapsed = Date.now() - start;
  expect(stdout.includes("poll: update ready")).toBe(true);
  expect(elapsed).toBeGreaterThanOrEqual(1900); // account for timing slop
});

afterAll(async () => {
  await stopWs();
  await stopSSE();
  await stopPoll();
  teardownTestConfig();
  reloadNginx();
});
