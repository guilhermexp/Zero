import { existsSync } from "fs";
import { join } from "path";

const BUILD_DIR = join(import.meta.dir, "build", "client");
const PORT = parseInt(process.env.PORT || "3000", 10);

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve static assets from build/client
    const filePath = join(BUILD_DIR, pathname);
    if (pathname !== "/" && existsSync(filePath)) {
      const file = Bun.file(filePath);
      if (file.size > 0) {
        const headers = {};
        if (pathname.startsWith("/assets/")) {
          headers["cache-control"] = "public, immutable, max-age=31536000";
        }
        return new Response(file, { headers });
      }
    }

    // SPA fallback — serve index.html for all routes
    const indexPath = join(BUILD_DIR, "index.html");
    if (existsSync(indexPath)) {
      return new Response(Bun.file(indexPath), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Zero SPA server running on http://0.0.0.0:${PORT}`);
