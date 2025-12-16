import fs from "fs";
import path from "path";

function log(label, value) {
  console.log(`[DEBUG] ${label}:`, value);
}

const cwd = process.cwd();
log("process.cwd()", cwd);

const rootFiles = fs.readdirSync(cwd);
log("root files", rootFiles);

const wfPath = path.join(cwd, "webflow.json");
log("webflow.json exists", fs.existsSync(wfPath));

if (fs.existsSync(wfPath)) {
  try {
    const raw = fs.readFileSync(wfPath, "utf8");
    log("webflow.json raw", raw);

    const parsed = JSON.parse(raw);
    log("webflow.json parsed", parsed);
    log("cosmic.framework", parsed?.cosmic?.framework);
  } catch (e) {
    console.error("[DEBUG] webflow.json parse error", e);
  }
} else {
  console.error("[DEBUG] webflow.json NOT FOUND at", wfPath);
}
