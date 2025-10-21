/*!
 * Smart Video
 * A lightweight, cookie-safe lazy-loading video script for Webflow and other sites.
 * 
 * 🎬 Supports: YouTube + Vimeo
 * ⚡ Features:
 *   • Lazy loads videos only when clicked (better performance & privacy)
 *   • Auto thumbnail for YouTube + Vimeo
 *   • Cookie-safe (uses youtube-nocookie.com)
 *   • Custom play button styling via Webflow Designer
 *   • Responsive via aspect-ratio — no extra CSS required
 * 
 * 👩🏽‍💻 Created by Crystal The Developer
 * 🌐 https://www.crystalthedeveloper.ca
 */

(function () {
  if (window.__smartVideoInitialized) return;
  window.__smartVideoInitialized = true;

  document.addEventListener("DOMContentLoaded", () => {
    const videos = document.querySelectorAll(".lazy-video");
    if (!videos.length) return;

    videos.forEach(async (el) => {
      const type = (el.dataset.type || "youtube").toLowerCase();
      const id = el.dataset.id;
      if (!id) return;

      // ✅ Basic container setup
      el.style.position = "relative";
      el.style.aspectRatio = "16/9";
      el.style.cursor = "pointer";
      el.style.overflow = "hidden";

      // ✅ Create thumbnail <img>
      const img = document.createElement("img");
      img.alt = "Video thumbnail";
      img.loading = "lazy";
      img.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:opacity .3s ease;";

      // ✅ Create play button
      const playBtn = document.createElement("img");
      playBtn.src = "https://cdn.prod.website-files.com/627d638bf3227602da3644f3/67f7eec786bb790128c8330c_play.svg";
      playBtn.alt = "Play button";
      playBtn.className = "play-btn";
      playBtn.loading = "lazy";
      playBtn.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;pointer-events:none;";

      // ✅ Get thumbnail
      if (type === "youtube") {
        img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      } else if (type === "vimeo") {
        try {
          const res = await fetch(`https://vimeo.com/api/v2/video/${id}.json`);
          const data = await res.json();
          if (data && data[0] && data[0].thumbnail_large) {
            img.src = data[0].thumbnail_large;
          }
        } catch (e) {
          console.warn("Vimeo thumbnail fetch failed:", e);
        }
      }

      el.appendChild(img);
      el.appendChild(playBtn);

      // ✅ On click → load iframe
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
        iframe.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;border:0;";

        el.innerHTML = "";
        el.appendChild(iframe);
      });
    });
  });
})();
