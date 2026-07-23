# Shadowrocket

Shadowrocket 自用配置，共用远程分流规则位于仓库根目录 `Rules/`。

## 文件

- `Shadowrocket Config v2.conf`：公开版 Shadowrocket 主配置。

## DNS 防泄露

主配置关闭 IPv6、系统 fallback 和直连系统 DNS；当直连 DNS 不可用时，查询回退到代理：

```ini
bypass-system = true
dns-server = system
ipv6 = false
prefer-ipv6 = false
dns-fallback-system = false
dns-direct-system = false
dns-direct-fallback-proxy = true
```

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
