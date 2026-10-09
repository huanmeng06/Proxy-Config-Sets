// Compatibility extension for older Clash Verge profiles.
// The unified Clash script now owns all routing, DNS, AI, chain, and rule-provider logic.
// Keep this extension side-effect free when an older profile still references it.
function main(config) {
  return config;
}
