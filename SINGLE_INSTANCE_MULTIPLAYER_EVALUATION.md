# 同一游戏实例双人模式 - 技术评估报告

## 📋 需求分析

### 当前需求
在**同一个游戏实例**中实现双人游戏，两个玩家：
- 共享同一个屏幕和画布
- 可以同时操作（各自独立）
- 实时看到对方的游戏状态
- 不需要创建多个 Phaser 实例

### 与现有方案的对比

| 特性 | 当前双屏方案 | 单实例双人方案 |
|------|-------------|----------------|
| 实例数量 | 2个独立Phaser实例 | 1个共享实例 |
| 屏幕布局 | 两个独立画布容器 | 一个共享画布 |
| 内存占用 | 较高 | 较低 |
| 资源加载 | 重复加载 | 共享加载 |
| 实现复杂度 | 简单（自动克隆） | 复杂（需要改造） |
| 游戏改造 | 无需改造 | 需要改造 |
| 性能 | 较好 | 更好 |
| 适用场景 | 竞技类游戏 | 合作类/竞技类游戏 |

---

## 🔍 当前架构评估

### 现有架构分析

```
当前架构层次：
┌─────────────────────────────────────┐
│   BattleSelectScene                  │
│   (选择模式：单人/对战/双屏)          │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ Single Mode  │  │ Dual-Screen   │
│ (单人模式)    │  │ (双屏模式)    │
│ 单Phaser实例  │  │ 双Phaser实例  │
└──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ GameScene    │
│ (BaseBattleScene)│
│ 继承层次：    │
│ - BaseScene  │
│   - BaseBattleScene │
│     - GameScene     │
└──────────────┘
```

### 现有基类分析

#### 1. BaseScene
- **职责**: 基础场景功能（相机管理、输入管理等）
- **特点**: 轻量级，通用性强

#### 2. BaseBattleScene
- **职责**: 对战模式基础逻辑
- **功能**:
  - 玩家管理（player1, player2）
  - 玩家切换（switchPlayer）
  - 分数管理
  - **当前实现**: 回合制对战（轮流玩）

#### 3. PureGameScene
- **职责**: 纯游戏场景基类
- **特点**: 事件驱动，游戏逻辑与UI分离
- **适用**: 新的游戏开发

#### 4. SplitScreenScene
- **职责**: 分屏场景基类
- **功能**: 分屏布局、独立玩家状态
- **适用**: 双屏独立实例模式

### 架构优势

✅ **优点**:
1. **清晰的继承层次**: BaseScene → BaseBattleScene → GameScene
2. **职责分离**: 对战逻辑、游戏逻辑、渲染逻辑分离
3. **事件驱动**: 使用 EventBus 解耦
4. **易于扩展**: 添加新游戏只需继承基类
5. **零侵入**: 双屏方案不修改原游戏

### 架构局限

❌ **局限**:
1. **BaseBattleScene 限制**: 只支持回合制对战（轮流玩）
2. **单实例双人支持不足**: 没有同时操作的设计
3. **输入管理**: 没有多玩家独立输入处理
4. **状态同步**: 没有实时状态同步机制

---

## 🎯 单实例双人模式需求

### 核心需求

1. **输入管理**
   - 玩家1：键盘 WASD 或自定义键位
   - 玩家2：键盘方向键或自定义键位
   - 触屏：多点触控支持

2. **游戏状态**
   - 每个玩家独立的分数、位置、状态
   - 共享的游戏世界、题目、道具等

3. **UI布局**
   - 单屏幕，两个玩家的UI区域
   - 独立的分数显示、状态显示
   - 共享的游戏区域

4. **交互逻辑**
   - 两个玩家可以同时操作
   - 实时反馈对方的状态
   - 可选：合作或竞技模式

### 适用游戏类型

#### ✅ 适合单实例双人模式的游戏

1. **合作类游戏**
   - 双人共同完成任务
   - 互相配合解谜
   - 协作类小游戏

2. **竞技类游戏（实时）**
   - 竞速游戏
   - 反应速度比拼
   - 实时对战

