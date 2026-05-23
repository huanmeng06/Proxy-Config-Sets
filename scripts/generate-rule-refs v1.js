const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "manifest", "rules.json");
const qxConfigPath = path.join(root, "Quantumult X", "Quantumult X Config v2.conf");
const shadowrocketConfigPath = path.join(root, "Shadowrocket", "Shadowrocket Config v2.conf");
const clashScriptPath = path.join(root, "Clash Verge Rev", "Clash Verge Rev Global Extend Script v2.js");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const allRules = manifest.sections.flatMap((section) =>
  section.rules.map((rule) => ({ ...rule, section: section.name }))
);

function assertLocalRulesExist() {
  const missing = allRules
    .map((rule) => path.join(root, manifest.localRulesDir, rule.file))
    .filter((file) => !fs.existsSync(file));

  if (missing.length > 0) {
    throw new Error(`Missing local rule files:\n${missing.join("\n")}`);
  }
}

function replaceBlock(content, startMarker, endMarker, generatedContent) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Generated block markers not found: ${startMarker} ... ${endMarker}`);
  }

  const before = content.slice(0, start + startMarker.length);
  const after = content.slice(end);
  return `${before}\n${generatedContent}\n${after}`;
}

function buildQuantumultXBlock() {
  const interval = manifest.quantumultX.updateInterval;
  const optParser = manifest.quantumultX.optParser ? "true" : "false";
  const enabled = manifest.quantumultX.enabled ? "true" : "false";

  return manifest.sections
    .map((section) => {
      const lines = section.rules.map((rule) => {
        const tag = rule.tag || rule.id;
        return `${manifest.baseUrl}/${rule.file}, tag=${tag}, force-policy=${rule.policy.quantumultX}, update-interval=${interval}, opt-parser=${optParser}, enabled=${enabled}`;
      });
      return [`; ${section.name}`, ...lines].join("\n");
    })
    .join("\n\n");
}

function buildShadowrocketBlock() {
  return manifest.sections
    .map((section) => {
      const lines = section.rules.map((rule) =>
        `RULE-SET,${manifest.baseUrl}/${rule.file},${rule.policy.shadowrocket}`
      );
      return [`# ${section.name}`, ...lines].join("\n");
    })
    .join("\n\n");
}

function buildClashProviderBlock() {
  const entries = [];

  for (const rule of allRules) {
    for (const provider of rule.clashProviders || []) {
      entries.push({ provider, file: rule.file });
    }
  }

  return entries
    .map((entry, index) => {
      const comma = index === entries.length - 1 ? "" : ",";
      return `    "${entry.provider}": \`${"${RULES_BASE}"}/${entry.file}\`${comma}`;
    })
    .join("\n");
}

function updateFile(file, updater) {
  const original = fs.readFileSync(file, "utf8");
  const next = updater(original);
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
  }
}

assertLocalRulesExist();

updateFile(qxConfigPath, (content) =>
  replaceBlock(
    content,
    "; BEGIN GENERATED RULES",
    "; END GENERATED RULES",
    buildQuantumultXBlock()
  )
);

updateFile(shadowrocketConfigPath, (content) =>
  replaceBlock(
    content,
    "# BEGIN GENERATED RULES",
    "# END GENERATED RULES",
    buildShadowrocketBlock()
  )
);

updateFile(clashScriptPath, (content) =>
  replaceBlock(
    content,
    "    // BEGIN GENERATED RULE PROVIDERS",
    "    // END GENERATED RULE PROVIDERS",
    buildClashProviderBlock()
  )
);

console.log("Generated rule references for Quantumult X, Shadowrocket, and Clash Verge Rev.");
