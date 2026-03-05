# 首页配置化管理说明

## 概述

首页已实现配置化加载和管理，支持游戏定制化上架。通过配置管理器，可以灵活地控制首页显示的游戏、Banner和推荐内容。

## 功能特性

### 1. 配置化数据加载

- **游戏配置化**：所有游戏数据从配置加载，支持动态启用/禁用
- **Banner配置化**：轮播Banner完全可配置，支持游戏链接和路由跳转
- **推荐配置化**：今日推荐游戏可自定义
- **学龄/分类配置化**：学龄和游戏分类支持自定义

### 2. 配置管理器UI

提供可视化的配置管理界面，包含以下功能模块：

- **游戏管理**：
  - 查看所有游戏列表
  - 启用/禁用游戏
  - 调整游戏排序
  - 添加游戏到推荐
  - 编辑游戏信息

- **Banner管理**：
  - 查看Banner列表
  - 启用/禁用Banner
  - 调整Banner排序
  - 编辑Banner内容

- **推荐管理**：
  - 查看今日推荐游戏
  - 从推荐中移除游戏

- **变更日志**：
  - 查看所有配置变更记录
  - 追踪配置修改历史

## 使用方法

### 1. 打开配置管理器

在首页右上角点击"配置"按钮（⚙️图标）即可打开配置管理器。

### 2. 游戏管理

#### 启用/禁用游戏

1. 在"游戏管理"标签页找到目标游戏
2. 点击"状态"列的按钮
3. 游戏状态会立即更新并保存

#### 调整游戏排序

1. 找到需要调整的游戏
2. 在"排序"列输入新的排序值（数字越小越靠前）
3. 修改会自动保存

#### 添加到推荐

1. 确保游戏已启用
2. 点击游戏行右侧的"★"按钮
3. 游戏会被添加到今日推荐列表

### 3. Banner管理

#### 启用/禁用Banner

1. 在"Banner管理"标签页找到目标Banner
2. 点击"状态"列的按钮
3. Banner会在首页轮播中显示/隐藏

### 4. 导出/导入配置

#### 导出配置

1. 在"游戏管理"标签页点击"导出配置"按钮
2. 配置会以JSON格式下载到本地

#### 重置配置

1. 在"游戏管理"标签页点击"重置配置"按钮
2. 确认后配置会恢复到默认值（此操作不可撤销）

## 配置数据结构

### 游戏配置

```typescript
{
  id: string;           // 游戏ID
  name: string;         // 游戏名称
  icon: string;         // 游戏图标
  ageRange: string;     // 适用年龄范围
  category: string;     // 游戏分类
  grades: string[];     // 适用学龄列表
  sceneName?: string;   // 游戏场景名称
  gameUrl?: string;     // 游戏URL
  order: number;        // 排序权重
  enabled: boolean;     // 是否启用
  isNew: boolean;       // 是否新游戏
  isHot: boolean;       // 是否热门
  description?: string; // 游戏描述
  tags?: string[];      // 游戏标签
}
```

### Banner配置

```typescript
{
  id: string;            // Banner ID
  title: string;         // 标题
  description: string;   // 描述
  buttonText: string;    // 按钮文字
  buttonIcon: string;    // 按钮图标
  gameId?: string;       // 关联的游戏ID
  route?: string;        // 关联的页面路由
  backgroundColor?: string; // 背景色
  order: number;         // 排序权重
  enabled: boolean;      // 是否启用
}
```

## API接口

### HomeConfigService

提供配置化数据加载接口：

```typescript
// 获取所有游戏
homeConfigService.getAllGames();

// 获取启用的游戏
homeConfigService.getEnabledGames();

// 根据学龄和分类筛选游戏
homeConfigService.getGamesByGradeAndCategory(grade, category);

// 获取Banner列表
homeConfigService.getBanners();

// 获取今日推荐
homeConfigService.getTodayRecommendGames();

// 搜索游戏
homeConfigService.searchGames(keyword);
```

### HomeConfigManager

提供配置管理接口：

```typescript
// 启用/禁用游戏
homeConfigManager.toggleGameEnabled(gameId, enabled);

// 更新游戏排序
homeConfigManager.updateGameOrders(gameOrders);

// 添加到推荐
homeConfigManager.addToTodayRecommend(gameId, order, reason);

// 从推荐移除
homeConfigManager.removeFromTodayRecommend(gameId);

// 更新Banner
homeConfigManager.updateBanner(bannerId, updates);

// 重置配置
homeConfigManager.resetToDefault();

// 导出配置
homeConfigManager.exportConfig();
```

## 数据持久化

配置数据存储在浏览器的`localStorage`中：

- 配置键：`kids_game_home_config`
- 变更日志键：`kids_game_config_changes`
- 用户偏好键：`kids_game_user_preference`

## 扩展开发

### 添加新游戏

1. 在`home.config.manager.ts`的`DEFAULT_HOME_CONFIG.games`中添加游戏配置
2. 实现对应的游戏场景
3. 在配置管理器中启用游戏

### 自定义分类

1. 在`DEFAULT_HOME_CONFIG.categories`中添加分类配置
2. 在游戏配置中使用新分类

### 自定义学龄

1. 在`DEFAULT_HOME_CONFIG.grades`中添加学龄配置
2. 更新游戏配置中的适用学龄列表

## 注意事项

1. **配置版本**：每次配置更新会自动更新版本号和时间戳
2. **变更追踪**：所有配置操作都会记录到变更日志
3. **数据备份**：定期导出配置以备份数据
4. **兼容性**：修改配置结构时需要考虑向后兼容
5. **性能优化**：大量游戏时注意列表渲染性能

## 常见问题

### Q: 配置修改后不生效？

A: 确保刷新页面后查看，或者检查浏览器控制台是否有错误信息。

### Q: 如何恢复默认配置？

A: 在配置管理器中点击"重置配置"按钮。

### Q: 配置数据会丢失吗？

A: 配置存储在浏览器的localStorage中，清除浏览器数据会丢失配置，建议定期导出备份。

### Q: 可以在不同设备间同步配置吗？

A: 目前配置仅存储在本地浏览器中，未来可以扩展为云端同步。

## 技术架构

```
src/
├── config/
│   ├── home.types.ts              # 配置类型定义
│   ├── home.config.manager.ts     # 配置管理器
│   ├── game.config.ts             # 游戏全局配置
│   └── constant.ts                # 常量定义
├── services/
│   └── home.config.service.ts     # 配置化加载服务
└── pages/
    └── home/
        ├── home.ts                # 首页主逻辑（已优化使用配置）
        ├── config-manager/
        │   ├── config-manager.ts  # 配置管理器UI
        │   └── config-manager.css # 配置管理器样式
        └── styles/
            └── home.css           # 首页样式
```

## 未来规划

- [ ] 支持配置云端同步
- [ ] 添加配置版本对比功能
- [ ] 支持批量操作（批量启用/禁用游戏）
- [ ] 添加配置导入/导出界面
- [ ] 支持配置模板
- [ ] 添加配置预览功能
