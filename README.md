# Smart Video (CLTD)

A cookie-safe, lightweight lazy-loading video embed for Webflow CMS and other sites.

🎬 **Supports:** YouTube + Vimeo  
⚡ **Features:**
- Lazy-loads only when clicked (better performance & privacy)  
- Auto thumbnails for YouTube (HQ default) and Vimeo (via API)  
- Cookie-safe YouTube embeds (`youtube-nocookie.com`)  
- Keeps your custom play button or overlay intact until playback  
- Auto applies a responsive 16:9 aspect ratio — no extra CSS needed  
- CLTD sandbox/namespace prevents double-initializing on the page  

---

## 🚀 Getting Started

### 1️⃣ Add the Script (Before </body>)
In your Webflow project, open **Page Settings → Custom Code → Before </body>** and paste:

```html
<!-- Smart Video (CLTD) YouTube & Vimeo Lazy Loader -->
<script src="https://cdn.jsdelivr.net/gh/crystalthedeveloper/smart-video-app@v1.0.2/smart-video.js" defer></script>
```

> Host the file yourself or pin to a specific tag once you’re ready for production.

---

### 2️⃣ Set Up Your CMS Fields
- Add a Plain Text field for the **video ID** (YouTube or Vimeo).  
- Optional: add an Image field if you want a custom thumbnail.  

💡 *Use only the ID, not the full URL.*  
`https://www.youtube.com/watch?v=dQw4w9WgXcQ` → **dQw4w9WgXcQ**

---

### 3️⃣ Drop the Embed Block Inside Your CMS Template
Paste this into a Webflow **Embed** block:

```html
<div
  class="cltd-lazy-video"
  data-cltd-type="youtube"
  data-cltd-id="{{wf {&quot;path&quot;:&quot;youtube-video-id&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}"
>
  <!-- Optional custom thumbnail (otherwise fetched automatically) -->
  <!-- <img src="https://assets.example.com/my-thumbnail.jpg" alt="Video thumbnail" loading="lazy" /> -->

  <!-- Optional custom overlay -->
  <button class="play-btn">▶</button>
</div>
```

No inline styling is required. The script applies the container styles, handles the click, and swaps in the iframe for you.

---

### 🎨 4️⃣ Style in Webflow
- Style `.cltd-lazy-video` and any child elements (like `.play-btn`) directly in the Designer.  
- Add your own SVG, gradient button, or overlay — anything inside the div stays visible until the video loads.  
- For custom thumbnails, provide an `<img alt="Video thumbnail">`; otherwise the script injects one for you.  

---

### 5️⃣ Vimeo Support
Switch to Vimeo by changing the data attributes:

```html
data-cltd-type="vimeo"
data-cltd-id="{{wf {&quot;path&quot;:&quot;vimeo-video-id&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}"
```

The script fetches the poster frame automatically. If the API call fails, your provided `<img>` fallback (if any) remains in place.

---

### 💡 How It Works
- Smart Video looks for `.cltd-lazy-video` elements once the DOM is ready.  
- It auto-creates or updates a thumbnail image.  
- When clicked, it replaces the container contents with a privacy-friendly YouTube or Vimeo iframe and starts playback.  
- `window.__cltdSmartVideoInitialized` ensures the script only runs once per page.  

---

### ✅ Example Output

```html
<div class="cltd-lazy-video" data-cltd-type="youtube" data-cltd-id="dQw4w9WgXcQ">
  <button class="play-btn">▶</button>
</div>
```

---

## 🧠 Notes
- Works with static embeds or dynamic CMS content.  
- Drop in multiple videos per page — each instance lazy-loads independently.  
- No dependencies; pure vanilla JavaScript.  
- Perfect for clients: all visual styling stays inside Webflow Designer.  

---

👩🏽‍💻 Created by [Crystal The Developer](https://www.crystalthedeveloper.ca)  
🌐 Use it freely in your Webflow projects!
