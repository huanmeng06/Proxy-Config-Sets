# CMFA：Claude 链式代理脱敏模板

2026-10-08 更新。本目录只发布可填写的模板，不包含真实机场订阅、ISP 地址、账号密码或节点快照。

## 导入前填写

1. 下载同目录的 `Clash Meta for Android 链式代理 特供版.yaml`。
2. 将所有 `https://YOUR_AIRPORT_SUBSCRIPTION.invalid/clash.yaml` 替换为自己的 Clash YAML 订阅。文件内有 3 个 provider，都应使用同一份机场订阅。
3. 将 `YOUR_CHEYENNE_ISP_HOST.invalid` 和 `YOUR_NYC_ISP_HOST.invalid` 替换为自己的 ISP 地址。地址在出口节点和两个 HTTP 测速地址中重复出现，必须全部替换。
4. 填写两个 ISP 的 `YOUR_*_USER` / `YOUR_*_PASSWORD`。
5. 核对协议端口：本模板的夏延服务同时在 6544 支持 HTTP/SOCKS5；IPRoyal 纽约 HTTP=12323、SOCKS5=12324。其他供应商必须使用自己的实际端口，不能直接套用这组数字。
6. 只有一个 ISP 时，删除不用的出口节点、对应的前置组/provider，并从 Claude 和链式节点组中删去相应引用。没有任何 ISP 时，将这两个业务选择组改为只含 `REJECT`。
7. CMFA 导入本地 YAML，更新 3 个 provider，使用规则模式，并通过客户端开启 VPN/TUN。

`.invalid` 是故意不能用于公网访问的占位地址。模板可做结构校验，但未填写前不能联网。

## 链路与测速

- `🔗 链式节点`、`🧠 Claude` 只选择实际 ISP 出口：`↪ 📡 机场前置 → 🇺🇸 国家 城市 [ISP]`。
- 原来的两个 `📡 机场前置 → … ISP 1/2` 组负责比较前置；没有额外的“落地 ISP”组。
- `Airport_CHEYENNE` / `Airport_NYC` 从机场订阅产生独立命名的前置节点池，使用 `↪ 原订阅节点名 → ISP` 格式。订阅原名的旗帜是否存在取决于机场；CMFA 不执行 Verge 的 JavaScript 自动地区改名。
- 每个前置节点向 ISP 的 HTTP 端口发送未认证请求，`expected-status: 407` 代表收到“需要认证”的回应。provider 自身的 health-check 和前置组 URL 保持相同。
- 1800 秒间隔、200 ms 容差、8000 ms 超时。407 成功只说明到 HTTP 端口的路径能回应，不保证 SOCKS5 登录和网站访问一定成功。
- 实际 ISP 节点携带凭据，其 `dialer-proxy` 指向对应前置组：手机 → 选中的机场 → ISP → 网站。没有机场直出兜底。
- `DIRECT` 是前置候选，选中它会变成手机 → ISP → 网站，仍然经过 ISP。若要求必须经过机场，可删除前置组里的 DIRECT。
- 不要把业务策略直接改到前置组；前置组里的节点是机场，只用于 ISP 拨号。
- 单来源 ISP 在换前置时可能受旧入口占用影响，切换不保证无中断。

## DNS 与分流

默认 Cloudflare / Google DoH 经 `🔗 链式节点` 当前选中的 ISP。Claude 域名使用同一路径；它不会自动跟随 Claude 组的独立出口选择，必要时同步选择这两个组。

国内 geosite:cn 使用阿里/腾讯 DoH 直连。认证页/内网使用 Android 系统 DNS，替代 macOS 的 `dhcp://en0`。节点解析与引导 DNS 使用公共直连解析器；若机场要求专用 bootstrap DNS，应自行填入私有配置，不要提交账号标识。

Claude、Anthropic 邮件子域名及其他服务使用仓库 `Rules/*.list`。保留 TCP/UDP 分流和 Android 包名规则，移除 macOS 进程绑定。泄漏测试站不再有专用的链式分流或 DNS 覆盖。

## 校验范围

发布前已验证：脱敏、YAML 加载、组/provider/出口引用、ISP-only 业务出口与 407 设置。占位模板的手机联网和供应商具体端口仍需填写后验证。所有前置失效时，ISP 连接失败；不得为此将 Claude 改成机场或 DIRECT。
