# Fluent Tab Pro

Fluent Tab Pro 是一个简约、可定制的浏览器新标签页扩展，采用 Fluent Design 设计语言，旨在提供纯净、高效的浏览体验。
此项目改进自Fluent New Tab(https://github.com/snw-mint/fluent-new-tab)

## ✨ 功能特性

- **简约设计**：平滑的动画与直观的布局。
- **动态壁纸**：支持 Bing 每日图片、NASA、维基百科等多种图片源。
- **自定义配置**：高度可定制的外观与功能。
- **隐私优先**：无需不必要的权限，数据存储在本地。
- **快捷搜索**：内置高效的搜索引擎入口。

## 🚀 快速开始

如果你想从源码构建或进行二次开发，请参考以下步骤：

### 1. 克隆项目
```bash
git clone https://github.com/rookiewu417/fluent-tab-pro.git
cd fluent-tab-pro
```

### 2. 安装依赖
```bash
npm install
```

### 3. 构建项目
```bash
# 执行完整构建
npm run build
```

构建产物将保存在 `dist` 目录中。

## 🛠️ 构建命令

- `npm run build`: 转换 TypeScript，编译 SCSS 并复制资源。
- `npm run watch:ts`: 监视并实时编译 TypeScript。
- `npm run watch:scss`: 监视并实时编译 SCSS。
- `npm run clean`: 清理构建目录。

## 📦 安装到浏览器

1. 打开浏览器扩展管理页面 (`chrome://extensions` 或 `edge://extensions`)。
2. 开启“开发者模式”。
3. 点击“加载解压的扩展程序”，选择项目根目录（确保已执行构建命令）。

## 📄 开源协议

本项目采用 [GPL-3.0 License](LICENSE) 开源协议。
