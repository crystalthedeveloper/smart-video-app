const API_BASE = "https://api.webflow.com/v2";
export const SMART_VIDEO_SCRIPT_URL = "https://smart-video-app.webflow.io/smart-video-app.js";
export const SMART_VIDEO_SNIPPET = `<script src="${SMART_VIDEO_SCRIPT_URL}" data-cltd-smart-video defer></script>`;
const SMART_VIDEO_SNIPPET_REGEX = /<script[^>]*data-cltd-smart-video[^>]*><\\/script>\s*/gi;

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function pickString(source, paths = []) {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), source);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function extractSiteInstallContext(payload = {}) {
  const siteId = pickString(payload, [
    "siteId",
    "payload.siteId",
    "context.site.siteId",
    "context.site.id",
    "installation.site.siteId",
    "installation.siteId",
    "data.siteId",
    "site.siteId",
    "site.id"
  ]);

  const accessToken = pickString(payload, [
    "siteAccessToken",
    "payload.siteAccessToken",
    "context.tokens.siteAccessToken",
    "tokens.siteAccessToken",
    "installation.siteAccessToken",
    "data.siteAccessToken",
    "accessToken",
    "payload.accessToken"
  ]);

  return { siteId, accessToken };
}

function normalizeCustomCode(raw = {}) {
  return {
    head: raw.head ?? raw.head_code ?? "",
    bodyBegin: raw.bodyBegin ?? raw.body_begin ?? raw.body ?? "",
    beforeBodyClose: raw.beforeBodyClose ?? raw.before_body_close ?? raw.foot ?? raw.footer ?? ""
  };
}

async function callWebflow(path, { method = "GET", token, body } = {}) {
  if (!token) throw new Error("Missing access token for Webflow API call");
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...JSON_HEADERS
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let detail;
    try {
      detail = await response.json();
    } catch (error) {
      try {
        detail = await response.text();
      } catch (innerError) {
        detail = response.statusText;
      }
    }

    throw new Error(
      `Webflow API ${method} ${path} failed (${response.status}): ${
        typeof detail === "string" ? detail : detail?.message || "Unknown error"
      }`
    );
  }

  if (response.status === 204) return {};
  return response.json();
}

async function getCustomCode(siteId, token) {
  const payload = await callWebflow(`/sites/${siteId}/custom_code`, { token });
  const customCode = payload?.customCode ?? payload?.custom_code ?? payload ?? {};
  return normalizeCustomCode(customCode);
}

async function saveCustomCode(siteId, token, customCode) {
  const payload = {
    customCode,
    custom_code: customCode
  };

  await callWebflow(`/sites/${siteId}/custom_code`, {
    method: "PATCH",
    token,
    body: payload
  });
}

export async function ensureSmartVideoSnippet(siteId, token) {
  const customCode = await getCustomCode(siteId, token);
  if (customCode.beforeBodyClose.includes("data-cltd-smart-video")) {
    return { updated: false };
  }

  const updatedFooter = [customCode.beforeBodyClose.trim(), SMART_VIDEO_SNIPPET]
    .filter(Boolean)
    .join("\n");

  await saveCustomCode(siteId, token, {
    head: customCode.head,
    bodyBegin: customCode.bodyBegin,
    beforeBodyClose: `${updatedFooter}\n`
  });

  return { updated: true };
}

export async function removeSmartVideoSnippet(siteId, token) {
  const customCode = await getCustomCode(siteId, token);
  const cleanedFooter = customCode.beforeBodyClose.replace(SMART_VIDEO_SNIPPET_REGEX, "").trim();

  if (cleanedFooter === customCode.beforeBodyClose.trim()) {
    return { updated: false };
  }

  await saveCustomCode(siteId, token, {
    head: customCode.head,
    bodyBegin: customCode.bodyBegin,
    beforeBodyClose: cleanedFooter ? `${cleanedFooter}\n` : ""
  });

  return { updated: true };
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}
