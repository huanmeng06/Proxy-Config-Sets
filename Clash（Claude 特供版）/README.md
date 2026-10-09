# Clash（Claude 特供版）

这是 Clash Verge Rev 的统一扩展脚本基线；仓库中的两个 Clash Verge 脚本都按同一套分流、链式和 DNS 逻辑维护。

ChatGPT / Claude / Grok / 国内 AI / 国外 AI 的**域名分流**走远端 `Rules/*.list`。
脚本里只保留规则集做不到的部分：UDP AND REJECT、进程名、nameserver-policy、校园认证。Microsoft 分类规则进入同一个微软服务组；测试站点只用于人工验收，不进入正式规则。浏览器 WebRTC STUN 域名在 `reject.list`（含 stun1-4.l.google.com）；Clash 另拒 UDP 19302/19305。
Stripe / Proton Mail / SimpleLogin / Sift / Datadog / Persona 已写入 `Rules/claude.list`；coffee 测试站点不进入正式规则。

## 这份脚本怎么跑

Clash Verge 会**先跑全局 `Script.js`，再跑配置自己的扩展脚本**。

- 如果全局脚本已经生成了 `🧠 Claude`（`RULE-SET,Claude` 或旧的 `DOMAIN-SUFFIX,anthropic.com`）：本文件只补 UDP / Proton 进程 / DNS，不再插域名分流。
- 如果全局脚本是空模板：本文件会完整增强，域名仍走 RULE-SET。

## 本机 Clash Verge

链式代理正在用的 `profiles/Script.js` 以桌面目录的 `Clash Verge Rev 链式代理.js` 为准。改完后需要**重新生成配置**，规则页才会收成 RuleSet，而不是几十条 DomainSuffix。

`🧠 Claude` 选择 ISP 落地出口；链路实际为“前置机场 → ISP 落地节点”。`📡 链式入口` 选择前置机场。

链式 DNS 防泄漏边界：

- 默认 `nameserver` 仍是 `1.1.1.1` / `8.8.8.8` `#🔗 链式节点`，且 `respect-rules: false`。Claude 和境外业务不会回落到本地/国内 DNS；泄漏测试站点不由脚本专门分流。
- 只有 `geosite:cn` 走 `223.5.5.5` / `1.12.12.12` `#DIRECT`，用来修国内站直连卡顿。不要改成全局国内 DNS，也不要把自定义网站或测试站点塞进国内 DoH。
- 上述 DoH（含校园 `udp://` / `dhcp://`）附加 `disable-qtype-64=true&disable-qtype-65=true`，丢掉 SVCB/HTTPS 记录，避免 Claude 从 DNS 学到 h3/ECH。这是 nameserver URL 片段，不要写成 `dns.disable-qtype-65`。YepFast `proxy-server-nameserver` 不改。

`🔗 链式节点` 是 ISP 选择器。配置和脚本都**不自带**落地 ISP。需要时在 Clash Verge 的 Merge / 额外节点里自己加 SOCKS，**原名必须带 `ISP`**。脚本会改成 `🔗🇺🇸 美国 怀俄明州 夏延市 [ISP]` 这种格式，并设置 `dialer-proxy=📡 链式入口`；实际链路是“前置机场 → ISP 落地节点 → 目标网站”。不要打 ISP:80。

## 文件

- `Clash Verge Rev 链式代理.js`


## 本轮行为说明

- 初次连接需要校园认证的 Wi-Fi 时，建议先关闭 TUN，完成认证后再开启；脚本中的 Captive Portal 规则只是 TUN 开启时的兜底。
- 自定义网站规则位于 Clash 脚本顶部的“本地自定义分流区”；加入完整规则字符串后即可指定目标节点，不会上传到 GitHub。
- 国内 AI 使用 `🇨🇳 国内 AI`，国外 AI 使用 `🌍 国外 AI`；国外 AI 不包含香港、DIRECT、手动机场或链式节点。
- Netflix、网易云音乐、DeepSeek 独立组和泄漏测试站点不再作为正式分流。
