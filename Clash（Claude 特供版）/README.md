# Clash（Claude 特供版）

在原来的 Clash 全局脚本之外**新建**的 Claude 特供版，不覆盖：

- Clash Verge 正在用的 `profiles/Script.js`
- 仓库里的 `Clash Verge Rev/Clash Verge Rev Global Extend Script v3.js`

相对原脚本只多了这三条（不用 coffee 那种过宽 keyword `sift` / `datadog`）：

```text
DOMAIN-SUFFIX,sift.com
DOMAIN-SUFFIX,siftcience.com
DOMAIN-KEYWORD,datadoghq
```

`datadoghq` 能盖住 `browser-intake-us3-datadoghq.com` 这类变名，又不会把所有带 `datadog` 的域名送去美国 05。

## 这份脚本怎么跑

Clash Verge 会**先跑全局 `Script.js`，再跑配置自己的扩展脚本**。

- 如果全局脚本已经生成了 `🧠 Claude` 规则：本文件只追加 Sift / Datadog（不会把节点名再打一遍旗帜）。
- 如果全局脚本是空模板：本文件会完整增强，并带上 Sift / Datadog。

## 本机 Clash Verge

已经加好一个独立订阅配置，名字是 **Clash（Claude 特供版）**：

1. 打开 Clash Verge Rev → 配置
2. 点 **Clash（Claude 特供版）** 启用（原来的 YepFast 还在，没有改）
3. `🧠 Claude` 仍选 **美国 05**

不要把本文件粘进原来的 `Script.js`。

## 文件

`Clash Verge Rev Global Extend Script Claude 特供版.js`
