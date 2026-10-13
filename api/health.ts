// GET /api/health → { live: boolean }. Tells the site whether live AI is configured.
// Never returns the key itself.
import type { IncomingMessage, ServerResponse } from "node:http";

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ live: Boolean(process.env.ANTHROPIC_API_KEY) }));
}
