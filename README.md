# Proxy-Config-Sets

自用代理配置与远程分流规则集，主要维护 Quantumult X、Shadowrocket 与 Clash Verge Rev 三端配置。

本仓库的核心目标是：**三端共用同一批远程分流规则，策略组仍按各客户端特性手动维护**。这样日常维护时，大多数改动只需要更新 `Rules/*.list` 或 `manifest/rules.json`，不用在三端配置里重复改同一件事。

## 仓库结构

```text
Proxy-Config-Sets/
├─ Rules/
│  ├─ ads.list
│  ├─ ai.list
│  ├─ github.list
│  └─ ...
├─ Quantumult X/
│  ├─ Quantumult X Config v2.conf
│  ├─ Quantumult X Resource Parser v2.js
│  └─ README.md
├─ Shadowrocket/
│  ├─ Shadowrocket Config v2.conf
│  └─ README.md
├─ Clash Verge Rev/
│  └─ Clash Verge Rev Global Extend Script v2.js
├─ manifest/
│  └─ rules.json
├─ scripts/
│  └─ generate-rule-refs.js
├─ README.md
└─ LICENSE
```

## 目录说明

- `Rules/`：三端共用的远程分流规则。规则文件只写规则本体，不写最终策略组。
- `Quantumult X/`：Quantumult X 主配置和资源解析器。
- `Shadowrocket/`：Shadowrocket 主配置。
- `Clash Verge Rev/`：Clash Verge Rev 全局扩展脚本。
- `manifest/rules.json`：三端远程规则引用的统一清单。
- `scripts/generate-rule-refs.js`：根据 `manifest/rules.json` 自动生成三端远程规则引用区。

## 当前规则文件

当前 `Rules/` 下维护这些公共规则：

```text
ads.list
ai.list
app-clean.list
apple.list
bahamut.list
bilibili.list
direct.list
domestic-media.list
games.list
github.list
global-media.list
google-fcm.list
microsoft.list
microsoft-bing.list
microsoft-drive.list
netease-music.list
netflix.list
proxy.list
telegram.list
youtube.list
```

GitHub Raw 路径大小写敏感，本仓库使用 `Rules/`：

```text
https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules/github.list
```

## 维护原则

- 大批量分流规则统一放在 `Rules/*.list`。
- 三端远程规则引用由 `manifest/rules.json` 生成。
- 策略组本身仍然手写维护，例如 Quantumult X 的 `static=`、Shadowrocket 的 `policy`、Clash 的 `proxy-groups`。
- `GEOIP`、`FINAL`、`MATCH` 等兜底规则保留在主配置末尾，不放进 `Rules/*.list`。
- 不公开节点、订阅链接、token、证书、MITM `p12`、`passphrase` 或私有 hostname。
- `Rules/*.list` 尽量只使用三端共通规则类型，避免格式在某一端不可用。

## 支持的规则格式

为了保证 Quantumult X、Shadowrocket、Clash 三端都能稳定使用，公共规则文件优先使用：

```text
DOMAIN,example.com
DOMAIN-SUFFIX,example.com
DOMAIN-KEYWORD,example
IP-CIDR,1.2.3.0/24,no-resolve
```

不建议放入公共 `Rules/*.list` 的内容：

```text
IP-CIDR6,...
IP6-CIDR,...
PROCESS-NAME,...
URL-REGEX,...
RULE-SET,...
FINAL,...
MATCH,...
SCRIPT,...
```

如果某类规则只适合 Clash 或只适合移动端，建议保留在对应客户端配置里，不要放进公共规则文件。

## 最常见维护场景

### 只给已有分流加一条规则

这是最常见、也最简单的情况。

例如要给 GitHub 分流加一条域名规则，只需要编辑：

```text
Rules/github.list
```

加入：

```text
DOMAIN-SUFFIX,example.github-domain.com
```

然后提交并推送即可。三端已经都引用远程 `Rules/github.list`，客户端下次更新远程规则时会自动生效。

这种情况不需要改 `manifest/rules.json`，也不需要运行生成脚本。

