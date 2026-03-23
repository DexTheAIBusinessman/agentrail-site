const API_BASE = "https://agentrail-api.onrender.com";

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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
}

async function runAgent() {
  const prompt = document.getElementById("prompt").value;
  const tool = document.getElementById("tool").value;
  const model = document.getElementById("model").value;
  const actor = document.getElementById("actor").value;

  setResult("Running...");

  try {
    const data = await fetchJson(`${API_BASE}/run-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, tool, model, actor })
    });

    setResult(data);
    await loadRuns();
  } catch (error) {
    setResult(`Run error: ${error.message}`);
  }
}

async function replayRun(runId) {
  setResult(`Replaying run ${runId}...`);

  try {
    const data = await fetchJson(`${API_BASE}/replay/${runId}`, {
      method: "POST"
    });

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
    const data = await fetchJson(`${API_BASE}/runs`, {
      method: "DELETE"
    });

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
    const runs = await fetchJson(`${API_BASE}/runs`);

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
