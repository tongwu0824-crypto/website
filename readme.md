<div align="center">

# 🚀 Personal Portfolio Template

**Build your own personal website in 30 minutes — no coding experience needed.**

A minimalist, zero-cost portfolio template / 极简个人主页与零成本部署指南

[🇺🇸 English](#-english-version) | [🇨🇳 中文版](#-中文版)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=GitHub%20Pages&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

</div>

---

## 🇺🇸 English Version

### What Is This?

This is a ready-to-use personal website template. You don't need to write code from scratch — just replace the text and images with your own, and you'll have a professional portfolio site live on the internet **for free**.

**🌐 Live Demo:** [https://tongwu.network](https://tongwu.network) *(Replace with your link)*

### What You'll Need Before Starting

| # | Item | Cost | Time to Set Up |
|---|------|------|----------------|
| 1 | A **GitHub account** ([sign up here](https://github.com/signup)) | Free | 2 min |
| 2 | A **Namecheap account** ([sign up here](https://www.namecheap.com/)) | Free | 2 min |
| 3 | A **domain name** (e.g., `yourname.com`) | ~$9/year | 5 min |

> 💡 **Don't want a custom domain?** You can skip Steps 2–4 below and your site will be live at `your-username.github.io` for free!

### ✨ What You Get

- **Zero Server Cost** — Hosted free forever via GitHub Pages.
- **Works on Mobile** — Responsive design, looks great on any device.
- **No Frameworks** — Pure HTML/CSS. Easy to understand and customize.
- **Copy & Paste Ready** — Fork the repo, swap in your info, done.

### 📂 What's Inside

```
📦 your-repo/
 ┣ 📂 assets/         ← Put your profile photo & resume PDF here
 ┣ 📜 index.html      ← Your main webpage (edit this!)
 ┣ 📜 style.css       ← Colors and fonts (optional to edit)
 ┗ 📜 README.md       ← This guide
```

---

## 🛠️ Step-by-Step Guide

### Phase 1: Get the Template (5 min)

**Step 1.1 — Fork the repository**

1. Make sure you're logged into GitHub.
2. Go to the original repository page.
3. Click the green **"Fork"** button in the top-right corner.
4. On the next screen, click **"Create fork"**.

> ✅ **What just happened?** You made your own copy of the entire project under your GitHub account.

**Step 1.2 — Rename your repository (optional but recommended)**

1. In your new forked repo, click **Settings** (top menu bar).
2. Under "Repository name", change it to something like `portfolio` or `my-website`.
3. Click **Rename**.

---

### Phase 2: Customize Your Content (10 min)

**Step 2.1 — Edit `index.html`**

1. In your repo, click the file `index.html`.
2. Click the **pencil icon** (✏️) in the top-right to edit.
3. Find and replace the placeholder text with your own:
   - Your **name**
   - Your **job title / tagline**
   - Your **about me** paragraph
   - Your **project descriptions**
   - Your **contact links** (email, LinkedIn, GitHub, etc.)
4. Scroll down and click **"Commit changes"**.

> 🔍 **How to find things:** Use `Ctrl + F` (or `Cmd + F` on Mac) to search for placeholder text like "Your Name" or "your-email".

**Step 2.2 — Edit `style.css` (optional)**

Only do this if you want to change colors or fonts. Otherwise, the defaults look great.

1. Click on `style.css` in your repo.
2. Click the pencil icon to edit.
3. Change any color codes (e.g., `#2563eb` for blue) to your preferred colors.
4. Commit changes.

> 🎨 **Find colors easily:** Visit [htmlcolorcodes.com](https://htmlcolorcodes.com/) to pick colors and copy their hex codes.

**Step 2.3 — Upload your photo and resume**

1. Navigate to the `assets/` folder in your repo.
2. Click **"Add file"** → **"Upload files"**.
3. Drag in your profile photo (name it exactly as referenced in `index.html`, e.g., `profile.jpg`).
4. Drag in your resume PDF (e.g., `resume.pdf`).
5. Click **"Commit changes"**.

> ⚠️ **File names matter!** Make sure the file names in your `index.html` match exactly what you upload. `Profile.jpg` ≠ `profile.jpg`.

---

### Phase 3: Put Your Site Online for Free (5 min)

**Step 3.1 — Enable GitHub Pages**

1. Go to your repository's **Settings** (top menu bar).
2. In the left sidebar, click **Pages**.
3. Under **"Build and deployment"** → **"Branch"**, select **`main`** from the dropdown.
4. Click **Save**.
5. Wait 1–2 minutes, then refresh the page. You'll see a green banner with your site URL:
   `https://your-username.github.io/your-repo-name/`

> ✅ **Your site is now live!** Visit that URL to see it. If you're happy with `your-username.github.io`, you can stop here!

---

### Phase 4: Connect a Custom Domain (15 min) — *Optional*

> Skip this entire phase if you don't want a custom domain like `yourname.com`.

**Step 4.1 — Buy a domain on Namecheap**

1. Go to [namecheap.com](https://www.namecheap.com/) and search for your desired domain.
2. Add it to cart and proceed to checkout.
3. ⚠️ **Money-saving tip:** At checkout, look for the **PremiumDNS** option and make sure it is **OFF**. The free basic DNS is all you need.
4. Complete the purchase.

**Step 4.2 — Configure DNS records on Namecheap**

This is the trickiest part, but just follow these sub-steps carefully:

1. Log into [Namecheap](https://www.namecheap.com/) and go to **Dashboard** → click **Manage** next to your domain.
2. Click the **Advanced DNS** tab.

**Sub-step A: Delete all default records**

3. You'll see some existing records (usually a URL Redirect Record and a CNAME for "parkingpage"). **Delete every single one of them** by clicking the trash icon next to each.

> ⚠️ **Why?** These default records conflict with GitHub Pages and cause 404 errors. This is the #1 mistake beginners make.

**Sub-step B: Add 4 "A Records"**

4. Click **"Add New Record"** and create these 4 records one by one:

| Type | Host | Value |
|------|------|-------|
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |

> 💡 These are GitHub's server IP addresses. They tell the internet: "when someone visits my domain, go to GitHub's servers."

**Sub-step C: Add 1 "CNAME Record"**

5. Add one more record:

| Type | Host | Value |
|------|------|-------|
| CNAME Record | `www` | `your-github-username.github.io` |

> 💡 Replace `your-github-username` with your actual GitHub username. This makes `www.yourname.com` work too.

**Step 4.3 — Tell GitHub about your domain**

1. Go back to your repo on GitHub → **Settings** → **Pages**.
2. In the **"Custom domain"** box, type your domain (e.g., `yourname.com`).
3. Click **Save**.
4. You'll likely see a yellow warning: `DNS check in progress`. This is normal.
5. **Wait 5–15 minutes**, then click **"Check again"**.
6. Once it says successful, check the box: **"Enforce HTTPS"**.

> ✅ **Done!** Your site is now live at `https://yourname.com` with a secure padlock icon. 🎉

---

### 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| I see a 404 error | Did you delete ALL default DNS records in Step 4.2A? Go back and make sure. |
| `InvalidDNSError` on GitHub | DNS takes time. Wait 15–30 min and click "Check again". |
| Site shows but looks broken | Check that `style.css` is in the same folder as `index.html`. |
| My photo doesn't show | File name in `index.html` must match exactly (case-sensitive). |
| HTTPS checkbox is greyed out | Wait a few more minutes for DNS to fully propagate, then refresh. |

---

## 🇨🇳 中文版

### 这是什么？

这是一个即开即用的个人网站模板。你不需要从零写代码——只要把模板里的文字和图片换成你自己的，就能**免费**拥有一个专业的个人作品集网站。

**🌐 在线演示:** [https://tongwu.network](https://tongwu.network) *(请替换为你的链接)*

### 开始前你需要准备

| # | 所需物品 | 费用 | 准备时间 |
|---|---------|------|---------|
| 1 | 一个 **GitHub 账号** ([点此注册](https://github.com/signup)) | 免费 | 2 分钟 |
| 2 | 一个 **Namecheap 账号** ([点此注册](https://www.namecheap.com/)) | 免费 | 2 分钟 |
| 3 | 一个 **域名** (如 `yourname.com`) | 约 $9/年 | 5 分钟 |

> 💡 **不想买域名？** 可以跳过后面的第 4 阶段，你的网站会以 `你的用户名.github.io` 的地址免费上线！

### ✨ 项目特点

- **零服务器成本** — 通过 GitHub Pages 永久免费托管。
- **手机适配** — 响应式设计，任何设备上都好看。
- **无框架依赖** — 纯 HTML/CSS，容易理解和修改。
- **开箱即用** — Fork 仓库，替换信息，搞定。

### 📂 文件说明

```
📦 你的仓库/
 ┣ 📂 assets/         ← 放你的头像和简历 PDF
 ┣ 📜 index.html      ← 你的主页（编辑这个！）
 ┣ 📜 style.css       ← 颜色和字体（可选编辑）
 ┗ 📜 README.md       ← 本说明文档
```

---

## 🛠️ 分步操作指南

### 阶段 1：获取模板 (5 分钟)

**步骤 1.1 — Fork（复制）仓库**

1. 确保已登录 GitHub。
2. 打开本项目的仓库页面。
3. 点击右上角绿色的 **"Fork"** 按钮。
4. 在下一页点击 **"Create fork"**。

> ✅ **这一步做了什么？** 你把整个项目复制了一份到你自己的 GitHub 账号下。

**步骤 1.2 — 重命名仓库（可选但推荐）**

1. 在你 Fork 后的仓库中，点击顶部的 **Settings**。
2. 将 "Repository name" 改为 `portfolio` 或 `my-website` 之类的名字。
3. 点击 **Rename**。

---

### 阶段 2：填入你的内容 (10 分钟)

**步骤 2.1 — 编辑 `index.html`**

1. 在你的仓库里点击 `index.html` 文件。
2. 点击右上角的 **铅笔图标** (✏️) 进入编辑模式。
3. 找到占位文字，替换为你自己的信息：
   - 你的 **姓名**
   - 你的 **职位 / 一句话介绍**
   - 你的 **关于我** 段落
   - 你的 **项目描述**
   - 你的 **联系方式**（邮箱、LinkedIn、GitHub 等）
4. 滚动到底部点击 **"Commit changes"**（提交修改）。

> 🔍 **找内容小技巧：** 用 `Ctrl + F`（Mac 用 `Cmd + F`）搜索 "Your Name" 之类的占位符。

**步骤 2.2 — 编辑 `style.css`（可选）**

如果你想改颜色或字体才需要做这步，否则默认样式就很好看。

1. 点击仓库里的 `style.css`。
2. 点击铅笔图标编辑。
3. 修改颜色代码（如 `#2563eb` 是蓝色）为你喜欢的颜色。
4. 提交修改。

> 🎨 **选颜色工具：** 访问 [htmlcolorcodes.com](https://htmlcolorcodes.com/) 选色并复制色号。

**步骤 2.3 — 上传头像和简历**

1. 在仓库里进入 `assets/` 文件夹。
2. 点击 **"Add file"** → **"Upload files"**。
3. 拖入你的头像（文件名要和 `index.html` 里引用的完全一致，如 `profile.jpg`）。
4. 拖入你的简历 PDF（如 `resume.pdf`）。
5. 点击 **"Commit changes"**。

> ⚠️ **文件名很重要！** `index.html` 里写的文件名和你上传的必须完全一致，包括大小写。`Profile.jpg` ≠ `profile.jpg`。

---

### 阶段 3：免费上线你的网站 (5 分钟)

**步骤 3.1 — 开启 GitHub Pages**

1. 进入仓库的 **Settings**（顶部菜单栏）。
2. 左侧菜单点击 **Pages**。
3. 在 **"Build and deployment"** → **"Branch"** 下拉菜单中选择 **`main`**。
4. 点击 **Save**。
5. 等 1-2 分钟，刷新页面，你会看到一个绿色横幅显示你的网站地址：
   `https://你的用户名.github.io/你的仓库名/`

> ✅ **你的网站已经上线了！** 访问那个链接看看吧。如果你满足于 `你的用户名.github.io` 这个地址，到这里就完成了！

---

### 阶段 4：绑定自定义域名 (15 分钟) — *可选*

> 如果你不需要 `yourname.com` 这样的自定义域名，可以跳过整个阶段 4。

**步骤 4.1 — 在 Namecheap 购买域名**

1. 打开 [namecheap.com](https://www.namecheap.com/)，搜索你想要的域名。
2. 加入购物车，进入结算页面。
3. ⚠️ **省钱提示：** 结算时找到 **PremiumDNS** 选项，确保它是 **关闭** 的。免费基础 DNS 完全够用。
4. 完成支付。

**步骤 4.2 — 在 Namecheap 配置 DNS 记录**

这是最关键的一步，严格按照以下子步骤操作：

1. 登录 [Namecheap](https://www.namecheap.com/)，进入 **Dashboard** → 点击域名旁边的 **Manage**。
2. 点击 **Advanced DNS** 标签页。

**子步骤 A：删除所有默认记录**

3. 你会看到一些已有记录（通常是一个 URL Redirect Record 和一个指向 parkingpage 的 CNAME）。**逐个点击垃圾桶图标，全部删除。**

> ⚠️ **为什么？** 这些默认记录会和 GitHub Pages 冲突，导致 404 错误。这是新手最常踩的坑。

**子步骤 B：添加 4 条 A 记录**

4. 点击 **"Add New Record"**，逐条创建以下 4 条记录：

| 类型 | Host | Value |
|------|------|-------|
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |

> 💡 这些是 GitHub 的服务器 IP 地址。告诉互联网："有人访问我的域名时，去找 GitHub 的服务器。"

**子步骤 C：添加 1 条 CNAME 记录**

5. 再添加一条记录：

| 类型 | Host | Value |
|------|------|-------|
| CNAME Record | `www` | `你的GitHub用户名.github.io` |

> 💡 把 `你的GitHub用户名` 替换成你真实的 GitHub 用户名。这样 `www.yourname.com` 也能访问。

**步骤 4.3 — 在 GitHub 绑定域名**

1. 回到 GitHub 仓库 → **Settings** → **Pages**。
2. 在 **"Custom domain"** 框中输入你的域名（如 `yourname.com`）。
3. 点击 **Save**。
4. 你可能会看到黄色提示：`DNS check in progress`，这是正常的。
5. **等待 5-15 分钟**，然后点击 **"Check again"**。
6. 显示成功后，勾选 **"Enforce HTTPS"**。

> ✅ **大功告成！** 你的网站现在可以通过 `https://yourname.com` 访问了，还带安全小锁图标。🎉

---

### 🆘 常见问题排查

| 问题 | 解决办法 |
|------|---------|
| 看到 404 错误 | 检查步骤 4.2A，是否删除了所有默认 DNS 记录？ |
| GitHub 提示 `InvalidDNSError` | DNS 需要时间生效，等 15-30 分钟后再点 "Check again"。 |
| 网站能打开但样式全乱 | 确认 `style.css` 和 `index.html` 在同一个文件夹里。 |
| 照片不显示 | `index.html` 里的文件名和上传的必须完全一致（区分大小写）。 |
| HTTPS 选项是灰色的 | 再多等几分钟让 DNS 完全生效，然后刷新页面。 |

---

## 📄 License / 开源协议

This project is licensed under the **MIT License**. / 本项目采用 **MIT 开源协议**。

You are free to use, modify, and distribute this code. / 你可以自由地使用、修改和分发代码。

---

<div align="center">

Built with ❤️ and AI assistance.

</div>
