import { jsonResponse } from "./lib/smart-video.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    try {
      await request.json();
    } catch (error) {
      // allow empty payloads
    }

    return jsonResponse({
      ok: true,
      event: "app.uninstall",
      receivedAt: new Date().toISOString()
    });
  }
};
