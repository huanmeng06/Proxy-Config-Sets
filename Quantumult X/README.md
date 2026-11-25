# Quantumult X

Quantumult X 自用配置，共用远程分流规则位于仓库根目录 `Rules/`。

## 文件

- `Quantumult X.conf`：公开版 Quantumult X 主配置，保留现有 Claude 策略。
- `Quantumult X Resource Parser.js`：订阅资源解析器。

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

共享库中，ChatGPT / Claude 在仓库广告规则之前；哔哩哔哩、巴哈姆特、油管在通用媒体之前。第三方 anti-AD 仍保留，只用现有解析器的 `regout` 排除 `gvt2.com` 的重复条目，交给 `youtube.list`。

## 第三方国内兜底

直接引用 blackmatrix7 ChinaMax 作为国内兜底，顺序在 `proxy.list` 之后、`GEOIP,CN` 之前，命中进 `direct`。如果 ChinaMax 不可用，流量回到原有的 GEOIP 和最终兜底规则。

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
