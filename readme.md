<div align="center">
<h1>🚀 Personal Portfolio Template</h1>
<p>A minimalist, zero-cost deployment portfolio template / 极简个人主页与零成本部署指南</p>
<p>
<a href="#-english-version">🇺🇸 English</a> | <a href="#-中文版">🇨🇳 中文版</a>
</p>
<p>
<img src="https://www.google.com/search?q=https://img.shields.io/badge/HTML5-E34F26%3Fstyle%3Dfor-the-badge%26logo%3Dhtml5%26logoColor%3Dwhite" alt="HTML5">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/CSS3-1572B6%3Fstyle%3Dfor-the-badge%26logo%3Dcss3%26logoColor%3Dwhite" alt="CSS3">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/GitHub%2520Pages-222222%3Fstyle%3Dfor-the-badge%26logo%3DGitHub%2520Pages%26logoColor%3Dwhite" alt="GitHub Pages">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/License-MIT-green.svg%3Fstyle%3Dfor-the-badge" alt="License">
</p>
</div>

🇺🇸 English Version

This project provides a minimalist, responsive, pure HTML/CSS portfolio template. It also includes a battle-tested deployment guide on how to host it for free via GitHub Pages and connect a custom domain from Namecheap.

🌐 Live Demo: https://tongwu.network (Replace with your link)

✨ Features

Zero Server Cost: Hosted entirely free forever via GitHub Pages.

Minimalist & Responsive: No complex frameworks. Pure HTML/CSS, perfectly adapted for mobile devices.

Out-of-the-box: Simply fork this repository and replace the text/images to generate your own portfolio.

Troubleshooting Included: Contains a detailed Namecheap DNS setup guide to avoid common 404 errors.

📂 Folder Structure

📦 website
 ┣ 📂 assets          # Images, Resume PDF, etc.
 ┣ 📜 index.html      # Main page (⚠️ Must be lowercase)
 ┣ 📜 style.css       # Stylesheet
 ┗ 📜 README.md       # This document


🛠️ Quick Start

Get the template: Click the Fork button at the top right to copy this project to your GitHub account.

Customize:

Open index.html and replace my information with yours.

Open style.css to tweak colors and typography (optional).

Upload your profile picture and resume PDF to the assets folder.

🚀 Deployment & Domain Setup (SOP)

Step 1: Enable GitHub Pages

Go to your repository Settings.

Click on Pages in the left sidebar.

Under Build and deployment -> Branch, select main, then click Save.

Step 2: Buy Domain (Namecheap Tip)

Buy your domain on Namecheap.

⚠️ Money-saving tip: Disable PremiumDNS at checkout. GitHub Pages works perfectly fine with the free basic DNS.

Step 3: DNS Setup (Crucial)

Go to your Namecheap Dashboard -> Advanced DNS:

🧹 Clear default records: Delete ALL default records, especially URL Redirect Record and CNAME Record for parkingpage. (Important to avoid 404 errors!)

➕ Add 4 A Records (Point to GitHub):

Type: A Record | Host: @ | Value: 185.199.108.153

Type: A Record | Host: @ | Value: 185.199.109.153

Type: A Record | Host: @ | Value: 185.199.110.153

Type: A Record | Host: @ | Value: 185.199.111.153

➕ Add 1 CNAME Record (For www):

Type: CNAME Record | Host: www | Value: your-github-username.github.io

Step 4: Link Domain & Enforce HTTPS

Go back to GitHub repo Settings -> Pages.

Enter your domain in the Custom domain box and click Save.

Wait 5-15 mins for DNS to propagate. If you see InvalidDNSError, wait and click Check again.

Once successful, check "Enforce HTTPS" to secure your site. Done! 🎉

🇨🇳 中文版

本项目提供了一个极简、响应式的纯 HTML/CSS 个人简历与作品集网页模板。同时，本文档包含了一份经过实战检验的保姆级教程，教你如何利用 GitHub Pages 免费托管网页，并完美绑定你在 Namecheap 购买的自定义域名。

🌐 Live Demo: https://tongwu.network (请将此处替换为你的实际链接)

✨ 项目特点

零服务器成本：纯静态页面，通过 GitHub Pages 永久免费托管。

极简且响应式：无需复杂的框架，纯 HTML/CSS 编写，移动端完美适配。

开箱即用：Fork 本仓库后，只需修改文字和图片即可生成你自己的主页。

踩坑经验总结：包含了最新的 Namecheap DNS 配置排错指南。

📂 目录结构

📦 website
 ┣ 📂 assets          # 存放图片、简历 PDF 等静态资源
 ┣ 📜 index.html      # 网站主页（⚠️ 必须全小写）
 ┣ 📜 style.css       # 网站样式表
 ┗ 📜 README.md       # 本说明文档


🛠️ 快速开始

获取模板：点击页面右上角的 Fork 按钮，将本项目复制到你自己的 GitHub 账号下。

本地修改：你可以直接在 GitHub 网页端进行编辑，或者克隆到本地：

打开 index.html，将个人信息、项目介绍替换为你自己的内容。

打开 style.css，调整颜色和排版细节（可选）。

将你的个人头像和简历 PDF 上传至 assets 文件夹。

🚀 部署指南 (Namecheap + GitHub Pages SOP)

Step 1: 开启 GitHub Pages

在代码仓库中，点击顶部的 Settings。

在左侧菜单找到 Pages。

在 Build and deployment -> Branch 下拉菜单中选择 main，点击 Save。

Step 2: 购买域名 (避坑提示)

在 Namecheap 购买心仪的域名。

⚠️ 省钱提示：在购物车结算时，请务必关闭 PremiumDNS 选项。GitHub Pages 配合基础免费 DNS 已完全足够。

Step 3: 配置 DNS 解析 (核心排错)

登录 Namecheap 后台，进入域名管理 -> Advanced DNS：

🧹 清理默认记录（非常重要）：删除列表里所有的默认记录，特别是 URL Redirect Record 和指向 parkingpage 的 CNAME Record。不删会导致 404 冲突！

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

📄 License / 开源协议

This project is licensed under the MIT License.
本项目采用 MIT 开源协议。你可以自由地使用、修改和分发代码。

Built with ❤️ and AI assistance.
