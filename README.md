# Smart Video

A lightweight, cookie-safe lazy-loading video script for Webflow CMS and other websites.

🎬 **Supports:** YouTube + Vimeo  
⚡ **Features:**
- Works perfectly inside **Webflow CMS** collections  
- Lazy loads videos only when clicked (improves page speed)  
- Cookie-safe (uses `youtube-nocookie.com`)  
- Custom play button or thumbnail supported  
- Style your **Play Button directly in Webflow** (no inline styles needed)  
- Responsive via CSS `aspect-ratio` — no extra styling needed  

---

## 🚀 Getting Started

### 1️⃣ Add the Script (Before </body>)
In your Webflow project, open **Page Settings → Custom Code → Before </body>** and paste:

```html
<!-- Smart Video YouTube & Vimeo Lazy Loader [by Crystal The Developer Inc.] -->
<script src="https://cdn.jsdelivr.net/gh/crystalthedeveloper/smart-video-app@v1.0.1/smart-video.js" defer></script>
```

---

### 2️⃣ Setup in the CMS
You can connect your CMS fields easily — no code editing required!

#### Example field setup:
- Add a CMS field called **YouTube Video ID** (Plain Text)  
  → Example value: `dQw4w9WgXcQ`  
- Optional: Add an **Image field** for a custom thumbnail or play button  

💡 *Tip:* Only use the **video ID**, not the full YouTube link.  
For example:  
`https://www.youtube.com/watch?v=dQw4w9WgXcQ` → use only **dQw4w9WgXcQ**

---

### 3️⃣ Add the Embed Code Block inside your CMS Collection Page

Paste this into a Webflow **Embed block**:

```html
<div 
  class="lazy-video" 
  data-type="youtube"
  data-id="{{wf {&quot;path&quot;:&quot;youtube-video-id&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}"
  style="position:relative;padding-top:56.25%;height:0;overflow:hidden;cursor:pointer;"
>
  <!-- Thumbnail image (auto YouTube preview) -->
  <img 
    src="https://img.youtube.com/vi/{{wf {&quot;path&quot;:&quot;youtube-video-id&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}/hqdefault.jpg" 
    alt="YouTube thumbnail" 
    loading="lazy" 
    style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" 
  />

  <!-- Optional Play Button -->
  <button class="play-btn">▶</button>
</div>
```

---

### 🎨 4️⃣ Style Your Play Button in Webflow
- Add a **Button** element inside your Embed with the class `play-btn`.  
- Style it directly in Webflow Designer (size, color, hover, etc.).  
- You can also replace it with a custom SVG or image for your play icon.  

No inline styling is needed — the Smart Video script only handles behavior, not design.

---

### 5️⃣ (Optional) Vimeo Support
If you use Vimeo, just change:
```html
data-type="vimeo"
data-id="{{wf {&quot;path&quot;:&quot;vimeo-video-id&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}"
```
and replace the thumbnail URL with your Vimeo preview image.

---

### 💡 How it Works
- Each `.lazy-video` waits for the user to click.  
- On click, the script replaces it with a YouTube or Vimeo iframe.  
- Nothing loads until the user interacts — improving page performance.  

---

### ✅ Example Output
A working example in Webflow CMS might look like this:

```html
<div class="lazy-video" data-type="youtube" data-id="dQw4w9WgXcQ">
  <button class="play-btn">▶</button>
</div>
```

---

## 🧠 Notes
- Works with **dynamic CMS fields** or static embeds.  
- You can duplicate for multiple videos per page.  
- No libraries required — fully standalone JavaScript.  
- 100% editable and stylable inside Webflow Designer.  

---

👩🏽‍💻 Created by [Crystal The Developer](https://www.crystalthedeveloper.ca)  
🌐 Use it freely in your Webflow projects and CMS templates!
