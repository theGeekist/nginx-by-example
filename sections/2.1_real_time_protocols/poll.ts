let server: Bun.Server | undefined;

export function startPoll(port = 9003) {
  if (server) return;

  server = Bun.serve({
    port,
    async fetch(req) {
      // Simulate data not being ready yet
      await Bun.sleep(2000);
      return new Response("poll: update ready", {
        headers: {
          "Content-Type": "text/plain"
        }
      });
    }
  });

  server.unref();
  // console.log(`Polling server started on http://localhost:${port}/poll`);
}

export async function stopPoll(force = true) {
  if (server) {
    // console.log("Stopping polling server...");
    await server.stop(force);
    server = undefined;
  }
}
