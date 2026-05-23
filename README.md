# Proxy-Config-Sets

自用代理配置与远程分流规则集，主要维护 Quantumult X、Shadowrocket 与 Clash Verge Rev 配置。

## 目录

- `rules/`：三端共用的远程分流规则。
- `Quantumult X/`：Quantumult X 配置和资源解析器。
- `Shadowrocket/`：Shadowrocket 配置。
- `Clash Verge Rev/`：Clash Verge Rev 全局扩展脚本。

## 维护原则

- 配置文件只保留少量手动规则、策略组、基础设置和兜底规则。
- 大批量分流规则统一放在根目录 `rules/*.list`，通过远程规则集引用。
- `GEOIP` 和 `FINAL` 保留在主配置末尾，避免规则顺序被破坏。
- 不公开托管节点、订阅、token、证书、MITM `p12`、`passphrase` 或私有 hostname。

## GitHub Raw

本仓库规则通过 GitHub Raw 引用。路径大小写敏感，例如：

```text
https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/main/rules/github.list
```

