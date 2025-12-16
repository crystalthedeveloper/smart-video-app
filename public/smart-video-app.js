/*!
 * Smart Video (CLTD)
 * A cookie-safe, lightweight lazy-loading video script for Webflow and other sites.
 *
 * 🎬 Supports: YouTube + Vimeo
 * ⚡ Features:
 *   • Lazy-loads videos only when clicked (better performance & privacy)
 *   • Auto thumbnail for YouTube + Vimeo
 *   • Cookie-safe (uses youtube-nocookie.com)
 *   • Custom play button via Webflow Designer (kept intact)
 *   • Unique CLTD namespace to avoid conflicts
 *
 * 👩🏽‍💻 Created by Crystal The Developer
 * 🌐 https://www.crystalthedeveloper.ca
 */

(function () {
  if (window.__cltdSmartVideoInitialized) return;
  window.__cltdSmartVideoInitialized = true;

  document.addEventListener("DOMContentLoaded", () => {
    const videos = document.querySelectorAll(".cltd-lazy-video");
    if (!videos.length) return;

    videos.forEach(async (el) => {
      const type = (el.dataset.cltdType || "youtube").toLowerCase();
      const id = el.dataset.cltdId;
      if (!id) return;

      // ✅ Basic container setup
      el.style.position = "relative";
      el.style.aspectRatio = "16/9";
      el.style.cursor = "pointer";
      el.style.overflow = "hidden";

      // ✅ Find or create thumbnail <img>
      let img = el.querySelector("img[alt='Video thumbnail']");
      if (!img) {
        img = document.createElement("img");
        img.alt = "Video thumbnail";
        img.loading = "lazy";
        img.style.cssText =
          "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:opacity .3s ease;";
        el.insertBefore(img, el.firstChild);
      }

      // ✅ Get thumbnail from YouTube or Vimeo
      if (type === "youtube") {
        img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      } else if (type === "vimeo") {
        try {
          const res = await fetch(`https://vimeo.com/api/v2/video/${id}.json`);
          const data = await res.json();
          if (data?.[0]?.thumbnail_large) img.src = data[0].thumbnail_large;
        } catch (e) {
          console.warn("[CLTD Smart Video] Vimeo thumbnail fetch failed:", e);
        }
      }

      // ✅ On click → replace with iframe
      el.addEventListener("click", () => {
        const src =
          type === "youtube"
            ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
            : `https://player.vimeo.com/video/${id}?autoplay=1`;

        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.frameBorder = "0";
        iframe.style.cssText =
          "position:absolute;top:0;left:0;width:100%;height:100%;border:0;";

        el.innerHTML = "";
        el.appendChild(iframe);
      });
    });
  });
})();
