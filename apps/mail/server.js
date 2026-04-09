import { createRequestHandler } from "react-router";
import { join } from "path";
import { existsSync } from "fs";

const BUILD_DIR = join(import.meta.dir, "build");
const CLIENT_DIR = join(BUILD_DIR, "client");
const PORT = parseInt(process.env.PORT || "3000", 10);

// SSR mode: use React Router's request handler
const SSR_ENTRY = join(BUILD_DIR, "server", "index.js");
const isSSR = existsSync(SSR_ENTRY);

let handler;
if (isSSR) {
  const build = await import("./build/server/index.js");
  handler = createRequestHandler(build, "production");
}

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve static assets from build/client
    const filePath = join(CLIENT_DIR, pathname);
    if (pathname !== "/" && existsSync(filePath)) {
      const file = Bun.file(filePath);
      if (file.size > 0) {
        const headers = {};
        // Immutable cache for hashed assets
        if (pathname.startsWith("/assets/")) {
          headers["cache-control"] = "public, immutable, max-age=31536000";
        }
        return new Response(file, { headers });
      }
    }

    // SSR handler for all other routes
    if (handler) {
      return handler(req);
    }

    // SPA fallback
    const indexPath = join(CLIENT_DIR, "index.html");
    if (existsSync(indexPath)) {
      return new Response(Bun.file(indexPath), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Zero server running on http://0.0.0.0:${PORT} (${isSSR ? "SSR" : "SPA"} mode)`);
