# Clash：Claude 特供配置

`Clash Verge Rev Global Extend Script Claude 特供版.js` 是独立的非链式扩展；此次同步不覆盖它，也不覆盖日常 v3 脚本。

`Clash Verge Rev 链式代理.js` 是 2026-10-08 更新的完整链式脚本。它不带机场节点、ISP 凭据或订阅地址，也不生成回转箭头名称。

## ISP 前置采用 fallback

1. 在自己的私有订阅/额外节点中添加机场和真实 ISP。原 ISP 节点名需要含 `ISP`，国家与城市来自原名；不要把脚本生成的出口名称当作原始节点名。
2. 脚本为每个 ISP 生成一个 `📡 机场前置 → 国旗 国家 城市 ISP 编号` fallback 组，以及一个 `📡 机场前置 → 国旗 国家 城市 [ISP]` 实际出口。
3. 前置候选为机场节点的副本，不发送 ISP 账号密码。向 ISP 的实际 HTTP 端口发送请求，HTTP 407 视为回应成功。
4. fallback 按候选顺序使用首个可用前置；每 1800 秒检查，超时 8000 ms，不使用延迟排名或 tolerance。普通地区组的 URLTest 不受此改动影响。
5. ISP 实际出口使用这个组作为 dialer-proxy。Claude 和链式节点只选择实际 ISP 出口，不选择机场前置组。
6. 缺少 ISP 或订阅为空时，链式节点为 REJECT；实际 ISP 不可用时不回退到机场。

HTTP/SOCKS5 可能使用不同端口。当前端口映射函数支持 IPRoyal 的常见 HTTP 12323 / SOCKS5 12324；其他供应商应在私有脚本中核实和调整实际 HTTP 探测端口，不根据名字猜测。

DIRECT 仍在前置候选最后。选中它是本机 → ISP → 网站，仍经过 ISP；若要求必须经过机场，可在私有脚本中去掉该候选。

HTTP 407 成功只证明到 ISP HTTP 端口的路径能回应，不保证账户认证、SOCKS5 或网站访问。单来源 ISP 切换前置仍可能受旧连接占用影响。

## 分流与 DNS

Claude / Anthropic 邮件域名等共用 Rules/claude.list，其他服务共用仓库 Rules。泄漏测试站没有专用分流或 DNS 策略。UDP、进程和校园认证规则由脚本生成。

默认 Cloudflare / Google DoH 经链式节点当前选中的 ISP；它不自动跟随 Claude 组的独立选择。国内 geosite:cn 直连阿里/腾讯 DoH，macOS 校园/内网使用 DHCP DNS。节点解析保留订阅自己的 bootstrap，避免解析循环。

修改后重新生成并应用 Clash Verge 配置。运行中已建立的连接可能继续走原来的前置。

## 三端差异

CMFA 公共基础 YAML 不内置节点；私有前置组同样用原生 fallback 和 HTTP 407 检查。Shadowrocket 使用原生 fallback 类型，但没有核实指定 407 成功状态的配置语法，需要手机验证，且 ISP 的“代理通过”要在 App 中绑定。类型同步不等于闭源引擎的检测行为已经验证一致。
