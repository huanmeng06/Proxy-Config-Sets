# Shadowrocket

Shadowrocket 自用配置，共用远程分流规则位于仓库根目录 `Rules/`。

## 文件

- `Shadowrocket.conf`：公开版 Shadowrocket 主配置。

## DNS 防泄露

主配置保留系统 DNS 回退、`skip-proxy` 和校园网例外；代理 DNS 使用 DoH：

```ini
bypass-system = true
dns-server = 223.5.5.5,223.6.6.6,119.29.29.29,system
fallback-dns-server = system
proxy-dns-server = https://1.1.1.1/dns-query,https://8.8.8.8/dns-query
ipv6 = false
prefer-ipv6 = false
dns-fallback-system = true
dns-direct-system = true
dns-direct-fallback-proxy = false
```

## 可选 Claude 链式出口

无 ISP 时，`🧠 Claude` 默认 `REJECT`。使用时在设备上添加名称包含 `ISP` 的落地节点，将其「代理通过」设为 `📡 链式入口`，再为入口选择前置节点，为 `🧠 Claude` 选择 ISP。

| 项目 | Clash Verge Rev | CMFA | Shadowrocket |
| --- | --- | --- | --- |
| 机场入口 | `📡 链式入口` | 同左 | 同左 |
| 网站出口 | ISP / 链式节点 | 同左 | 同左；App 内绑定「代理通过」 |
| 国内/国外 AI | 独立组 | 同左 | 同左 |
| 微软 | 合并为微软服务 | 同左 | 同左 |
| Claude UDP/IP | 域名 UDP 拒绝 + `160.79.104.0/21` | 同左 | 同左；不使用 GEOSITE |
| 微信 | 进程及域名直连 | Android 包名及域名直连 | iOS 使用域名直连；进程规则仅适用于 macOS |
| `nameserver-policy` | 按业务组绑定 DoH | 同左 | 不支持逐业务 DNS |
| `PROCESS-PATH-REGEX` | macOS 路径 | 使用 Android 包名 | 不使用路径匹配 |
| `dialer-proxy` | 脚本设置 | 私有配置设置 | App 内设置「代理通过」 |

## 规则引用

主配置通过 `RULE-SET` 引用根目录 `Rules` 下的规则文件，例如：

```ini
RULE-SET,https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules/github.list,🐙 GITHUB
```

规则文件只保留规则本体，不带最终策略组；策略由 `RULE-SET` 行最后一列指定。

## 本地保留

以下内容保留在主配置中：

- 少量手动规则
- 防漏检测规则
- iOS 更新屏蔽
- `GEOIP,CN`
- `FINAL`

## 安全

公开配置中不应包含：

- 节点或订阅
- token
- MITM ca-p12
- MITM ca-passphrase
- 私有 hostname
