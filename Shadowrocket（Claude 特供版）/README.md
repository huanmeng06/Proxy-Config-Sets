# Shadowrocket（Claude 特供版）

在原来的 Shadowrocket 配置之外**新建**的 Claude 特供版，不覆盖：

- `Shadowrocket/Shadowrocket Config v2.conf`（日常）
- `Shadowrocket（Claude）/Shadowrocket Config Claude.conf`（上一份 Claude）

当前和电脑端满意的链式配置对齐的是：

- `Shadowrocket Config Claude 链式代理 特供版.conf`

非链式（钉美国 05、不走 ISP）仍保留：

- `Shadowrocket Config Claude 特供版.conf`

ChatGPT / Claude / Grok / DeepSeek 的**域名分流**走远端 `Rules/*.list`。
本地只留 UDP AND REJECT（`PROTOCOL,UDP`，写在 RULE-SET 前面）以及局域网 / 认证页。
Stripe / Proton Mail / Sift / Datadog / coffee / Persona 已写入 `Rules/claude.list`。

## 链式特供怎么对应电脑

Clash 的 `🔗 链式节点` 是机场→ISP 克隆测速。Shadowrocket 做不到 `dialer-proxy` 克隆。

等价走法：

1. `🔗 链式节点`：机场 url-test（给 ISP 当前置）
2. `🔗 落地 ISP`：用 `^.*ISP.*` 收录本地 ISP 节点，也是 Claude / 泄漏 / 节点选择要选的出口
3. 自己添加落地 SOCKS（**名字里必须带 ISP**），「代理通过」选 `🔗 链式节点` 并保存。配置不自带美国 ISP。

Shadowrocket **不能自动改名**。Clash 会把 `美国 ISP 怀俄明州 夏延市` 改成 `🔗🇺🇸 美国 怀俄明州 夏延市 [ISP]`；SR 只会按名字里的 `ISP` 把节点放进落地组。旧正则 `(?i)ISP` 是整名匹配，进不了组。

不要把 Home 或 Claude 直接切到 `🔗 链式节点`，那会跳过落地。

## 导入链式特供

1. Shadowrocket 里备份当前配置
2. 隔空投送 `Shadowrocket Config Claude 链式代理 特供版.conf`，用 Shadowrocket 打开
3. 订阅如果丢了，从旧配置把订阅拷回来。仓库不带 ISP 节点，自己在 Shadowrocket 里加 SOCKS（名字带 ISP，例如 `美国 ISP 怀俄明州 夏延市`）
4. 打开该落地节点 →「代理通过」→ `🔗 链式节点` → 保存
5. 打开 `🔗 落地 ISP`，应看到这条本地节点。若还停在旧占位 `🔗🇺🇸 美国 ISP`，删掉占位再选城市名那条
6. `🧠 Claude` 和 `🚀 节点选择` 应已是 `🔗 落地 ISP`
7. Wi-Fi DNS 保持自动。时区 Los Angeles。关 Private Relay
8. 更新远程规则
9. ISP 节点 TLS fingerprint = Chrome。想和电脑同款显示，可手动改名为 `🔗🇺🇸 美国 怀俄明州 夏延市 [ISP]`

日常看视频继续用原来的 v2。
