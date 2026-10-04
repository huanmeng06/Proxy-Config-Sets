# Shadowrocket（Claude 特供版）

在原来的 Shadowrocket 配置之外**新建**的 Claude 特供版，不覆盖：

- `Shadowrocket/Shadowrocket Config v2.conf`（日常）
- `Shadowrocket（Claude）/Shadowrocket Config Claude.conf`（上一份 Claude）

ChatGPT / Claude / Grok / DeepSeek 的**域名分流**走远端 `Rules/*.list`。
本地只留 UDP AND REJECT（`PROTOCOL,UDP`，写在 RULE-SET 前面）以及局域网 / 认证页 / 微软商店。

Stripe / Proton Mail / Sift / Datadog / coffee / Persona 已写入 `Rules/claude.list`。

## 导入

1. Shadowrocket 里备份当前配置
2. 隔空投送 `Shadowrocket Config Claude 特供版.conf`，用 Shadowrocket 打开
3. 订阅如果丢了，从旧配置把订阅拷回来。本文件不含节点 URL
4. `🧠 Claude` 选 **美国 05**，不要选 `🇺🇸 美国节点` 那个 url-test
5. Wi-Fi DNS 保持自动。时区 Los Angeles。关 Private Relay
6. 更新远程规则，让新的 `claude.list` 生效

日常看视频继续用原来的 v2。
