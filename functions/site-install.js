import {
  ensureSmartVideoSnippet,
  extractSiteInstallContext,
  jsonResponse
} from "./lib/smart-video.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return jsonResponse({ error: "Invalid JSON payload." }, 400);
    }

    const { siteId, accessToken } = extractSiteInstallContext(payload);
    if (!siteId || !accessToken) {
      return jsonResponse({ error: "Missing siteId or access token." }, 400);
    }

    try {
      const result = await ensureSmartVideoSnippet(siteId, accessToken);
      return jsonResponse({ ok: true, siteId, injected: result.updated });
    } catch (error) {
      console.error("[Smart Video] site-install failed", error);
      return jsonResponse({ error: error.message || "Unknown error" }, 500);
    }
  }
};
