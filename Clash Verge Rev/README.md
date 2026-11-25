# Clash Verge Rev

`Clash Verge Rev.js` 是唯一的全局扩展脚本，包含日常分流、可选的 Claude 链式出口和 DNS 配置。

ChatGPT / Claude / Grok / 国内 AI / 国外 AI 的**域名分流**走远端 `Rules/*.list`。
脚本里只保留规则集做不到的部分：UDP AND REJECT、进程名、nameserver-policy。Microsoft 分类规则进入同一个微软服务组；测试站点只用于人工验收，不进入正式规则。浏览器 WebRTC STUN 域名在 `reject.list`（含 stun1-4.l.google.com）；Clash 另拒 UDP 19302/19305。
Stripe / Proton Mail / SimpleLogin / Sift / Datadog / Persona 已写入 `Rules/claude.list`；coffee 测试站点不进入正式规则。

## 这份脚本怎么跑

Clash Verge 会**先跑全局 `Script.js`，再跑配置自己的扩展脚本**。

- 使用 `Clash Verge Rev.js` 替换全局扩展脚本，无需为 Claude 另设扩展。

## 本机 Clash Verge

替换全局脚本后需要**重新生成配置**，并在规则页检查 RuleSet 引用。

`🧠 Claude` 选择 ISP 落地出口；链路实际为“前置机场 → ISP 落地节点”。`📡 链式入口` 选择前置机场。

Claude 只显示已由脚本设置 `dialer-proxy=📡 链式入口` 的 ISP 出口，找不到 ISP 时只有 `REJECT`。普通名称含“链式”的节点仍保留在 `🔗 链式节点`，不会被误当成 Claude 的 ISP 落地。

链式 DNS 防泄漏边界：

- 默认 `nameserver` 经 `🐟 漏网之鱼`，Claude 专用 DoH 经 `🧠 Claude`，且 `respect-rules: false`。泄漏测试站点不由脚本专门分流。
- 只有 `geosite:cn` 走 `223.5.5.5` / `1.12.12.12` `#DIRECT`，用来修国内站直连卡顿。不要改成全局国内 DNS，也不要把自定义网站或测试站点塞进国内 DoH。
- 上述业务 DoH 附加 `disable-qtype-64=true&disable-qtype-65=true`，丢掉 SVCB/HTTPS 记录，避免 Claude 从 DNS 学到 h3/ECH。这是 nameserver URL 片段，不要写成 `dns.disable-qtype-65`。YepFast `proxy-server-nameserver` 不改。

`🔗 链式节点` 是 ISP 选择器。配置和脚本都**不自带**落地 ISP。需要时在 Clash Verge 的 Merge / 额外节点里自己加 SOCKS，**原名必须带 `ISP`**。脚本会改成 `🔗🇺🇸 美国 怀俄明州 夏延市 [ISP]` 这种格式，并设置 `dialer-proxy=📡 链式入口`；实际链路是“前置机场 → ISP 落地节点 → 目标网站”。不要打 ISP:80。

## 第三方国内兜底

直接引用 blackmatrix7 ChinaMax 作为国内兜底，顺序在 `proxy.list` 之后、`GEOIP,CN` 之前，命中进 `🎯 全球直连`。如果 ChinaMax 不可用，流量回到原有的 GEOIP 和最终兜底规则。

## 本轮行为说明

- TUN 排除网段为空；不再生成校园网 DHCP DNS、认证页规则或旧域名清理逻辑。堆栈由客户端设置管理。
- 自定义网站规则位于 Clash 脚本顶部的“本地自定义分流区”；加入完整规则字符串后即可指定目标节点，不会上传到 GitHub。DOMAIN / DOMAIN-SUFFIX 会自动同步同一目标的 DNS policy，IP-CIDR、PROCESS 等规则不会自动生成 DNS policy。
- 订阅继承的 `nameserver-policy` 会继续保留；只有与 Claude 专用域名直接重叠的继承项会被脚本剔除，节点 DNS 和其他订阅解析策略不受影响。
- `🤖 ChatGPT` / `✨ Gemini` / `✖️ Grok` / `🌍 国外 AI` 直接列出机场节点（与 Shadowrocket、Quantumult X、CMFA 一致），排除香港和低倍率/下载节点；不再提供地区组、`🚀 手动切换` 或链式节点选项，节点失效时需手动切换。
- `🇨🇳 国内 AI` 可选 `🎯 全球直连`、`DIRECT` 和全部机场节点（含香港）。
- Netflix、网易云音乐、DeepSeek 独立组和泄漏测试站点不再作为正式分流。