3. **休闲游戏**
   - 简单的点击类游戏
   - 问答游戏（各自答题）
   - 收集类游戏

#### ❌ 不适合单实例双人模式的游戏

1. **复杂操作游戏**
   - 需要复杂按键组合
   - 需要鼠标精确操作
   - 需要拖拽操作

2. **高并发游戏**
   - 需要大量对象同时处理
   - 需要复杂的碰撞检测
   - 需要精细的物理引擎

---

## 🔧 技术方案评估

### 方案1: 扩展现有架构（推荐）

#### 架构设计

```
新增基类：MultiPlayerScene
    ↓
扩展 BaseBattleScene 支持同时操作
    ↓
游戏场景继承 MultiPlayerScene
    ↓
实现独立输入处理和状态管理
```

#### 实现步骤

1. **创建 MultiPlayerScene 基类**
   ```typescript
   export abstract class MultiPlayerScene extends BaseScene {
     protected players: Map<PlayerId, PlayerState> = new Map();
     protected inputManagers: Map<PlayerId, InputManager> = new Map();

     // 独立输入处理
     protected abstract handlePlayerInput(
       playerId: PlayerId,
       action: InputAction
     ): void;

     // 独立状态更新
     protected abstract updatePlayerState(
       playerId: PlayerId,
       state: PlayerState
     ): void;

     // UI布局（单屏幕双人）
     protected abstract createMultiPlayerUI(): void;
   }
   ```

2. **扩展输入管理**
   ```typescript
   class InputManager {
     private keyBindings: Map<PlayerId, KeyBinding> = new Map();

     bindKeys(playerId: PlayerId, keys: KeyBinding): void;
     handleInput(event: KeyboardEvent): void;
     getActivePlayer(): PlayerId;
   }
   ```

3. **修改现有游戏场景**
   - 颜色游戏：为每个玩家创建独立的颜色按钮区域
   - 形状游戏：为每个玩家创建独立的形状区域
   - 数学游戏：为每个玩家显示独立的问题

#### 优点
✅ **复用现有架构**: 基于现有的 BaseScene 和 BaseBattleScene
✅ **渐进式改造**: 可以逐步迁移游戏
✅ **保持兼容**: 不影响现有的单人模式和对战模式
✅ **性能优化**: 单实例，内存占用低

#### 缺点
❌ **需要改造游戏**: 每个游戏需要适配双人UI
❌ **输入管理复杂**: 需要处理多个玩家的独立输入
❌ **开发成本**: 需要重新设计游戏UI和交互

---

### 方案2: 混合架构

#### 架构设计

```
┌─────────────────────────────────────┐
│   BattleSelectScene                  │
│   (选择模式：单人/对战/双屏/双人)    │
└──────────────┬──────────────────────┘
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
┌──────────┐ ┌──────┐ ┌──────────┐
│ Single   │ │Dual- │ │ Multi-   │
│          │ │Screen│ │ Player   │
│ (单人)   │ │(双屏)│ │ (单实例) │
└──────────┘ └──────┘ └──────────┘
```

#### 实现方式

- **保留现有双屏方案**: 适用于竞技类游戏
- **新增单实例双人**: 适用于合作类游戏
- **共享基础设施**: 事件总线、状态管理、输入系统

#### 优点
✅ **灵活性**: 可以根据游戏类型选择合适的模式
✅ **向后兼容**: 不影响现有功能
✅ **渐进式**: 可以逐步实现

#### 缺点
❌ **复杂度增加**: 需要维护两套系统
❌ **代码重复**: 可能有重复的逻辑

---

### 方案3: 游戏适配器模式

#### 架构设计

```typescript
// 游戏适配器接口
interface GameAdapter {
  // 将单人游戏适配为双人游戏
  adaptToMultiPlayer(): void;

  // 创建双人UI布局
  createMultiPlayerLayout(): void;

  // 处理双人输入
  handleMultiPlayerInput(playerId: PlayerId, input: any): void;
}

// 为每个游戏创建适配器
class ColorGameAdapter implements GameAdapter {
  adaptToMultiPlayer(): void {
    // 将颜色游戏适配为双人模式
  }
}
```

