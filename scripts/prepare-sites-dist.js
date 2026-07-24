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

const serverSource = String.raw`export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response("Static asset binding is unavailable.", { status: 500 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    const url = new URL(request.url);
    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  }
};
`;

fs.writeFileSync(serverTarget, serverSource);
