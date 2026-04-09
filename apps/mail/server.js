import { readFileSync, existsSync } from "fs";
import { join } from "path";

const BUILD_DIR = join(import.meta.dir, "build", "client");
const PORT = parseInt(process.env.PORT || "3000", 10);

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Try to serve the exact file
    let filePath = join(BUILD_DIR, pathname);
    if (existsSync(filePath) && !Bun.file(filePath).name?.endsWith("/")) {
      return new Response(Bun.file(filePath));
    }

    // Try with index.html for directory paths
    const indexPath = join(filePath, "index.html");
    if (existsSync(indexPath)) {
      return new Response(Bun.file(indexPath), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    // SPA fallback — serve root index.html for all routes
    const rootIndex = join(BUILD_DIR, "index.html");
    if (existsSync(rootIndex)) {
      return new Response(Bun.file(rootIndex), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Zero SPA server running on http://0.0.0.0:${PORT}`);
