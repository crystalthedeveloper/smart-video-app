const API_BASE = "https://api.webflow.com/v2";
export const SMART_VIDEO_SCRIPT_URL =
  "https://smart-video-app.webflow.io/smart-video-app/smart-video-app.js";
export const SMART_VIDEO_SNIPPET = `<script src="${SMART_VIDEO_SCRIPT_URL}" data-cltd-smart-video defer></script>`;
const SMART_VIDEO_SNIPPET_REGEX = /<script[^>]*data-cltd-smart-video[^>]*><\\/script>\s*/gi;
const SMART_VIDEO_SITE_SCRIPT_ID = "smart-video-app-script";

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
  const scripts =
    raw.appInstalledSiteScripts ??
    raw.app_installed_site_scripts ??
    raw.siteScripts?.appInstalled ??
    raw.site_scripts?.app_installed ??
    [];

  return {
    head: raw.head ?? raw.head_code ?? "",
    bodyBegin: raw.bodyBegin ?? raw.body_begin ?? raw.body ?? "",
    beforeBodyClose: raw.beforeBodyClose ?? raw.before_body_close ?? raw.foot ?? raw.footer ?? "",
    appInstalledSiteScripts: Array.isArray(scripts) ? scripts : []
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
  const normalized = {
    head: customCode.head ?? "",
    bodyBegin: customCode.bodyBegin ?? "",
    beforeBodyClose: customCode.beforeBodyClose ?? "",
    appInstalledSiteScripts: customCode.appInstalledSiteScripts ?? []
  };

  const payload = {
    customCode: normalized,
    custom_code: {
      head: normalized.head,
      head_code: normalized.head,
      bodyBegin: normalized.bodyBegin,
      body_begin: normalized.bodyBegin,
      beforeBodyClose: normalized.beforeBodyClose,
      before_body_close: normalized.beforeBodyClose,
      appInstalledSiteScripts: normalized.appInstalledSiteScripts,
      app_installed_site_scripts: normalized.appInstalledSiteScripts
    }
  };

  await callWebflow(`/sites/${siteId}/custom_code`, {
    method: "PATCH",
    token,
    body: payload
  });
}

function createSmartVideoSiteScript() {
  return {
    id: SMART_VIDEO_SITE_SCRIPT_ID,
    identifier: SMART_VIDEO_SITE_SCRIPT_ID,
    description: "Smart Video app-installed site script",
    location: "before_body_close",
    tag: "script",
    tagName: "script",
    type: "external",
    scriptType: "external",
    src: SMART_VIDEO_SCRIPT_URL,
    url: SMART_VIDEO_SCRIPT_URL,
    snippet: SMART_VIDEO_SNIPPET,
    html: SMART_VIDEO_SNIPPET,
    content: SMART_VIDEO_SNIPPET,
    defer: true,
    attributes: [
      { name: "src", value: SMART_VIDEO_SCRIPT_URL },
      { name: "data-cltd-smart-video", value: "" },
      { name: "defer", value: "true" }
    ],
    installedByApp: true,
    enabled: true
  };
}

function isSmartVideoSiteScript(script = {}) {
  if (!script || typeof script !== "object") return false;

  const identifiers = [
    script.id,
    script.identifier,
    script.scriptId,
    script.script_id,
    script.name,
    script.slug
  ];

  if (identifiers.some((value) => typeof value === "string" && value.includes("smart-video"))) {
    return true;
  }

  const urls = [script.src, script.url, script.href];
  if (urls.some((value) => typeof value === "string" && value.includes("smart-video-app"))) {
    return true;
  }

  const snippets = [script.snippet, script.html, script.content, script.body];
  return snippets.some(
    (value) => typeof value === "string" && value.includes("data-cltd-smart-video")
  );
}

function stripSmartVideoSnippet(footer = "") {
  const cleaned = footer.replace(SMART_VIDEO_SNIPPET_REGEX, "").trim();
  return cleaned ? `${cleaned}\n` : "";
}

export async function ensureSmartVideoSnippet(siteId, token) {
  const customCode = await getCustomCode(siteId, token);
  const scripts = Array.isArray(customCode.appInstalledSiteScripts)
    ? [...customCode.appInstalledSiteScripts]
    : [];
  let updated = false;

  if (!scripts.some(isSmartVideoSiteScript)) {
    scripts.push(createSmartVideoSiteScript());
    updated = true;
  }

  const footer = stripSmartVideoSnippet(customCode.beforeBodyClose);

  await saveCustomCode(siteId, token, {
    head: customCode.head,
    bodyBegin: customCode.bodyBegin,
    beforeBodyClose: footer,
    appInstalledSiteScripts: scripts
  });

  return { updated };
}

export async function removeSmartVideoSnippet(siteId, token) {
  const customCode = await getCustomCode(siteId, token);
  const cleanedFooter = stripSmartVideoSnippet(customCode.beforeBodyClose);
  const scripts = Array.isArray(customCode.appInstalledSiteScripts)
    ? customCode.appInstalledSiteScripts.filter((script) => !isSmartVideoSiteScript(script))
    : [];

  const snippetRemoved = cleanedFooter !== customCode.beforeBodyClose;
  const scriptRemoved = scripts.length !== customCode.appInstalledSiteScripts.length;

  if (!snippetRemoved && !scriptRemoved) {
    return { updated: false };
  }

  await saveCustomCode(siteId, token, {
    head: customCode.head,
    bodyBegin: customCode.bodyBegin,
    beforeBodyClose: cleanedFooter,
    appInstalledSiteScripts: scripts
  });

  return { updated: true };
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}
