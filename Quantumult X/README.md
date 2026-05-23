# Quantumult X

Quantumult X 自用配置，共用远程分流规则位于仓库根目录 `rules/`。

## 文件

- `quantumult_20260523005929.conf`：公开版 Quantumult X 主配置。
- `QX_resource-parser_QXPreset.js`：订阅资源解析器。

## 规则引用

主配置通过 `[filter_remote]` 引用根目录 `rules` 下的规则文件，例如：

```ini
https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/main/rules/github.list, tag=GitHub, force-policy=🐙 GITHUB, update-interval=172800, opt-parser=true, enabled=true
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

