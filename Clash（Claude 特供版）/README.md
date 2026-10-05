# Clash（Claude 特供版）

在原来的 Clash 全局脚本之外**新建**的 Claude 特供版，不覆盖：

- Clash Verge 正在用的 `profiles/Script.js`
- 仓库里的 `Clash Verge Rev/Clash Verge Rev Global Extend Script v3.js`

ChatGPT / Claude / Grok / DeepSeek 的**域名分流**走远端 `Rules/*.list`。
脚本里只保留规则集做不到的部分：UDP AND REJECT、进程名、nameserver-policy、校园认证。商店 / 泄漏测试 / 硬 REJECT 已进远端 RULE-SET。
Stripe / Proton Mail / SimpleLogin / Sift / Datadog / coffee / Persona 已写入 `Rules/claude.list`。

## 这份脚本怎么跑

Clash Verge 会**先跑全局 `Script.js`，再跑配置自己的扩展脚本**。

- 如果全局脚本已经生成了 `🧠 Claude`（`RULE-SET,Claude` 或旧的 `DOMAIN-SUFFIX,anthropic.com`）：本文件只补 UDP / Proton 进程 / DNS，不再插域名分流。
- 如果全局脚本是空模板：本文件会完整增强，域名仍走 RULE-SET。

## 本机 Clash Verge

链式代理正在用的 `profiles/Script.js` 以桌面目录的 `Clash Verge Rev 链式代理.js` 为准。改完后需要**重新生成配置**，规则页才会收成 RuleSet，而不是几十条 DomainSuffix。

`🧠 Claude` 锁 **🔗 链式前置**。`🔗 落地 ISP` 只用来手动选 ISP。

链式 DNS 防泄漏边界：

- 默认 `nameserver` 仍是 `1.1.1.1` / `8.8.8.8` `#🔗 链式前置`，且 `respect-rules: false`。Claude、境外站、泄漏测试不会回落到本地/国内 DNS。
- 只有 `geosite:cn` 走 `223.5.5.5` / `1.12.12.12` `#DIRECT`，用来修国内站直连卡顿。不要改成全局国内 DNS，也不要把 `DirectGroup` 塞进国内 DoH。

`🔗 落地 ISP` 是 ISP 选择器，以后多买就往脚本顶部的 `landingIsps` 加。当前 mihomo 已删除 `relay`，改成给每个机场节点克隆一份落地 SOCKS（`↪ 节点名`，`dialer-proxy=该节点`），`🔗 链式前置` 对这些克隆做 url-test（`tolerance: 0`，选当前最低延迟），测 **本机→机场→该 ISP→网页**。不要打 ISP:80。多个 ISP 时会生成「链式前置 · ISP」测速组。Claude / 泄漏测试 / 默认 DoH 走链式前置。也已去掉 `global-client-fingerprint`，改在节点上写 `client-fingerprint`。

## 文件

- `Clash Verge Rev 链式代理.js`
- `Clash Verge Rev Global Extend Script Claude 特供版.js`
