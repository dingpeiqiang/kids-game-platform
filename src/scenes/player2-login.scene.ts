/**
 * 玩家2登录场景
 * 用于双人游戏模式中登录第二个玩家
 */

import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';
import { userService } from '@/services/user.service';

export class Player2LoginScene extends BaseScene {
  // UI元素
  private titleText?: Phaser.GameObjects.Text;
  private inputBox?: Phaser.GameObjects.Container;
  private inputText?: Phaser.GameObjects.Text;
  private cursorGraphics?: Phaser.GameObjects.Graphics;
  private submitButton?: Phaser.GameObjects.Container;
  private backButton?: Phaser.GameObjects.Container;
  private player1Info?: Phaser.GameObjects.Container;

  // 输入状态
  private username = '';
  private password = '';
  private isUsernameFocused = false;
  private isPasswordFocused = false;
  private isLoggingIn = false;
  private currentInputMode: 'username' | 'password' = 'username';
  private usernameContainer?: Phaser.GameObjects.Container;
  private passwordContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('Player2LoginScene');
  }

  public create(): void {
    LogUtil.log('Player2LoginScene: 创建玩家2登录场景');

    // 设置背景
    this.cameras.main.setBackgroundColor('#FFE5B4');

    // 获取游戏ID
    const gameId = (window as any).__GAME_ID__ || 'color-game';

    // 创建UI
    this.createTitle();
    this.createPlayer1Info();
    this.createInput();
    this.createButton();
    this.createBackButton();
    this.setupInputHandlers();

    // 光标闪烁动画
    this.startCursorAnimation();
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.12;

    this.titleText = this.add.text(centerX, centerY, '🎮 玩家2 登录', {
      font: `bold ${DeviceUtil.getOptimalFontSize(42)}px "Microsoft YaHei", Arial`,
      color: '#FF6B6B',
    });
    this.titleText.setOrigin(0.5, 0.5);

    const subtitle = this.add.text(centerX, centerY + 45, '请输入第二个玩家的昵称和密码', {
      font: `${DeviceUtil.getOptimalFontSize(18)}px "Microsoft YaHei", Arial`,
      color: '#FFA07A',
    });
    subtitle.setOrigin(0.5, 0.5);

    // 标题动画
    this.tweens.add({
      targets: [this.titleText, subtitle],
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 创建玩家1信息显示
   */
  private createPlayer1Info(): void {
    const player1 = userService.getCurrentUser();
    if (!player1) return;

    const centerX = this.scale.width / 2;
    const y = this.scale.height * 0.23;
    const scale = DeviceUtil.getScaleFactor();

    this.player1Info = this.add.container(centerX, y);
    const width = 500 * scale;
    const height = 70 * scale;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x74B9FF, 0.15);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
    bg.lineStyle(3, 0x74B9FF, 0.5);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);

    // 头像
    const avatar = this.add.text(-width / 2 + 45 * scale, 0, player1.avatar, {
      font: `${45 * scale}px Arial`,
    });
    avatar.setOrigin(0.5, 0.5);

    // 标签
    const label = this.add.text(-width / 2 + 110 * scale, -height * 0.15, '玩家1', {
      font: `${DeviceUtil.getOptimalFontSize(16) * scale}px "Microsoft YaHei", Arial`,
      color: '#74B9FF',
    });
    label.setOrigin(0, 0.5);

    // 用户名
    const username = this.add.text(-width / 2 + 110 * scale, height * 0.15, player1.username, {
      font: `bold ${DeviceUtil.getOptimalFontSize(22) * scale}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    username.setOrigin(0, 0.5);

    // 状态
    const status = this.add.text(width / 2 - 40 * scale, 0, '✓ 已登录', {
      font: `${DeviceUtil.getOptimalFontSize(18) * scale}px "Microsoft YaHei", Arial`,
      color: '#4CAF50',
    });
    status.setOrigin(1, 0.5);

    this.player1Info.add([bg, avatar, label, username, status]);
  }

  /**
   * 创建输入框
   */
  private createInput(): void {
    const centerX = this.scale.width / 2;
    const startY = this.scale.height * 0.35;
    const scale = DeviceUtil.getScaleFactor();
    const inputWidth = 400 * scale;
    const inputHeight = 55 * scale;
    const gap = 20 * scale;

    // 用户名输入框
    this.usernameContainer = this.add.container(centerX, startY);

    const usernameLabel = this.add.text(-inputWidth / 2, -inputHeight / 2 - 15, '昵称', {
      font: `${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: '#666666',
    });
    usernameLabel.setOrigin(0, 1);

    const usernameBg = this.add.graphics();
    usernameBg.fillStyle(0xFFFFFF, 1);
    usernameBg.lineStyle(3, 0xFF6B6B, 1);
    usernameBg.fillRoundedRect(-inputWidth / 2, -inputHeight / 2, inputWidth, inputHeight, 15);
    usernameBg.strokeRoundedRect(-inputWidth / 2, -inputHeight / 2, inputWidth, inputHeight, 15);

    const usernameText = this.add.text(-inputWidth / 2 + 15, 0, '输入昵称（3-10个字符）', {
      font: `${DeviceUtil.getOptimalFontSize(18)}px "Microsoft YaHei", Arial`,
      color: '#CCCCCC',
    });
    usernameText.setOrigin(0, 0.5);

    // 设置交互
    const usernameBgInteractive = usernameBg as any;
    usernameBgInteractive.setInteractive(
      new Phaser.Geom.Rectangle(-inputWidth / 2, -inputHeight / 2, inputWidth, inputHeight),
      Phaser.Geom.Rectangle.Contains
    );

    usernameBgInteractive.on('pointerdown', () => {
      this.currentInputMode = 'username';
      this.isUsernameFocused = true;
      this.isPasswordFocused = false;
      this.updateInputDisplay();
    });

    usernameBgInteractive.on('pointerover', () => {
      this.game.canvas.style.cursor = 'text';
    });

    usernameBgInteractive.on('pointerout', () => {
      this.game.canvas.style.cursor = 'default';
    });

    this.usernameContainer.add([usernameLabel, usernameBg, usernameText]);
    this.inputBox = this.usernameContainer;

    // 密码输入框
    const passwordY = startY + inputHeight + gap + 25;
    this.passwordContainer = this.add.container(centerX, passwordY);

    const passwordLabel = this.add.text(-inputWidth / 2, -inputHeight / 2 - 15, '密码', {
      font: `${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: '#666666',
    });
    passwordLabel.setOrigin(0, 1);

    const passwordBg = this.add.graphics();
    passwordBg.fillStyle(0xFFFFFF, 1);
    passwordBg.lineStyle(3, 0xFF6B6B, 1);
    passwordBg.fillRoundedRect(-inputWidth / 2, -inputHeight / 2, inputWidth, inputHeight, 15);
    passwordBg.strokeRoundedRect(-inputWidth / 2, -inputHeight / 2, inputWidth, inputHeight, 15);

    const passwordText = this.add.text(-inputWidth / 2 + 15, 0, '输入密码（4个字符以上）', {
      font: `${DeviceUtil.getOptimalFontSize(18)}px "Microsoft YaHei", Arial`,
      color: '#CCCCCC',
    });
    passwordText.setOrigin(0, 0.5);

    // 设置交互
    const passwordBgInteractive = passwordBg as any;
    passwordBgInteractive.setInteractive(
      new Phaser.Geom.Rectangle(-inputWidth / 2, -inputHeight / 2, inputWidth, inputHeight),
      Phaser.Geom.Rectangle.Contains
    );

    passwordBgInteractive.on('pointerdown', () => {
      this.currentInputMode = 'password';
      this.isPasswordFocused = true;
      this.isUsernameFocused = false;
      this.updateInputDisplay();
    });

    passwordBgInteractive.on('pointerover', () => {
      this.game.canvas.style.cursor = 'text';
    });

    passwordBgInteractive.on('pointerout', () => {
      this.game.canvas.style.cursor = 'default';
    });

    this.passwordContainer.add([passwordLabel, passwordBg, passwordText]);

    // 光标
    this.cursorGraphics = this.add.graphics();
    this.cursorGraphics.fillStyle(0xFF6B6B, 1);
  }

  /**
   * 创建登录按钮
   */
  private createButton(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.62;
    const scale = DeviceUtil.getScaleFactor();

    this.submitButton = this.add.container(centerX, centerY);

    const buttonWidth = 280 * scale;
    const buttonHeight = 60 * scale;

    // 背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xFF6B6B, 0xFF6B6B, 0xFFA07A, 0xFFA07A, 1);
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 30);

    // 按钮文字
    const buttonText = this.add.text(0, 0, '开始对战', {
      font: `bold ${DeviceUtil.getOptimalFontSize(24)}px "Microsoft YaHei", Arial`,
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5, 0.5);

    this.submitButton.add([bg, buttonText]);

    // 设置交互
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', () => {
      this.handleLogin();
    });

    bg.on('pointerover', () => {
      this.tweens.add({
        targets: this.submitButton,
        scale: 1.05,
        duration: 150,
        ease: 'Quad.Out',
      });
    });

    bg.on('pointerout', () => {
      this.tweens.add({
        targets: this.submitButton,
        scale: 1,
        duration: 150,
        ease: 'Quad.Out',
      });
    });
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const padding = DeviceUtil.getOptimalFontSize(20);

    this.backButton = this.add.container(padding, padding + 25);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.8);
    bg.fillRoundedRect(-50, -20, 100, 40, 12);

    const text = this.add.text(0, 0, '← 返回', {
      font: `bold ${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: '#FF6B6B',
    });
    text.setOrigin(0.5, 0.5);

    this.backButton.add([bg, text]);

    bg.setInteractive(
      new Phaser.Geom.Rectangle(-50, -20, 100, 40),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', () => {
      this.scene.start('BattleSelectScene');
    });

    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xFF6B6B, 1);
      bg.fillRoundedRect(-50, -20, 100, 40, 12);
      text.setColor('#fff');
    });

    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0xFFFFFF, 0.8);
      bg.fillRoundedRect(-50, -20, 100, 40, 12);
      text.setColor('#FF6B6B');
    });
  }

  /**
   * 设置输入处理
   */
  private setupInputHandlers(): void {
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

      if (event.key === 'Enter') {
        this.handleLogin();
        return;
      }

      if (event.key === 'Backspace') {
        if (this.currentInputMode === 'username') {
          this.username = this.username.slice(0, -1);
        } else {
          this.password = this.password.slice(0, -1);
        }
        this.updateInputDisplay();
        return;
      }

      // Tab 切换输入框
      if (event.key === 'Tab') {
        event.preventDefault();
        if (this.currentInputMode === 'username') {
          this.currentInputMode = 'password';
          this.isPasswordFocused = true;
          this.isUsernameFocused = false;
        } else {
          this.currentInputMode = 'username';
          this.isUsernameFocused = true;
          this.isPasswordFocused = false;
        }
        this.updateInputDisplay();
        return;
      }

      // 输入字符
      if (event.key.length === 1 && /[a-zA-Z0-9\u4e00-\u9fa5]/.test(event.key)) {
        if (this.currentInputMode === 'username' && this.username.length < 10) {
          this.username += event.key;
          this.isUsernameFocused = true;
          this.isPasswordFocused = false;
        } else if (this.currentInputMode === 'password' && this.password.length < 20) {
          this.password += event.key;
          this.isPasswordFocused = true;
          this.isUsernameFocused = false;
        }
        this.updateInputDisplay();
      }
    });

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
  }

  /**
   * 更新输入显示
   */
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
          // 密码用圆点显示
          passwordText.setText('●'.repeat(this.password.length));
          passwordText.setColor(this.isPasswordFocused ? '#333333' : '#666666');
        }
      }
    }

    this.updateCursorPosition();
  }

  /**
   * 更新光标位置
   */
  private updateCursorPosition(): void {
    if (!this.cursorGraphics) return;

    this.cursorGraphics.clear();
    this.cursorGraphics.fillStyle(0xFF6B6B, 1);

    const centerX = this.scale.width / 2;
    const scale = DeviceUtil.getScaleFactor();
    const inputWidth = 400 * scale;

    if (this.currentInputMode === 'username' && this.isUsernameFocused) {
      const textWidth = this.username.length * 12 * scale;
      const cursorX = centerX - inputWidth / 2 + 15 + textWidth + 2;
      const cursorY = this.scale.height * 0.35;
      this.cursorGraphics.fillRect(cursorX, cursorY - 15, 2, 30);
    } else if (this.currentInputMode === 'password' && this.isPasswordFocused) {
      const textWidth = this.password.length * 12 * scale;
      const cursorX = centerX - inputWidth / 2 + 15 + textWidth + 2;
      const cursorY = this.scale.height * 0.35 + 55 * scale + 20 * scale + 25;
      this.cursorGraphics.fillRect(cursorX, cursorY - 15, 2, 30);
    }
  }

  /**
   * 光标闪烁动画
   */
  private startCursorAnimation(): void {
    if (!this.cursorGraphics) return;

    this.tweens.add({
      targets: this.cursorGraphics,
      alpha: (this.isUsernameFocused || this.isPasswordFocused) ? 0.3 : 1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      onYoyo: () => {
        if (!this.isUsernameFocused && !this.isPasswordFocused) {
          this.cursorGraphics!.alpha = 0;
        }
      },
    });
  }

  /**
   * 处理登录
   */
  private handleLogin(): void {
    // 防止重复点击
    if (this.isLoggingIn) {
      LogUtil.log('Player2LoginScene: 正在登录中，忽略重复点击');
      return;
    }

    const trimmedUsername = this.username?.trim() || '';
    const trimmedPassword = this.password;

    LogUtil.log('Player2LoginScene: 尝试登录玩家2');
    LogUtil.log('Player2LoginScene: username="' + trimmedUsername + '"');
    LogUtil.log('Player2LoginScene: password="' + (trimmedPassword ? '***' : '') + '"');

    // 验证用户名
    if (!trimmedUsername || trimmedUsername.length === 0) {
      this.showMessage('请输入昵称～');
      return;
    }

    if (trimmedUsername.length < 3) {
      this.showMessage('昵称至少需要3个字符哦～');
      return;
    }

    if (trimmedUsername.length > 10) {
      this.showMessage('昵称最多10个字符～');
      return;
    }

    // 验证密码
    if (!trimmedPassword || trimmedPassword.length < 4) {
      this.showMessage('密码至少需要4个字符～');
      return;
    }

    // 检查用户名是否与玩家1相同
    const player1 = userService.getCurrentUser();
    if (player1 && player1.username === trimmedUsername) {
      this.showMessage('不能与玩家1使用相同的昵称～');
      return;
    }

    // 设置登录状态
    this.isLoggingIn = true;

    // 注册并登录玩家2
    try {
      const result = userService.register(trimmedUsername, trimmedPassword);

      if (result.success) {
        LogUtil.log('Player2LoginScene: 玩家2注册成功');

        // 保存玩家2信息到全局变量
        (window as any).__PLAYER2_INFO__ = result.user;

        // 设置对战信息
        (window as any).__BATTLE_INFO__ = {
          gameId: (window as any).__GAME_ID__ || 'color-game',
          players: [
            { id: player1!.id, username: player1!.username },
            { id: result.user!.id, username: result.user!.username },
          ],
        };

        this.showMessage(`欢迎, ${result.user!.username}! 🎉`);

        // 延迟开始分屏对战场景
        this.time.delayedCall(800, () => {
          this.startSplitScreen();
        });
      } else {
        LogUtil.log('Player2LoginScene: 玩家2注册失败 - ' + result.message);
        this.showMessage(result.message);
        this.isLoggingIn = false;
      }
    } catch (error: any) {
      LogUtil.error('Player2LoginScene: 登录失败', error);
      this.showMessage('登录失败，请重试～');
      this.isLoggingIn = false;
    }
  }

  /**
   * 开始分屏对战
   */
  private startSplitScreen(): void {
    LogUtil.log('Player2LoginScene: 启动分屏对战场景');
    this.scene.start('SplitScreenBattleScene');
  }

  /**
   * 显示消息
   */
  private showMessage(message: string): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.85;

    const msgBg = this.add.graphics();
    msgBg.fillStyle(0xFF6B6B, 0.95);
    msgBg.fillRoundedRect(-200, -40, 400, 80, 20);

    const msgText = this.add.text(centerX, centerY, message, {
      font: `bold ${DeviceUtil.getOptimalFontSize(20)}px "Microsoft YaHei", Arial`,
      color: '#fff',
    });
    msgText.setOrigin(0.5, 0.5);

    // 动画
    msgBg.setAlpha(0);
    msgText.setAlpha(0);

    this.tweens.add({
      targets: [msgBg, msgText],
      alpha: { from: 0, to: 1 },
      scale: { from: 0.8, to: 1 },
      duration: 300,
      ease: 'Back.easeOut',
    });

    // 自动消失
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [msgBg, msgText],
        alpha: 0,
        scale: { from: 1, to: 0.8 },
        duration: 300,
        onComplete: () => {
          msgBg.destroy();
          msgText.destroy();
        },
      });
    });
  }

  /**
   * 场景销毁
   */
  public shutdown(): void {
    if (this.cursorGraphics) {
      this.cursorGraphics.destroy();
    }
    super.shutdown();
  }
}
