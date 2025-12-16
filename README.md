# Smart Video (CLTD)

Smart Video is now a Webflow Marketplace app that auto-injects a cookie-safe, lazy-loading YouTube + Vimeo script into every published site where the app is installed. Designers continue to build native Webflow CMS bindings and `.cltd-lazy-video` components exactly the way they are used to—no canvas injection, symbols, or custom attributes are touched.

## What ships in this repo
- `public/smart-video-app.js` – vanilla JS that upgrades `.cltd-lazy-video` wrappers with thumbnails and privacy-friendly embeds on click.
- `manifest.json` – declares OAuth + lifecycle hooks so Webflow knows how to talk to the app.
- `cloud.config.json` – Webflow Cloud deployment recipe configured as a static project (`publicDir: "public"`) so the builder uploads `smart-video-app.js` and the lifecycle hook endpoints to `https://smart-video-app.webflow.io`.
- `webflow.json` – Cloud builder manifest (and `.webflow/webflow.json` mirror) that declares the project metadata plus a `cosmic.framework: "astro"` hint so Webflow Cloud treats the app as an Astro project. Astro only exists as a lightweight wrapper in `astro.config.mjs`; all real assets still come from `/public`.
- `package.json` – lightweight manifest so Webflow Cloud's build step always finds a Node project even though no npm build is required.
- `functions/` – Cloud functions that respond to install/uninstall events and call the Custom Code API.

## Hosting on Webflow Cloud
1. Authenticate the [Webflow Cloud CLI](https://developers.webflow.com/data/cloud) for the `smart-video-app` project. When you create or recreate the project, choose **Webflow App** (not Site) so Cloud uses `cloud.config.json` instead of scanning for Designer assets.
   ```sh
   webflow cloud project create smart-video-app --type app
   ```
2. Deploy the static asset + functions: `webflow cloud deploy -c ./cloud.config.json`.
   - The deploy publishes `public/smart-video-app.js` to `https://smart-video-app.webflow.io/smart-video-app.js` with long-term caching.
   - `/hooks/app-install`, `/hooks/app-uninstall`, `/hooks/site-install`, and `/hooks/site-uninstall` become HTTPS endpoints backed by the code in `functions/`.
3. Verify the script URL loads in the browser and that each hook responds with JSON `{"ok": true}` when POSTed locally (Webflow will send signed requests in production).

## App manifest + OAuth
1. Open `manifest.json` and confirm the metadata you want the Marketplace listing to show (name, icon, description, etc.).
2. Replace the `clientSecret` placeholder with an environment value before uploading the manifest (never commit the raw secret).
3. Upload/update the manifest inside the Webflow App Dashboard. The OAuth block uses the Data client credentials you already provisioned (`clientId`/`redirectUri` shown in the screenshot) and requests the scopes required for the Custom Code API.

## Lifecycle automation
- **`functions/site-install.js`** runs when a site owner installs the app. It extracts the site-scoped access token Webflow passes to lifecycle hooks, loads the site's current custom code, and appends `<script src="https://smart-video-app.webflow.io/smart-video-app.js" data-cltd-smart-video defer></script>` to the **Before </body>** section. That code only executes on published sites, so the Designer canvas stays untouched.
- **`functions/site-uninstall.js`** removes the same snippet if the site disconnects the app.
- The app-level hooks simply acknowledge install/uninstall events so Webflow can complete the process.

Because the script lives in the global custom code area, every existing and future page inherits the behavior automatically—even CMS generated pages—without asking designers to paste a per-page snippet.

## Using `.cltd-lazy-video` inside Webflow
Once the app is installed on a site, designers continue to build exactly as before:

1. **Add CMS fields** (Plain Text for the video ID + optional Image if you want a custom poster frame).
2. **Drop an Embed block** wherever the video should render and paste:

```html
<div
  class="cltd-lazy-video"
  data-cltd-type="youtube"
  data-cltd-id="{{wf {&quot;path&quot;:&quot;youtube-video-id&quot;,&quot;type&quot;:&quot;PlainText&quot;} }}"
>
  <!-- Optional custom thumbnail -->
  <!-- <img src="https://assets.example.com/my-thumbnail.jpg" alt="Video thumbnail" loading="lazy" /> -->

  <!-- Optional overlay / play button -->
  <button class="play-btn">▶</button>
</div>
```

3. Swap `data-cltd-type="vimeo"` (and bind to your Vimeo ID field) when needed.
4. Style `.cltd-lazy-video` and any overlays directly in Webflow Designer—Smart Video only handles the lazy-loading logic.

## How the script behaves
- Waits for DOMContentLoaded, finds every `.cltd-lazy-video`, and guarantees a thumbnail exists.
- Pulls thumbnails from YouTube (HQ default) or Vimeo (via their JSON API) unless you supplied your own `<img alt="Video thumbnail">`.
- Replaces the node with a cookie-safe iframe (`youtube-nocookie.com` or `player.vimeo.com`) only when clicked.
- Guards against double-initialization via `window.__cltdSmartVideoInitialized`.

## Need to verify locally?
- `smart-video-app.js` can still be referenced directly inside Webflow (or any HTML file) if you want to test outside of the Marketplace install flow.
- Use the lifecycle hooks with a tool like `curl` or `httpie` to simulate Webflow's payload and confirm the Custom Code API calls succeed before submitting the app for review.
