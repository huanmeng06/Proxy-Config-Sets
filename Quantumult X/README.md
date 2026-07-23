# Quantumult X

Quantumult X 自用配置，共用远程分流规则位于仓库根目录 `Rules/`。

## 文件

- `Quantumult X Config v2.conf`：公开版 Quantumult X 主配置。
- `Quantumult X Resource Parser v2.js`：订阅资源解析器。

## DNS 防泄露

主配置使用 Quantumult X 原生 DNS 语法：

```ini
[dns]
no-system
no-ipv6
doh-server = https://223.5.5.5/dns-query, https://1.12.12.12/dns-query
```

- `no-system` 禁止使用当前网络下发的系统 DNS。
- `no-ipv6` 拒绝 AAAA 查询，避免 IPv6 旁路。
- DoH 使用 IP 端点，启动时不依赖系统 DNS 解析 DoH 域名。

## 规则引用

主配置通过 `[filter_remote]` 引用根目录 `Rules` 下的规则文件，例如：

```ini
https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules/github.list, tag=GitHub, force-policy=🐙 GITHUB, update-interval=172800, opt-parser=true, enabled=true
```

规则文件只保留规则本体，不带最终策略组；策略由 `force-policy` 指定。

## 本地保留

以下内容保留在主配置中：

- 少量手动规则
- 防漏检测规则
- iOS 更新屏蔽
- `GEOIP,CN`
- `FINAL`

## 安全

公开配置中已移除：

- 机场订阅 URL
- 本地节点
- MITM passphrase
- MITM p12 证书
