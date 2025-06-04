# 花店项目

## 项目描述

这是一个模拟的在线花店项目，包含用户端和管理员端。用户可以在线浏览花束、积分商品，下订单，进行收藏和简单的 AI 聊天互动。管理员可以管理商品、订单、用户和积分商品。

## 技术栈

### 前端

*   Vue 3
*   Element Plus
*   Axios

### 后端 (假设)

*   Java/Spring Boot (根据 API 地址推测)
*   数据库 (例如 MySQL)

## 项目设置

### 前端设置

1.  确保您已安装 Node.js 和 npm 或 yarn。
2.  导航到 `flower-shop` 目录。
3.  安装依赖：
    ```bash
    npm install
    # 或者
    yarn install
    ```

### 后端设置 (假设)

1.  导入后端项目到您的 IDE (例如 IntelliJ IDEA)。
2.  配置数据库连接信息 (通常在 `application.properties` 或 `application.yml` 文件中)。
3.  运行数据库迁移脚本 (如果提供)。
4.  构建并运行后端项目。

## 运行项目

### 运行前端

导航到 `flower-shop` 目录，然后运行：

```bash
npm run serve
# 或者
yarn serve
```

前端应用程序将在 `http://localhost:8080/` (或控制台输出的其他地址) 运行。

### 运行后端 (假设)

通过 IDE 或命令行运行 Spring Boot 主应用程序类。

## API 接口

项目通过 RESTful API 与后端进行交互。主要接口包括：

*   `/product/getall`: 获取花束列表
*   `/product/getflower`: 获取花束详情
*   `/point/allpointsproducts`: 获取积分商品列表
*   `/point/addpointsproducts`: 添加积分商品
*   `/point/updatepointsproducts`: 更新积分商品
*   `/like/getcollection`: 获取用户收藏列表
*   `/like/addcollection`: 添加收藏
*   `/like/delcollection`: 取消收藏
*   `/bot/ask`: AI 聊天接口

(请注意：API 地址和具体路径可能需要根据实际后端项目进行调整和完善。)

## - 最优优惠券算法（贪心策略）

OrderForm.vue 文件。在这个页面中，最优优惠券的算法逻辑主要实现在 calculateOptimalCoupon 函数中。
这个函数的作用是：
接收一个可用优惠券列表作为输入。
遍历每一个优惠券。
检查优惠券是否满足当前订单的总金额（rawTotalAmount.value >= coupon.minAmount）。
如果满足条件，根据优惠券的类型（满减或折扣）计算出该优惠券能提供的折扣金额。
比较当前优惠券的折扣金额与目前找到的最大折扣金额。
如果当前优惠券的折扣更大，则更新最大折扣金额和最优优惠券。
最终，将计算出的最优优惠券的 ID 赋值给 optimalCouponId.value，以便在界面上进行标记。

具体的算法实现细节请参考后端项目的相关代码（例如，处理订单计算或优惠券服务的模块）。

## 项目结构 (可选)

```
.
├── flower-shop/         # 前端 Vue 项目
│   ├── public/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── stores/
│   │   └── App.vue
│   ├── package.json
│   └── ...
├── backend/             # 后端项目 (假设)
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── pom.xml (或 build.gradle)
│   └── ...
└── README.md
```