#### 优点
✅ **无侵入性**: 不修改原游戏代码
✅ **可插拔**: 可以为每个游戏单独实现适配器
✅ **易于测试**: 可以独立测试适配器

#### 缺点
❌ **适配成本**: 每个游戏需要单独开发适配器
❌ **局限性**: 复杂游戏可能无法通过适配器实现

---

## 📊 综合评估

### 方案对比

| 评估维度 | 方案1: 扩展现有架构 | 方案2: 混合架构 | 方案3: 适配器模式 |
|---------|------------------|----------------|----------------|
| 实现难度 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 较高 | ⭐⭐⭐⭐ 较高 |
| 开发成本 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ 很高 | ⭐⭐⭐⭐⭐ 很高 |
| 性能 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 很好 | ⭐⭐⭐⭐ 很好 |
| 可维护性 | ⭐⭐⭐⭐ 很好 | ⭐⭐⭐ 中等 | ⭐⭐⭐ 中等 |
| 灵活性 | ⭐⭐⭐⭐ 很好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 很好 |
| 代码侵入性 | ⭐⭐⭐ 较高 | ⭐⭐ 低 | ⭐ 最低 |

### 推荐方案

#### 🥇 首选：方案1 - 扩展现有架构

**理由**:
1. **平衡性好**: 在性能、开发成本、可维护性之间取得平衡
2. **架构清晰**: 基于现有的继承体系，易于理解和维护
3. **渐进式**: 可以先实现一个游戏，验证效果后再推广
4. **性能优秀**: 单实例模式，内存占用低

**适用场景**:
- 大部分适合双人模式的游戏
- 需要高性能的场景
- 长期维护的项目

#### 🥈 备选：方案2 - 混合架构

**理由**:
1. **灵活性高**: 可以根据游戏类型选择最合适的模式
2. **向后兼容**: 保留现有功能，降低风险
3. **渐进演进**: 可以逐步实现，不急于求成

**适用场景**:
- 有多种游戏类型的平台
- 需要支持多种对战模式
- 需要长期演进的项目

#### 🥉 特殊场景：方案3 - 适配器模式

**理由**:
1. **无侵入**: 不修改原游戏代码
2. **灵活**: 可以为每个游戏定制适配器

**适用场景**:
- 不想修改原游戏代码
- 游戏逻辑简单，易于适配
- 快速原型验证

---

## 🛠️ 实施建议

### 阶段1: 基础设施（1-2周）

1. **创建 MultiPlayerScene 基类**
   ```typescript
   src/core/multi-player.scene.ts
   ```
   - 独立玩家状态管理
   - 输入管理器
   - 双人UI布局基类

2. **创建 InputManager**
   ```typescript
   src/core/input-manager.ts
   ```
   - 多玩家键位绑定
   - 输入事件分发
   - 触屏支持

3. **扩展 GameMode 枚举**
   ```typescript
   enum GameMode {
     SINGLE = 'single',
     BATTLE = 'battle',      // 回合制
     DUAL_SCREEN = 'dual-screen', // 双屏独立实例
     MULTI_PLAYER = 'multi-player', // 单实例双人
   }
   ```

### 阶段2: 试点游戏（1周）

选择一个简单的游戏作为试点（建议：颜色游戏）：

1. **改造 ColorGameScene**
   - 继承 MultiPlayerScene
   - 创建双人UI布局
   - 实现独立输入处理

2. **测试验证**
   - 功能测试
   - 性能测试
   - 用户体验测试

### 阶段3: 推广实施（2-3周）

1. **改造其他游戏**
   - 形状游戏
   - 数学游戏
   - 其他适合的游戏

2. **优化完善**
   - 性能优化
   - UI优化
   - 用户体验优化

3. **文档编写**
   - 开发文档
   - 使用指南
   - 最佳实践

### 阶段4: 持续优化（长期）

1. **收集反馈**
2. **性能监控**
3. **功能迭代**

---

## 📝 代码示例

### MultiPlayerScene 基类示例

