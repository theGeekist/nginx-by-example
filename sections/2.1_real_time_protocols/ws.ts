import type { ServerWebSocket } from "bun";

let server: Bun.Server | undefined;

export function startWs(port = 9001) {
  if (server) return;

  server = Bun.serve({
    port,
    fetch(req, server) {
      const { pathname } = new URL(req.url);
      if (pathname === "/ws" && server.upgrade) {
        server.upgrade(req);
        return;
      }

      return new Response("Not a WebSocket request");
    },
    websocket: {
      open(ws: ServerWebSocket<"ws">) {
        // console.log("WS connected");
        ws.subscribe("chatroom");
      },
      message(ws, message: string | Buffer) {
        const text = message.toString();
        // console.log(`Received: ${text}`);
        ws.send(`echo:${text}`);
      },
      close(ws) {
        // console.log("WS closed");
      },
      // Behavioural options reflecting the book's advice
      maxPayloadLength: 64 * 1024,                  // Allow large messages
      backpressureLimit: 1024 * 1024,               // Tolerate some buffer pressure
      closeOnBackpressureLimit: true,               // Drop if overloaded
      drain(ws) { console.log("🌀 Backpressure relieved"); },
      sendPings: true,                              // Keep-alive pings
      perMessageDeflate: { compress: true, decompress: true },
      publishToSelf: false
    },
  });

  server.unref(); // Don't block process exit
  // console.log(`WS started on ws://localhost:${port}/ws`);
}

export async function stopWs(force = true) {
  if (server) {
    // console.log("Stopping WS server...");
    await server.stop(force);
    server = undefined;
  }
}
