# Shadowrocket（Claude 特供版）

在原来的 Shadowrocket 配置之外**新建**的 Claude 特供版，不覆盖：

- `Shadowrocket/Shadowrocket Config v2.conf`（日常）
- `Shadowrocket（Claude）/Shadowrocket Config Claude.conf`（上一份 Claude）

相对上一份 Claude 配置只多了：

```text
DOMAIN-SUFFIX,sift.com → 🧠 Claude
DOMAIN-SUFFIX,siftcience.com → 🧠 Claude
DOMAIN-KEYWORD,datadoghq → 🧠 Claude
```

对应的 UDP REJECT 写在 DOMAIN 规则前面，和 Claude 其它域一样强制 TCP。

## 导入

1. Shadowrocket 里备份当前配置
2. 隔空投送 `Shadowrocket Config Claude 特供版.conf`，用 Shadowrocket 打开
3. 订阅如果丢了，从旧配置把订阅拷回来。本文件不含节点 URL
4. `🧠 Claude` 选 **美国 05**，不要选 `🇺🇸 美国节点` 那个 url-test
5. Wi-Fi DNS 保持自动。时区 Los Angeles。关 Private Relay

日常看视频继续用原来的 v2；上一份 Claude 配置也还在。要用 Sift/Datadog 同出口时，用这一份特供版。