```typescript
// src/core/multi-player.scene.ts
import { BaseScene } from './scene.base';
import { PlayerId, PlayerState, InputAction } from './events/game-events';

/**
 * 多玩家场景基类
 * 支持在单个游戏实例中实现多人游戏
 */
export abstract class MultiPlayerScene extends BaseScene {
  /** 玩家状态映射 */
  protected players: Map<PlayerId, PlayerState> = new Map();

  /** 输入管理器 */
  protected inputManager!: InputManager;

  /** 玩家数量 */
  protected playerCount: number = 2;

  /**
   * 初始化场景
   */
  public init(data: { mode: string; players: Player[] }): void {
    super.init(data);

    // 初始化玩家状态
    data.players.forEach((player) => {
      this.players.set(player.id as PlayerId, {
        id: player.id as PlayerId,
        name: player.name,
        score: player.score,
        color: player.color,
        position: { x: 0, y: 0 },
        isActive: true,
      });
    });

    // 初始化输入管理器
    this.inputManager = new InputManager(this, this.playerCount);
  }

  /**
   * 创建场景
   */
  public create(): void {
    super.create();

    // 创建多玩家UI布局
    this.createMultiPlayerUI();

    // 设置输入监听
    this.setupInputListeners();

    // 开始游戏
    this.startGame();
  }

  /**
   * 创建多玩家UI布局（抽象方法）
   */
  protected abstract createMultiPlayerUI(): void;

  /**
   * 开始游戏（抽象方法）
   */
  protected abstract startGame(): void;

  /**
   * 处理玩家输入（抽象方法）
   */
  protected abstract handlePlayerInput(
    playerId: PlayerId,
    action: InputAction
  ): void;

  /**
   * 更新玩家状态（抽象方法）
   */
  protected abstract updatePlayerState(
    playerId: PlayerId,
    state: PlayerState
  ): void;

  /**
   * 设置输入监听
   */
  private setupInputListeners(): void {
    // 玩家1输入
    this.inputManager.on('player1:input', (action) => {
      this.handlePlayerInput(1 as PlayerId, action);
    });

    // 玩家2输入
    this.inputManager.on('player2:input', (action) => {
      this.handlePlayerInput(2 as PlayerId, action);
    });
  }

  /**
   * 更新场景
   */
  public update(_time: number, _delta: number): void {
    // 更新所有玩家状态
    this.players.forEach((state, playerId) => {
      if (state.isActive) {
        this.updatePlayerState(playerId, state);
      }
    });
  }
}

/**
 * 输入管理器
 */
class InputManager extends Phaser.Events.EventEmitter {
  private keyBindings: Map<PlayerId, KeyBinding> = new Map();

  constructor(private scene: Phaser.Scene, private playerCount: number) {
    super();
    this.setupDefaultKeyBindings();
  }

  /**
   * 设置默认键位绑定
   */
  private setupDefaultKeyBindings(): void {
    // 玩家1: WASD
    this.keyBindings.set(1 as PlayerId, {
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      action: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // 玩家2: 方向键
    this.keyBindings.set(2 as PlayerId, {
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      action: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });

    // 设置键盘监听
    this.setupKeyboardListeners();
  }

  /**
   * 设置键盘监听
   */
  private setupKeyboardListeners(): void {
    const keyboard = this.scene.input.keyboard!;

    keyboard.on('keydown', (event: KeyboardEvent) => {
      const action = this.getActionForKey(event.code);
      const playerId = this.getPlayerIdForKey(event.code);

      if (action && playerId) {
        this.emit(`player${playerId}:input`, action);
      }
    });
  }

  /**
   * 获取按键对应的动作
   */
  private getActionForKey(keyCode: number): InputAction | null {
    for (const [playerId, binding] of this.keyBindings) {
      if (Object.values(binding).includes(keyCode)) {
        return Object.keys(binding).find(
          (key) => (binding as any)[key] === keyCode
        ) as InputAction;
      }
    }
    return null;
  }

  /**
   * 获取按键对应的玩家ID
   */
  private getPlayerIdForKey(keyCode: number): PlayerId | null {
    for (const [playerId, binding] of this.keyBindings) {
      if (Object.values(binding).includes(keyCode)) {
        return playerId;
      }
    }
    return null;
  }
}

interface KeyBinding {
  up: number;
  down: number;
  left: number;
  right: number;
  action: number;
}
```

