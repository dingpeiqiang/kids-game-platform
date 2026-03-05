# 玩家2登录输入框修复说明

## 问题描述

玩家2登录场景中的输入框无法输入字符，导致无法完成登录流程。

## 根本原因

1. **初始状态问题**：`isUsernameFocused` 和 `isPasswordFocused` 初始值都为 `false`，导致键盘输入事件被 `return` 语句阻止。

2. **引用问题**：`this.inputBox` 只保存了用户名输入框的引用，无法正确更新密码输入框的显示。

3. **点击检测问题**：点击外部取消聚焦时，只检测了 `this.inputBox` 的范围，没有检测密码输入框的范围。

4. **容器引用问题**：密码输入框的容器没有保存到实例变量，导致无法访问。

## 修复方案

### 1. 添加实例变量

```typescript
// 输入状态
private username = '';
private password = '';
private isUsernameFocused = false;
private isPasswordFocused = false;
private isLoggingIn = false;
private currentInputMode: 'username' | 'password' = 'username';
private usernameContainer?: Phaser.GameObjects.Container;  // 新增
private passwordContainer?: Phaser.GameObjects.Container;  // 新增
```

### 2. 保存输入框引用

在 `createInput()` 方法中：

```typescript
// 保存用户名输入框的引用
this.usernameContainer = this.add.container(centerX, startY);
// ... 添加元素 ...

// 保存密码输入框的引用
this.passwordContainer = this.add.container(centerX, passwordY);
// ... 添加元素 ...
```

### 3. 修改键盘输入处理

在 `setupInputHandlers()` 方法中，添加自动聚焦逻辑：

```typescript
// 键盘输入
this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
  // 允许输入，即使没有聚焦
  if (!this.isUsernameFocused && !this.isPasswordFocused) {
    // 如果用户直接开始输入，自动聚焦到用户名输入框
    if (event.key.length === 1 && /[a-zA-Z0-9\u4e00-\u9fa5]/.test(event.key)) {
      this.currentInputMode = 'username';
      this.isUsernameFocused = true;
    }
  }

  // ... 其他逻辑 ...
});
```

### 4. 修复点击外部检测

```typescript
// 点击外部取消聚焦
this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
  const usernameBounds = this.usernameContainer?.getBounds();
  const passwordBounds = this.passwordContainer?.getBounds();

  const insideUsername = usernameBounds && Phaser.Geom.Rectangle.Contains(usernameBounds, pointer.x, pointer.y);
  const insidePassword = passwordBounds && Phaser.Geom.Rectangle.Contains(passwordBounds, pointer.x, pointer.y);

  if (!insideUsername && !insidePassword) {
    this.isUsernameFocused = false;
    this.isPasswordFocused = false;
    this.updateInputDisplay();
  }
});
```

### 5. 修复输入显示更新

```typescript
private updateInputDisplay(): void {
  // 更新用户名输入框
  if (this.usernameContainer) {
    const usernameText = this.usernameContainer.list[2] as Phaser.GameObjects.Text;
    if (usernameText) {
      if (this.username.length === 0) {
        usernameText.setText('输入昵称（3-10个字符）');
        usernameText.setColor(this.isUsernameFocused ? '#333333' : '#CCCCCC');
      } else {
        usernameText.setText(this.username);
        usernameText.setColor(this.isUsernameFocused ? '#333333' : '#666666');
      }
    }
  }

  // 更新密码输入框
  if (this.passwordContainer) {
    const passwordText = this.passwordContainer.list[2] as Phaser.GameObjects.Text;
    if (passwordText) {
      if (this.password.length === 0) {
        passwordText.setText('输入密码（4个字符以上）');
        passwordText.setColor(this.isPasswordFocused ? '#333333' : '#CCCCCC');
      } else {
        passwordText.setText('●'.repeat(this.password.length));
        passwordText.setColor(this.isPasswordFocused ? '#333333' : '#666666');
      }
    }
  }

  this.updateCursorPosition();
}
```

## 修复后的功能

### 输入行为

1. **自动聚焦**：用户开始输入时，自动聚焦到用户名输入框
2. **点击聚焦**：点击输入框可以切换焦点
3. **Tab 切换**：使用 Tab 键在用户名和密码输入框之间切换
4. **输入反馈**：输入时显示光标和文本
5. **密码隐藏**：密码以圆点（●）显示

### 键盘快捷键

- `Tab`：在昵称和密码输入框之间切换
- `Enter`：提交登录
- `Backspace`：删除字符
- 直接输入：自动聚焦并开始输入

### 交互改进

- 输入框点击后正确聚焦
- 点击输入框外部取消聚焦
- 光标正确显示在当前输入框
- 占位符文本在聚焦时变化颜色

## 测试步骤

1. 启动开发服务器：`npm run dev`
2. 访问：`http://localhost:3002/`
3. 玩家1登录：输入昵称"小明"
4. 选择游戏：颜色游戏
5. 选择模式：双人对战
6. 测试输入框：
   - 点击昵称输入框，输入"小红"
   - 点击密码输入框，输入"123456"
   - 使用 Tab 键切换输入框
   - 点击"开始对战"按钮
7. 验证游戏正常启动

## 注意事项

1. 输入字符限制：
   - 昵称：3-10个字符
   - 密码：至少4个字符

2. 支持的字符：
   - 中文（\u4e00-\u9fa5）
   - 英文字母（a-zA-Z）
   - 数字（0-9）

3. 防止重复提交：
   - 登录过程中禁用按钮
   - 设置 `isLoggingIn` 状态标志

## 后续优化建议

1. **密码强度验证**：添加密码强度检测
2. **输入限制**：限制密码只能输入特定字符
3. **自动切换**：昵称输入达到最大长度后自动跳到密码输入框
4. **错误提示**：更详细的错误提示信息
5. **输入历史**：保存最近使用的用户名

## 相关文件

- `src/scenes/player2-login.scene.ts`：玩家2登录场景
- `src/core/battle-select.scene.ts`：模式选择场景
- `src/main.ts`：主入口（场景注册）
- `src/services/user.service.ts`：用户管理服务
