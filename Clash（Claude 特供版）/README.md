# Clash（Claude 特供版）

在原来的 Clash 全局脚本之外**新建**的 Claude 特供版，不覆盖：

- Clash Verge 正在用的 `profiles/Script.js`
- 仓库里的 `Clash Verge Rev/Clash Verge Rev Global Extend Script v3.js`

ChatGPT / Claude / Grok / DeepSeek 的**域名分流**走远端 `Rules/*.list`。
脚本里只保留规则集做不到的部分：UDP AND REJECT、进程名、nameserver-policy。
Stripe / Proton Mail / SimpleLogin / Sift / Datadog / coffee / Persona 已写入 `Rules/claude.list`。

## 这份脚本怎么跑

Clash Verge 会**先跑全局 `Script.js`，再跑配置自己的扩展脚本**。

- 如果全局脚本已经生成了 `🧠 Claude`（`RULE-SET,Claude` 或旧的 `DOMAIN-SUFFIX,anthropic.com`）：本文件只补 UDP / Proton 进程 / DNS，不再插域名分流。
- 如果全局脚本是空模板：本文件会完整增强，域名仍走 RULE-SET。

## 本机 Clash Verge

链式代理正在用的 `profiles/Script.js` 以桌面目录的 `Clash Verge Rev 链式代理.js` 为准。改完后需要**重新生成配置**，规则页才会收成 RuleSet，而不是几十条 DomainSuffix。

`🧠 Claude` 仍选 **美国 05** / 链式落地。

## 文件

- `Clash Verge Rev 链式代理.js`
- `Clash Verge Rev Global Extend Script Claude 特供版.js`
