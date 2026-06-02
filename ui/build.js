// Vercel build step: injects the backend API URL into the static HTML.
// Reads NEXT_PUBLIC_API_URL from Vercel env vars and writes a small config
// script so the front-end knows where the FastAPI backend lives.
const fs = require("fs");
const path = require("path");

const API = process.env.NEXT_PUBLIC_API_URL || "";
if (!API) {
  console.warn(
    "\n⚠  NEXT_PUBLIC_API_URL is not set. The UI will have no backend to call.\n" +
    "   Set it in Vercel → Project → Settings → Environment Variables\n" +
    "   to your server's HTTPS URL, e.g. https://api.yourdomain.com\n"
  );
}

const srcDir = path.join(__dirname, "public");
const outDir = path.join(__dirname, "dist");
fs.mkdirSync(outDir, { recursive: true });

let html = fs.readFileSync(path.join(srcDir, "index.html"), "utf8");

// Inject the API base as a global before any other script runs.
const cfg = `<script>window.ELIARA_API = ${JSON.stringify(API)};</script>`;
html = html.replace("<head>", "<head>\n" + cfg);

fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log(`✓ Built UI with API base: ${API || "(none set)"}`);
