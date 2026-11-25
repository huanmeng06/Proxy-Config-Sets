# Proxy-Config-Sets

自用代理配置与远程分流规则集，维护 Quantumult X、Shadowrocket、Clash Verge Rev 和 Clash Meta for Android 四端配置。

本仓库的核心目标是：**四端共用同一批远程分流规则，策略组仍按各客户端特性手动维护**。大多数分流规则改动只需更新 `Rules/*.list`。

## 目录说明

- `Rules/`：四端共用的远程分流规则。规则文件只写规则本体，不写最终策略组。
- `Quantumult X/Quantumult X.conf`：主配置，配套资源解析器为 `Quantumult X Resource Parser.js`。
- `Shadowrocket/Shadowrocket.conf`：公开配置，可在 App 内为私有 ISP 设置代理通过。
- `Clash Verge Rev/Clash Verge Rev.js`：全局扩展脚本，支持可选的 Claude 链式出口。
- `Clash Meta for Android/Clash Meta for Android.yaml`：公开 YAML，私有 ISP 可通过 `dialer-proxy` 共用 `📡 链式入口`。
- `manifest/rules.json`：三端远程规则引用的统一清单。
- `scripts/generate-rule-refs.js`：根据 `manifest/rules.json` 自动生成三端远程规则引用区。

旧配置链接随旧文件移除后不能再更新。请按 Shadowrocket、Clash Verge Rev、Clash Meta for Android、Quantumult X 的顺序切换到新文件；私有节点和订阅仍只保存在设备上。

## Raw 路径

GitHub Raw 路径大小写敏感，本仓库规则目录使用 `Rules/`：

```text
https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules/github.list
```

## 规则文件

当前公共规则位于 `Rules/`：

```text
ads.list                 ai-domestic.list
ai-foreign.list          app-clean.list
apple.list               bahamut.list
bilibili.list            chatgpt.list
claude.list              domestic-media.list
games.list               gemini.list
github.list              global-media.list
google-fcm.list          grok.list
microsoft-bing.list      microsoft-drive.list
microsoft-store.list     microsoft.list
proxy.list               reject.list
telegram.list            youtube.list
direct.list
```

兼容说明：仓库仍保留旧版 `ai.list`、`deepseek.list`、`netflix.list`、`netease-music.list`、`leak.list`，仅供历史配置读取；它们不在当前 `manifest/rules.json`，也不会进入当前生成的三端配置。

`claude.list` 现在包含 Anthropic 核心域，以及必须同出口的 Stripe / Proton Mail / SimpleLogin / Sift / Datadog / Persona；coffee 测试站点不进入正式分流。Clash 脚本通过 RULE-SET 分流这些域。`chatgpt.list` 含 `codexradar.com`。不要把 `protonvpn.com` 写进 Claude。 微软商店规则仍保留在 `microsoft-store.list`，但用户可见策略统一为 `Ⓜ️ 微软服务`；测试站点不进入正式规则，硬 REJECT 使用 `reject.list`。`deepl.com` / `ping0.cc` / `tjcn.org` 仍写在客户端内联直连。UDP AND、进程名、校园认证仍写在客户端。

公共规则建议只使用四端兼容格式：

```text
DOMAIN,example.com
DOMAIN-SUFFIX,example.com
DOMAIN-KEYWORD,example
IP-CIDR,1.2.3.0/24,no-resolve
```

不建议放入公共规则：

```text
IP-CIDR6 / IP6-CIDR / PROCESS-NAME / URL-REGEX / RULE-SET / FINAL / MATCH / SCRIPT
```

## 怎么维护

### 自定义网站

Clash 自定义规则只写在脚本顶部的“本地自定义分流区”，格式为 `DOMAIN-SUFFIX,example.com,🇺🇸 美国节点`。这些规则只保存在本机脚本，不进入 GitHub 规则集。

### 只新增一条规则

只改对应的 `Rules/*.list`，不用改 manifest，也不用跑生成脚本。

例如给 GitHub 加一条：

```text
Rules/github.list
```

加入：

```text
DOMAIN-SUFFIX,example.github-domain.com
```

提交并推送后，四端下次更新远程规则即可生效。

### 新增一个分流文件

比如新增：

```text
Rules/download.list
```

先写规则：

```text
DOMAIN-SUFFIX,example-download.com
DOMAIN-KEYWORD,download-example
```

再编辑 `manifest/rules.json`，加入类似内容：

```json
{
  "id": "download",
  "file": "download.list",
  "policy": {
    "quantumultX": "⏬ 下载专用",
    "shadowrocket": "⏬ 下载专用"
  },
  "clashProviders": [
    "Download"
  ]
}
```

然后生成三端引用：

```bash
node scripts/generate-rule-refs.js
```

如果本机 `node` 被拒绝，可以用 Codex bundled Node：

```powershell
& 'C:\Users\Huan_meeng\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\generate-rule-refs.js
```

### 修改策略归属

如果要把某个 list 指向别的策略组，改 `manifest/rules.json` 里的：

```json
"policy": {
  "quantumultX": "🐙 GITHUB",
  "shadowrocket": "🐙 GITHUB"
}
```

改完运行：

```bash
node scripts/generate-rule-refs.js
```

### 修改 Clash provider

Clash 的 provider 名称在 `clashProviders`：

```json
"clashProviders": [
  "Epic",
  "Origin",
  "Steam"
]
```

同一个 `Rules/*.list` 可以对应多个 Clash provider。

## generated block

生成脚本只会替换这些区域：

```text
Quantumult X/Quantumult X.conf
; BEGIN GENERATED RULES
; END GENERATED RULES

Shadowrocket/Shadowrocket.conf
# BEGIN GENERATED RULES
# END GENERATED RULES

Clash Verge Rev/Clash Verge Rev.js
// BEGIN GENERATED RULE PROVIDERS
// END GENERATED RULE PROVIDERS
```

不要手改 block 中间的内容，下次生成会覆盖。

策略组、手动规则、`GEOIP`、`FINAL`、`MATCH` 仍然手写维护。

## DNS 防泄露

各端使用原生 DNS 选项，不直接复制彼此的字段。Clash 自定义网站规则只维护在本机脚本顶部的“本地自定义分流区”：

- Clash Verge Rev：`fake-ip`、TUN DNS 劫持、国内直连 DoH、境外代理 DoH，并关闭 IPv6。
- Quantumult X：`no-system`、`no-ipv6` 与 IP 形式的 DoH 端点。
- Shadowrocket：保留系统 DNS 回退与校园网例外；代理 DNS 使用 DoH，并关闭 IPv6。

Clash Verge Rev 需要开启 TUN 模式；同时不要把 `🚀 节点选择` 设为 `DIRECT`，否则境外 DoH 不会经过代理。

## 常用检查

检查旧路径：

```bash
rg "main/rules|refs/heads/main/rules"
```

检查旧 ACL4SSR 引用：

```bash
rg "ACL4SSR|raw.githubusercontent.com/ACL4SSR"
```

检查公共规则是否混入不推荐格式：

```bash
rg "^(IP-CIDR6|IP6-CIDR|PROCESS-NAME|URL-REGEX|RULE-SET|FINAL|MATCH|SCRIPT)," Rules
```

检查脚本语法：

```bash
node --check scripts/generate-rule-refs.js
node --check "Clash Verge Rev/Clash Verge Rev.js"
```

查看改动：

```bash
git status -sb
git diff --stat
```

## 安全提醒

提交前确认不要包含：

```text
机场订阅 URL
私有节点
token / cookie
MITM ca-p12
MITM ca-passphrase
私有 hostname
```
