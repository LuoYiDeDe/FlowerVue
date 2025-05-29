# 花店管理系统 (Flower Shop Management System)

## 项目简介
这是一个基于 Vue 3 + Vite 开发的现代化花店管理系统，提供完整的前端解决方案。系统集成了商品管理、订单处理、用户管理、会员系统、AI 智能客服等功能，为花店提供全方位的数字化运营支持。

## 核心功能

### 1. 用户系统
- 用户注册/登录
- 个人中心管理
- 会员等级系统
- 积分管理
- 地址管理

### 2. 商品管理
- 花卉商品展示
- 商品分类
- 商品搜索
- 收藏功能
- 商品详情

### 3. 订单系统
- 购物车
- 订单创建
- 订单跟踪
- 订单历史
- 支付集成

### 4. 会员系统
- VIP 会员管理
- 积分兑换
- 会员特权
- 优惠券管理

### 5. 智能客服
- AI 智能问答
- 实时对话
- 智能推荐
- 问题解答

### 6. 管理后台
- 数据统计面板
- 商品管理
- 订单管理
- 用户管理
- 优惠券管理

## 技术栈
- 前端框架：Vue 3
- 构建工具：Vite
- UI 组件库：Element Plus
- 状态管理：Pinia
- 路由管理：Vue Router
- 动画效果：Animate.css
- HTTP 客户端：Axios
- 工具库：VueUse

## 项目依赖

### 核心依赖
```json
{
  "dependencies": {
    "@vueuse/core": "^13.2.0",    // Vue 组合式 API 工具集
    "animate.css": "^4.1.1",      // CSS 动画库
    "axios": "^1.9.0",            // HTTP 客户端
    "element-plus": "^2.9.10",    // UI 组件库
    "pinia": "^3.0.2",            // 状态管理
    "pinia-plugin-persistedstate": "^4.3.0",  // Pinia 持久化插件
    "vue": "^3.5.13",             // Vue 3 核心库
    "vue-router": "^4.5.1"        // Vue 路由
  }
}
```

### 开发依赖
```json
{
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.3",        // Vite Vue 插件
    "vite": "^6.2.4",                      // 构建工具
    "vite-plugin-vue-devtools": "^7.7.2"   // Vue 开发工具
  }
}
```

## 项目结构
```
src/
├── assets/        # 静态资源
├── components/    # 公共组件
├── layouts/       # 布局组件
├── pages/         # 页面组件
│   ├── admin/     # 管理后台页面
│   └── ...        # 前台页面
├── router/        # 路由配置
├── stores/        # 状态管理
├── App.vue        # 根组件
└── main.js        # 入口文件
```

## 开发环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0
- Git

## 快速开始

1. 克隆项目
```bash
# 使用 HTTPS
git clone https://github.com/your-username/flower-shop.git

# 或使用 SSH
git clone git@github.com:your-username/flower-shop.git
```

2. 进入项目目录
```bash
cd flower-shop
```

3. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

4. 启动开发服务器
```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev

# 或使用 pnpm
pnpm dev
```

5. 预览生产构建
```bash
# 使用 npm
npm run preview

# 或使用 yarn
yarn preview

# 或使用 pnpm
pnpm preview
```

## 主要页面说明

### 前台页面
- `/` - 首页
- `/login` - 用户登录
- `/register` - 用户注册
- `/flowers` - 花卉展示
- `/order-form` - 订单表单
- `/profile` - 个人中心
- `/vip` - 会员中心
- `/favorites` - 收藏夹
- `/points` - 积分中心
- `/activity` - 活动页面

### 后台页面
- `/admin/dashboard` - 数据统计
- `/admin/flowers` - 商品管理
- `/admin/orders` - 订单管理
- `/admin/users` - 用户管理
- `/admin/coupon` - 优惠券管理

## 特色功能

1. **AI 智能客服**
   - 实时对话
   - 智能推荐
   - 问题解答
   - 个性化服务

2. **会员系统**
   - 多级会员体系
   - 积分奖励机制
   - 专属优惠
   - 会员特权

3. **数据可视化**
   - 销售统计
   - 用户分析
   - 商品分析
   - 实时监控

## 开发规范

1. 代码规范
   - 使用 ESLint 进行代码检查
   - 遵循 Vue 3 组合式 API 规范
   - 使用 TypeScript 进行类型检查

2. 提交规范
   - 遵循 Git Flow 工作流
   - 使用 Conventional Commits 规范
   - 代码审查机制

## 部署说明

### 1. 构建项目
```bash
# 使用 npm
npm run build

# 或使用 yarn
yarn build

# 或使用 pnpm
pnpm build
```

### 2. 部署到服务器

#### 使用 Nginx 部署

1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install nginx
```

2. 配置 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    root /path/to/flower-shop/dist;  # 替换为你的项目构建目录
    index index.html;

    # 开启 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 处理单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

3. 配置 SSL（推荐）
```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com
```

4. 重启 Nginx
```bash
sudo systemctl restart nginx
```

#### 使用 Docker 部署

1. 创建 Dockerfile
```dockerfile
# 构建阶段
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 构建 Docker 镜像
```bash
docker build -t flower-shop .
```

3. 运行容器
```bash
docker run -d -p 80:80 flower-shop
```

### 3. 环境变量配置

创建 `.env` 文件：
```env
VITE_API_BASE_URL=http://your-api-domain.com
VITE_APP_TITLE=花店管理系统
```

### 4. 性能优化建议

1. 开启 Nginx Gzip 压缩
2. 配置适当的缓存策略
3. 使用 CDN 加速静态资源
4. 启用 HTTP/2
5. 配置浏览器缓存

### 5. 监控和维护

1. 配置日志收集
2. 设置性能监控
3. 配置错误追踪
4. 定期备份数据

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## 开源协议
本项目采用 MIT 协议开源，详情请查看 LICENSE 文件。

## 联系方式
如有任何问题或建议，欢迎通过以下方式联系我们：
- 提交 Issue
- 发送邮件至：[19847534107@163.com]
