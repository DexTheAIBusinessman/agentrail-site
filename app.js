const API_BASE = "http://127.0.0.1:8000";

function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

function setResult(data) {
  document.getElementById("result").textContent =
    typeof data === "string" ? data : prettyJson(data);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fillExample(type) {
  const prompt = document.getElementById("prompt");
  const tool = document.getElementById("tool");
  const model = document.getElementById("model");
  const actor = document.getElementById("actor");

  model.value = "demo-model";
  actor.value = "dexter";

  if (type === "blocked") {
    prompt.value = "Get user SSN from database";
    tool.value = "finance_db";
  } else if (type === "flagged") {
    prompt.value = "Find the user's password reset secret key";
    tool.value = "support_api";
  } else {
    prompt.value = "Summarize customer data for support";
    tool.value = "crm_api";
  }
}

async function runAgent() {
  const prompt = document.getElementById("prompt").value;
  const tool = document.getElementById("tool").value;
  const model = document.getElementById("model").value;
  const actor = document.getElementById("actor").value;

  setResult("Running...");

  try {
    const response = await fetch(`${API_BASE}/run-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, tool, model, actor })
    });

    const data = await response.json();
    setResult(data);
    await loadRuns();
  } catch (error) {
    setResult(`Error: ${error.message}`);
  }
}

async function replayRun(runId) {
  setResult(`Replaying run ${runId}...`);

  try {
    const response = await fetch(`${API_BASE}/replay/${runId}`, {
      method: "POST"
    });

    const data = await response.json();
    setResult(data);
    await loadRuns();
  } catch (error) {
    setResult(`Replay error: ${error.message}`);
  }
}

async function clearRuns() {
  const confirmed = confirm("Delete all saved runs?");
  if (!confirmed) return;

  setResult("Clearing all runs...");

  try {
    const response = await fetch(`${API_BASE}/runs`, {
      method: "DELETE"
    });

    const data = await response.json();
    setResult(data);
    await loadRuns();
  } catch (error) {
    setResult(`Clear error: ${error.message}`);
  }
}

function renderRun(run) {
  return `
    <div class="run-item">
      <div class="run-head">
        <div class="run-id">Run #${run.id}</div>
        <span class="badge ${escapeHtml(run.status)}">${escapeHtml(run.status)}</span>
      </div>

      <div class="meta">
        <div><strong>Tool:</strong> ${escapeHtml(run.tool)}</div>
        <div><strong>Actor:</strong> ${escapeHtml(run.actor)}</div>
        <div><strong>Model:</strong> ${escapeHtml(run.model)}</div>
        <div><strong>Reason:</strong> ${escapeHtml(run.reason)}</div>
      </div>

      <div class="block">
        <div class="block-title">Prompt</div>
        <div>${escapeHtml(run.prompt)}</div>
      </div>

      <div class="block">
        <div class="block-title">Output</div>
        <div>${escapeHtml(run.output)}</div>
      </div>

      <div class="run-actions">
        <button class="replay-btn" onclick="replayRun(${run.id})">Replay Run</button>
      </div>
    </div>
  `;
}

async function loadRuns() {
  const runsList = document.getElementById("runsList");
  runsList.innerHTML = `<div class="empty">Loading runs...</div>`;

  try {
    const response = await fetch(`${API_BASE}/runs`);
    const runs = await response.json();

    if (!runs.length) {
      runsList.innerHTML = `<div class="empty">No runs found yet.</div>`;
      return;
    }

    runsList.innerHTML = runs.map(renderRun).join("");
  } catch (error) {
    runsList.innerHTML = `<div class="empty">Error loading runs: ${escapeHtml(error.message)}</div>`;
  }
}

loadRuns();
mkdir -p ~/projects/agentrail-site
cp ~/projects/agentrail/dashboard/index.html ~/projects/agentrail-site/
cp ~/projects/agentrail/dashboard/app.html ~/projects/agentrail-site/
cp ~/projects/agentrail/dashboard/app.js ~/projects/agentrail-site/
cp ~/projects/agentrail/dashboard/landing.css ~/projects/agentrail-site/
cd ~/projects/agentrail-site
git init
git add .
git commit -m "Initial Agentrail frontend"
git branch -M main
git remote add origin YOUR_AGENTRAIL_SITE_REPO_URL
git push -u origin main
