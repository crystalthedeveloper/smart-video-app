/*!
 * Smart Video
 * A lightweight, cookie-safe lazy-loading video script for Webflow and other sites.
 * 
 * 🎬 Supports: YouTube + Vimeo
 * ⚡ Features:
 *   • Lazy loads videos only when clicked (better performance & privacy)
 *   • Cookie-safe (uses youtube-nocookie.com)
 *   • Custom play button styling via Webflow Designer
 *   • Responsive via aspect-ratio — no extra CSS required
 * 
 * 👩🏽‍💻 Created by Crystal The Developer
 * 🌐 https://www.crystalthedeveloper.ca
 */

(function () {
  // ✅ Prevent double initialization (Webflow re-renders pages dynamically)
  if (window.__smartVideoInitialized) return;
  window.__smartVideoInitialized = true;

  document.addEventListener("DOMContentLoaded", () => {
    const videos = document.querySelectorAll(".lazy-video");
    if (!videos.length) return;

    videos.forEach((el) => {
      const type = el.dataset.type;
      const id = el.dataset.id;

      // Ensure container basics
      el.style.position = "relative";
      el.style.aspectRatio = "16/9";
      el.style.cursor = "pointer";

      // Lazy-load iframe on click
      el.addEventListener("click", () => {
        const src =
          type === "youtube"
            ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
            : `https://player.vimeo.com/video/${id}?autoplay=1`;

        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;

        Object.assign(iframe.style, {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
        });

        el.innerHTML = "";
        el.appendChild(iframe);
      });
    });
  });
})();
