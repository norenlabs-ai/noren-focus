const fs = require("fs");
const path = require("path");

const root = process.cwd();
const distDir = path.join(root, "dist");
const serverDir = path.join(distDir, "server");
const hostingSource = path.join(root, ".openai", "hosting.json");
const hostingTarget = path.join(distDir, ".openai", "hosting.json");
const serverTarget = path.join(serverDir, "index.js");

fs.mkdirSync(serverDir, { recursive: true });
fs.mkdirSync(path.dirname(hostingTarget), { recursive: true });
fs.copyFileSync(hostingSource, hostingTarget);

const serverSource = String.raw`const http = require("http");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..");
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function resolveFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(publicDir, safePath);

  if (!absolutePath.startsWith(publicDir)) {
    return path.join(publicDir, "404.html");
  }

  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    return absolutePath;
  }

  if (fs.existsSync(path.join(absolutePath, "index.html"))) {
    return path.join(absolutePath, "index.html");
  }

  return path.join(publicDir, "index.html");
}

http.createServer((req, res) => {
  const filePath = resolveFile(req.url || "/");
  const ext = path.extname(filePath);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      "content-type": contentTypes[ext] || "application/octet-stream"
    });
    res.end(data);
  });
}).listen(port, "0.0.0.0");
`;

fs.writeFileSync(serverTarget, serverSource);
