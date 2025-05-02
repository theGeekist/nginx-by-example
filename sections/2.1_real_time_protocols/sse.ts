let server: Bun.Server | undefined;

export function startSSE(port = 9002) {
  if (server) return;

  server = Bun.serve({
    port,
    fetch(req) {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          let count = 0;

          const interval = setInterval(() => {
            const data = `data: message ${++count}\n\n`;
            controller.enqueue(encoder.encode(data));
            if (count === 3) {
              clearInterval(interval);
              controller.close();
            }
          }, 500);
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        }
      });
    }
  });

  server.unref();
  // console.log(`SSE server started on http://localhost:${port}/events`);
}

export async function stopSSE(force = true) {
  if (server) {
    // console.log("Stopping SSE server...");
    await server.stop(force);
    server = undefined;
  }
}