### 改造后的颜色游戏示例

```typescript
// src/games/color-game/scenes/multi-player.game.scene.ts
import { MultiPlayerScene } from '@/core/multi-player.scene';
import { PlayerId, InputAction } from '@/core/events/game-events';

/**
 * 颜色游戏 - 多人模式
 */
export class MultiPlayerColorGameScene extends MultiPlayerScene {
  private targetColor: string = '';
  private player1Buttons: Phaser.GameObjects.Rectangle[] = [];
  private player2Buttons: Phaser.GameObjects.Rectangle[] = [];
  private player1ScoreText?: Phaser.GameObjects.Text;
  private player2ScoreText?: Phaser.GameObjects.Text;

  constructor() {
    super('MultiPlayerColorGameScene');
  }

  /**
   * 创建多玩家UI布局
   */
  protected createMultiPlayerUI(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建分割线
    const divider = this.add.rectangle(width / 2, height / 2, 4, height, 0x333333);

    // 玩家1区域（左侧）
    this.createPlayer1Area(width / 4, height / 2);

    // 玩家2区域（右侧）
    this.createPlayer2Area(width * 0.75, height / 2);

    // 创建共享目标颜色
    this.createTargetColor(width / 2, 100);
  }

  /**
   * 创建玩家1区域
   */
  private createPlayer1Area(centerX: number, centerY: number): void {
    // 玩家1分数
    this.player1ScoreText = this.add.text(centerX - 200, 50, '玩家1: 0', {
      font: 'bold 24px Arial',
      color: '#FF6B6B',
    });

    // 玩家1颜色按钮
    const colors = ['#FF6B6B', '#4A90E2', '#95E1D3', '#FFE66D'];
    colors.forEach((color, index) => {
      const button = this.add.rectangle(
        centerX,
        centerY + index * 80,
        100,
        60,
        parseInt(color.replace('#', '0x'))
      );
      button.setInteractive({ useHandCursor: true });

      // 为玩家1绑定按键
      const keys = ['A', 'S', 'D', 'F'];
      const text = this.add.text(centerX, centerY + index * 80, keys[index], {
        font: 'bold 24px Arial',
        color: '#ffffff',
      });
      text.setOrigin(0.5);

      this.player1Buttons.push(button);
    });
  }

  /**
   * 创建玩家2区域
   */
  private createPlayer2Area(centerX: number, centerY: number): void {
    // 玩家2分数
    this.player2ScoreText = this.add.text(centerX + 100, 50, '玩家2: 0', {
      font: 'bold 24px Arial',
      color: '#4A90E2',
    });

    // 玩家2颜色按钮
    const colors = ['#FF6B6B', '#4A90E2', '#95E1D3', '#FFE66D'];
    colors.forEach((color, index) => {
      const button = this.add.rectangle(
        centerX,
        centerY + index * 80,
        100,
        60,
        parseInt(color.replace('#', '0x'))
      );
      button.setInteractive({ useHandCursor: true });

      // 为玩家2绑定按键
      const keys = ['J', 'K', 'L', ';'];
      const text = this.add.text(centerX, centerY + index * 80, keys[index], {
        font: 'bold 24px Arial',
        color: '#ffffff',
      });
      text.setOrigin(0.5);

      this.player2Buttons.push(button);
    });
  }

  /**
   * 创建目标颜色
   */
  private createTargetColor(x: number, y: number): void {
    this.targetColor = '#FF6B6B';

    const targetBlock = this.add.rectangle(x, y, 150, 100, 0xFF6B6B);
    const label = this.add.text(x, y, '目标颜色', {
      font: 'bold 20px Arial',
      color: '#ffffff',
    });
    label.setOrigin(0.5);
  }

  /**
   * 开始游戏
   */
  protected startGame(): void {
    this.generateQuestion();
  }

  /**
   * 生成题目
   */
  private generateQuestion(): void {
    // 生成随机目标颜色
    const colors = ['#FF6B6B', '#4A90E2', '#95E1D3', '#FFE66D'];
    this.targetColor = colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 处理玩家输入
   */
  protected handlePlayerInput(playerId: PlayerId, action: InputAction): void {
    console.log(`玩家${playerId}输入:`, action);

    // 根据输入选择颜色
    const colorMap: Record<string, string> = {
      up: '#FF6B6B',
      left: '#4A90E2',
      down: '#95E1D3',
      right: '#FFE66D',
    };

    const selectedColor = colorMap[action];

    if (selectedColor === this.targetColor) {
      // 答对了，加分
      const player = this.players.get(playerId);
      if (player) {
        player.score += 10;
        this.updateScoreDisplay();
        this.generateQuestion();
      }
    }
  }

  /**
   * 更新分数显示
   */
  private updateScoreDisplay(): void {
    const player1 = this.players.get(1 as PlayerId);
    const player2 = this.players.get(2 as PlayerId);

    if (this.player1ScoreText && player1) {
      this.player1ScoreText.setText(`玩家1: ${player1.score}`);
    }

    if (this.player2ScoreText && player2) {
      this.player2ScoreText.setText(`玩家2: ${player2.score}`);
    }
  }

  /**
   * 更新玩家状态
   */
  protected updatePlayerState(playerId: PlayerId, state: PlayerState): void {
    // 更新玩家状态
    this.players.set(playerId, state);
  }
}
```

