🚀 极简个人主页与零成本部署指南 (Personal Portfolio Template)

本项目提供了一个极简、响应式的纯 HTML/CSS 个人简历与作品集网页模板。同时，本文档包含了一份经过实战检验的保姆级教程，教你如何利用 GitHub Pages 免费托管网页，并完美绑定你在 Namecheap 购买的自定义域名。

🌐 Live Demo: https://tongwu.network (请将此处替换为你的实际链接)

✨ 项目特点 (Features)

零服务器成本：纯静态页面，通过 GitHub Pages 永久免费托管。

极简且响应式：无需复杂的框架，纯 HTML/CSS 编写，移动端完美适配。

开箱即用：Fork 本仓库后，只需修改文字和图片即可生成你自己的主页。

踩坑经验总结：包含了最新的 Namecheap DNS 配置排错指南。

📂 目录结构 (Folder Structure)

📦 website
 ┣ 📂 assets          # 存放图片、简历 PDF 等静态资源
 ┣ 📜 index.html      # 网站主页（⚠️ 必须全小写）
 ┣ 📜 style.css       # 网站样式表
 ┗ 📜 README.md       # 本说明文档


🛠️ 快速开始 (Quick Start)

1. 获取模板

点击页面右上角的 Fork 按钮，将本项目复制到你自己的 GitHub 账号下。

2. 本地修改

你可以将代码克隆到本地，或者直接在 GitHub 网页端进行编辑：

打开 index.html，将我的个人信息、项目介绍替换为你自己的内容。

打开 style.css，调整颜色和排版细节（可选）。

将你的个人头像和简历 PDF 上传至 assets 文件夹。

🚀 部署指南 (Deployment & Domain Setup)

以下是将此网页免费上线并绑定自定义域名（以 Namecheap 为例）的完整 SOP：

Step 1: 开启 GitHub Pages

在你的代码仓库中，点击顶部的 Settings。

在左侧菜单找到 Pages。

在 Build and deployment -> Branch 下拉菜单中选择 main，点击 Save。

Step 2: 购买域名 (Namecheap 避坑提示)

在 Namecheap 购买你心仪的域名。

⚠️ 省钱提示：在购物车结算时，请务必关闭 PremiumDNS 选项。GitHub Pages 配合基础免费 DNS 已完全足够。

Step 3: 配置 DNS 解析 (核心排错)

登录 Namecheap 后台，进入你的域名管理 -> Advanced DNS：

🧹 清理默认记录（非常重要）：删除列表里所有的默认记录，特别是 URL Redirect Record 和指向 parkingpage 的 CNAME Record。不删会导致 GitHub 验证报错 404！

➕ 添加 4 条 A 记录（指向 GitHub 服务器）：

Type: A Record | Host: @ | Value: 185.199.108.153

Type: A Record | Host: @ | Value: 185.199.109.153

Type: A Record | Host: @ | Value: 185.199.110.153

Type: A Record | Host: @ | Value: 185.199.111.153

➕ 添加 1 条 CNAME 记录（支持 www 访问）：

Type: CNAME Record | Host: www | Value: 你的GitHub用户名.github.io

Step 4: 绑定域名与开启 HTTPS

回到 GitHub 仓库的 Settings -> Pages。

在 Custom domain 框中填入你的域名，点击 Save。

等待 DNS 解析生效（约 5-15 分钟），如果提示 InvalidDNSError，请耐心等待后点击 Check again。

验证成功后，勾选 Enforce HTTPS 为网站开启安全小锁。大功告成！🎉

📄 开源协议 (License)

本项目采用 MIT License 开源协议。你可以自由地使用、修改和分发本项目代码。

Built with ❤️ and AI assistance.
