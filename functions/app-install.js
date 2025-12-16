import { jsonResponse } from "./lib/smart-video.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    try {
      await request.json();
    } catch (error) {
      // no-op: a bare install ping is acceptable
    }

    return jsonResponse({
      ok: true,
      event: "app.install",
      receivedAt: new Date().toISOString()
    });
  }
};