### 新增一个规则文件

假设要新增下载专用规则：

```text
Rules/download.list
```

先创建规则文件，例如：

```text
DOMAIN-SUFFIX,example-download.com
DOMAIN-KEYWORD,download-example
```

然后编辑：

```text
manifest/rules.json
```

在合适的 section 下加入一项：

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

再运行生成脚本：

```bash
node scripts/generate-rule-refs.js
```

脚本会自动更新三端配置里的 generated block。

### 修改某个规则对应的策略组

如果只是修改规则内容，改 `Rules/*.list` 即可。

如果要修改规则文件对应的策略组，例如把 `github.list` 从 `🐙 GITHUB` 改成其他策略，就需要编辑 `manifest/rules.json`：

```json
"policy": {
  "quantumultX": "🐙 GITHUB",
  "shadowrocket": "🐙 GITHUB"
}
```

改完后运行：

```bash
node scripts/generate-rule-refs.js
```

### 修改 Clash provider 映射

Clash 的 provider 名称由 `clashProviders` 控制。例如：

```json
{
  "id": "games",
  "file": "games.list",
  "clashProviders": [
    "Epic",
    "Origin",
    "Sony",
    "Steam",
    "Nintendo"
  ]
}
```

这表示 Clash 里的这些 provider 都会指向：

```text
Rules/games.list
```

如果新增 provider，修改 `clashProviders` 后运行生成脚本即可。

## manifest 字段说明

`manifest/rules.json` 顶层字段：

```json
{
  "baseUrl": "https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules",
  "localRulesDir": "Rules",
  "quantumultX": {
    "updateInterval": 172800,
    "optParser": true,
    "enabled": true
  },
  "clash": {
    "providerPathPrefix": "./rulesets/Proxy-Config-Sets"
  },
  "sections": []
}
```

字段含义：

- `baseUrl`：远程规则 Raw 基础路径。
- `localRulesDir`：本地规则目录，用于生成前检查文件是否存在。
- `quantumultX.updateInterval`：QX 远程规则更新间隔。
- `quantumultX.optParser`：QX 是否启用资源解析器。
- `quantumultX.enabled`：QX 远程规则默认是否启用。
- `clash.providerPathPrefix`：Clash rule-provider 本地缓存路径前缀。
- `sections`：规则分组，主要影响生成后的阅读顺序和注释。

单个规则项示例：

```json
{
  "id": "github",
  "tag": "GitHub",
  "file": "github.list",
  "policy": {
    "quantumultX": "🐙 GITHUB",
    "shadowrocket": "🐙 GITHUB"
  },
  "clashProviders": [
    "GitHub"
  ]
}
```

字段含义：

- `id`：规则的内部标识，也会作为 QX 默认 tag。
- `tag`：可选。指定 QX 的 `tag=`，例如 GitHub 需要大写显示。
- `file`：对应 `Rules/` 下的规则文件名。
- `policy.quantumultX`：QX 的 `force-policy`。
- `policy.shadowrocket`：Shadowrocket 的 `RULE-SET` 策略。
- `clashProviders`：Clash 中要生成的 provider 名称，一个规则文件可以对应多个 provider。

## 生成脚本

运行：

```bash
node scripts/generate-rule-refs.js
```

如果当前系统直接运行 `node` 被拒绝，可以使用 Codex bundled Node：

```powershell
& 'C:\Users\Huan_meeng\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\generate-rule-refs.js
```

脚本会替换这些区域：

```text
Quantumult X/Quantumult X Config v2.conf
; BEGIN GENERATED RULES
; END GENERATED RULES

Shadowrocket/Shadowrocket Config v2.conf
# BEGIN GENERATED RULES
# END GENERATED RULES

Clash Verge Rev/Clash Verge Rev Global Extend Script v2.js
// BEGIN GENERATED RULE PROVIDERS
// END GENERATED RULE PROVIDERS
```

不要手动修改 generated block 中间的内容，因为下次运行脚本会覆盖。

## 三端配置分工

### Quantumult X