---

## 🎯 最终建议

### 推荐采用：方案1 - 扩展现有架构

#### 理由

1. **架构兼容性**
   - 不破坏现有的继承体系
   - 可以与现有的单人和双屏模式共存
   - 渐进式实施，降低风险

2. **性能优势**
   - 单实例模式，内存占用低
   - 共享资源，加载效率高
   - 更适合儿童游戏平台（性能要求高）

3. **开发效率**
   - 基于现有架构，减少重复开发
   - 清晰的基类设计，易于理解和维护
   - 可以先实现一个游戏作为试点

4. **长期维护**
   - 清晰的代码结构
   - 良好的扩展性
   - 便于后续功能迭代

### 实施策略

#### 阶段1: 基础设施（1-2周）
- 创建 MultiPlayerScene 基类
- 实现输入管理器
- 扩展 GameMode 枚举

#### 阶段2: 试点验证（1周）
- 改造颜色游戏
- 功能测试和性能测试
- 收集反馈并优化

#### 阶段3: 全面推广（2-3周）
- 改造其他适合的游戏
- 优化用户体验
- 编写文档和最佳实践

#### 阶段4: 持续优化（长期）
- 性能监控和优化
- 收集用户反馈
- 功能迭代和改进

---

## 📋 总结

### 是否需要重构？

**答案：不需要大重构，但需要扩展**

#### 当前架构的优势
✅ 清晰的继承层次
✅ 良好的职责分离
✅ 事件驱动的设计
✅ 易于扩展

#### 需要扩展的部分
✅ 新增 MultiPlayerScene 基类
✅ 新增 InputManager 输入管理
✅ 扩展 GameMode 枚举
✅ 改造部分游戏场景

#### 不需要改变的部分
✅ 现有的 BaseScene 和 BaseBattleScene
✅ 事件总线系统
✅ 双屏方案（保留作为独立模式）
✅ 单人模式逻辑

### 最终架构

```
┌─────────────────────────────────────────┐
│         BattleSelectScene                │
│   (单人/对战/双屏/单实例双人)            │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┐
    ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Single  │ │Battle  │ │Dual-   │ │Multi-  │
│        │ │(回合)  │ │Screen  │ │Player  │
│Base    │ │Base    │ │Dual-   │ │Multi-  │
│Scene   │ │Battle  │ │Screen  │ │Player  │
│        │ │Scene   │ │Adapter │ │Scene   │
└────────┘ └────────┘ └────────┘ └────────┘
```

这样的架构既保持了现有代码的稳定性，又为未来的扩展提供了清晰的方向。🎉
