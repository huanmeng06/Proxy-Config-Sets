# Proxy-Config-Sets

自用代理配置与远程分流规则集，维护 Quantumult X、Shadowrocket 与 Clash Verge Rev 三端配置。

本仓库的核心目标是：**三端共用同一批远程分流规则，策略组仍按各客户端特性手动维护**。这样日常维护时，大多数改动只需要更新 `Rules/*.list` 或 `manifest/rules.json`，不用在三端配置里重复改同一件事。

## 目录说明

- `Rules/`：三端共用的远程分流规则。规则文件只写规则本体，不写最终策略组。
- `Quantumult X/`：Quantumult X 主配置和资源解析器。
- `Shadowrocket/`：Shadowrocket 主配置。
- `Clash Verge Rev/`：Clash Verge Rev 全局扩展脚本。
- `manifest/rules.json`：三端远程规则引用的统一清单。
- `scripts/generate-rule-refs.js`：根据 `manifest/rules.json` 自动生成三端远程规则引用区。

## Raw 路径

GitHub Raw 路径大小写敏感，本仓库规则目录使用 `Rules/`：

```text
https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules/github.list
```

## 规则文件

当前公共规则位于 `Rules/`：

```text
ads.list                 ai.list
app-clean.list           apple.list
bahamut.list             bilibili.list
direct.list              domestic-media.list
games.list               github.list
global-media.list        google-fcm.list
microsoft.list           microsoft-bing.list
microsoft-drive.list     netease-music.list
netflix.list             proxy.list
telegram.list            youtube.list
```

公共规则建议只使用三端兼容格式：

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

提交并推送后，三端下次更新远程规则即可生效。

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
Quantumult X/Quantumult X Config v2.conf
; BEGIN GENERATED RULES
; END GENERATED RULES

Shadowrocket/Shadowrocket Config v2.conf
# BEGIN GENERATED RULES
# END GENERATED RULES

Clash Verge Rev/Clash Verge Rev Global Extend Script v3.js
// BEGIN GENERATED RULE PROVIDERS
// END GENERATED RULE PROVIDERS
```

不要手改 block 中间的内容，下次生成会覆盖。

策略组、手动规则、`GEOIP`、`FINAL`、`MATCH` 仍然手写维护。

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
node --check "Clash Verge Rev/Clash Verge Rev Global Extend Script v3.js"
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