远程规则引用位于：

```text
Quantumult X/Quantumult X Config v2.conf
[filter_remote]
```

generated block 只维护仓库内 `Rules/*.list` 的远程引用。

策略组仍然手写维护，例如：

```text
static=🐙 GITHUB, ...
static=💬 Ai平台, ...
```

### Shadowrocket

远程规则引用位于：

```text
Shadowrocket/Shadowrocket Config v2.conf
# --- 3. GitHub Rules ---
```

generated block 只维护 `RULE-SET` 引用。

策略组、手动规则、`GEOIP` 和 `FINAL` 仍然手写维护。

### Clash Verge Rev

远程规则 provider 位于：

```text
Clash Verge Rev/Clash Verge Rev Global Extend Script v2.js
const ruleProviderUrls = { ... }
```

generated block 只维护 provider 到 `Rules/*.list` 的 URL 映射。

`proxy-groups`、内置手动规则、`GEOIP`、`MATCH` 仍然手写维护。

## 维护流程建议

### 日常添加规则

1. 找到对应文件，例如 `Rules/github.list`。
2. 加入规则。
3. 检查格式是否属于公共规则格式。
4. 提交并推送。

### 新增分流分类

1. 新建 `Rules/new-category.list`。
2. 在 `manifest/rules.json` 添加规则项。
3. 如果需要新策略组，分别在三端配置里手写新增策略组。
4. 运行 `node scripts/generate-rule-refs.js`。
5. 检查生成 diff。
6. 提交并推送。

### 删除分流分类

1. 从 `manifest/rules.json` 删除对应规则项。
2. 删除或保留对应 `Rules/*.list`，按实际需要决定。
3. 如果三端策略组不再使用，手动删除策略组。
4. 运行生成脚本。
5. 检查 diff。

## 校验命令

检查是否还有旧的小写路径：

```bash
rg "main/rules|refs/heads/main/rules"
```

检查是否还有 ACL4SSR 旧 provider：

```bash
rg "ACL4SSR|raw.githubusercontent.com/ACL4SSR"
```

检查公共规则里是否混入不推荐格式：

```bash
rg "^(IP-CIDR6|IP6-CIDR|PROCESS-NAME|URL-REGEX|RULE-SET|FINAL|MATCH|SCRIPT)," Rules
```

检查 Clash 脚本语法：

```bash
node --check "Clash Verge Rev/Clash Verge Rev Global Extend Script v2.js"
```

检查生成脚本语法：

```bash
node --check scripts/generate-rule-refs.js
```

查看当前改动：

```bash
git status -sb
git diff --stat
```

## 常见问题

### 只加一条规则要不要跑生成脚本？

不用。

只要是给已有 `Rules/*.list` 增加规则，直接改对应 list 文件即可。

### 什么时候必须改 manifest？

这些情况需要改：

- 新增规则文件。
- 删除规则文件。
- 修改规则文件对应的策略组。
- 修改 Clash provider 到规则文件的映射。
- 调整三端远程规则引用顺序。

### 为什么策略组不自动生成？

策略组涉及节点筛选、地区组、手动选择、测速组、客户端差异和个人偏好，自动生成容易误伤已有配置。

当前阶段只自动生成远程规则引用，策略组继续手写，维护风险更低。

### 为什么不把所有规则都放到一个 list？

分开维护有三个好处：

- 更容易知道某条规则属于哪个策略。
- 某个分类出问题时可以单独排查。
- 三端可以按分类指向不同策略组。

### 为什么公共规则不建议放 IPv6？

此前已决定 Quantumult X 的公共分流 list 删除 IPv6。为了三端共用更稳定，公共 `Rules/*.list` 继续保持无 IPv6。若未来要支持 IPv6，建议单独设计规则文件和客户端兼容策略。

## 安全提醒

提交前请确认不要包含：

- 机场订阅 URL
- 私有节点
- token
- cookie
- MITM `ca-p12`
- MITM `ca-passphrase`
- 私有 hostname

这类内容应只保留在本地私有配置中，不进入公开仓库。
