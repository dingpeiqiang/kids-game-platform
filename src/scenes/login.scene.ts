/**
 * 登录场景 - 简化版
 * 纯Phaser UI实现，无需HTML输入框
 */

import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { userService } from '@/services/user.service';

export class LoginScene extends BaseScene {
  // UI元素
  private titleText?: Phaser.GameObjects.Text;
  private inputBox?: Phaser.GameObjects.Container;
  private inputText?: Phaser.GameObjects.Text;
  private cursorGraphics?: Phaser.GameObjects.Graphics;
  private submitButton?: Phaser.GameObjects.Container;
  private quickLoginButtons: Phaser.GameObjects.Container[] = [];
  private backButton?: Phaser.GameObjects.Container;

  // 输入状态
  private username = '';
  private isFocused = false;
  private isLoggingIn = false; // 防止重复点击

  constructor() {
    super('LoginScene');
  }

  public create(): void {
    LogUtil.log('LoginScene: 创建登录场景');

    // 设置背景
    this.cameras.main.setBackgroundColor('#FFE5B4');

    // 检查是否已登录
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      LogUtil.log('LoginScene: 用户已登录');

      // 检查是否有选中的游戏类型
      const selectedGameType = (window as any).__SELECTED_GAME_TYPE__;
      if (selectedGameType) {
        LogUtil.log('LoginScene: 有选中的游戏类型，跳转到主菜单:', selectedGameType);
        this.scene.start('MenuScene');
      } else {
        LogUtil.log('LoginScene: 跳转到首页');
        window.location.href = '/';
      }
      return;
    }

    // 创建UI
    this.createTitle();
    this.createInput();
    this.createButton();
    this.createQuickLogin();
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
    const centerY = this.scale.height * 0.2;

    this.titleText = this.add.text(centerX, centerY, '🎮 童玩星球', {
      font: 'bold 48px "Microsoft YaHei", Arial',
      color: '#FF6B6B',
    });
    this.titleText.setOrigin(0.5, 0.5);

    const subtitle = this.add.text(centerX, centerY + 50, '请输入你的昵称', {
      font: '20px "Microsoft YaHei", Arial',
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
   * 创建输入框
   */
  private createInput(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.45;

    this.inputBox = this.add.container(centerX, centerY);

    // 背景框
    const boxWidth = 400;
    const boxHeight = 60;
    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.lineStyle(3, 0xFF6B6B, 1);
    bg.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 30);
    bg.strokeRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 30);

    // 占位符/输入文本
    this.inputText = this.add.text(-boxWidth / 2 + 20, 0, '输入昵称（2-10个字符）', {
      font: '24px "Microsoft YaHei", Arial',
      color: '#CCCCCC',
    });
    this.inputText.setOrigin(0, 0.5);

    // 光标
    this.cursorGraphics = this.add.graphics();
    this.cursorGraphics.fillStyle(0xFF6B6B, 1);
    this.updateCursorPosition();

    this.inputBox.add([bg, this.inputText, this.cursorGraphics]);

    // 设置交互
    const bgInteractive = bg as any;
    bgInteractive.setInteractive(
      new Phaser.Geom.Rectangle(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight),
      Phaser.Geom.Rectangle.Contains
    );

    bgInteractive.on('pointerdown', () => {
      this.focusInput();
    });

    bgInteractive.on('pointerover', () => {
      this.game.canvas.style.cursor = 'text';
    });

    bgInteractive.on('pointerout', () => {
      this.game.canvas.style.cursor = 'default';
    });
  }

  /**
   * 创建登录按钮
   */
  private createButton(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.6;

    this.submitButton = this.add.container(centerX, centerY);

    const buttonWidth = 280;
    const buttonHeight = 65;

    // 背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xFF6B6B, 0xFF6B6B, 0xFFA07A, 0xFFA07A, 1);
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 32);

    // 按钮文字
    const buttonText = this.add.text(0, 0, '开始游戏', {
      font: 'bold 26px "Microsoft YaHei", Arial',
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
   * 创建快捷登录按钮
   */
  private createQuickLogin(): void {
    const labels = ['小明', '小红', '小花'];
    const buttonWidth = 90;
    const buttonHeight = 50;
    const gap = 15;

    const centerX = this.scale.width / 2;
    const startY = this.scale.height * 0.72;
    const totalWidth = labels.length * buttonWidth + (labels.length - 1) * gap;
    const startX = centerX - totalWidth / 2 + buttonWidth / 2;

    labels.forEach((label, index) => {
      const btnX = startX + index * (buttonWidth + gap);
      const container = this.add.container(btnX, startY);

      // 背景
      const bg = this.add.graphics();
      bg.fillStyle(0xFFFFE0, 1);
      bg.lineStyle(2, 0xFFA07A, 1);
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);

      // 文字
      const text = this.add.text(0, 0, label, {
        font: 'bold 18px "Microsoft YaHei", Arial',
        color: '#FF6B6B',
      });
      text.setOrigin(0.5, 0.5);

      container.add([bg, text]);

      // 交互
      bg.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );

      bg.on('pointerdown', () => {
        this.quickLogin(label);
      });

      bg.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scale: 1.1,
          duration: 100,
        });
      });

      bg.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 100,
        });
      });

      this.quickLoginButtons.push(container);
    });
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const padding = 25;

    this.backButton = this.add.container(padding, padding + 25);

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.8);
    bg.fillRoundedRect(-50, -20, 100, 40, 12);

    const text = this.add.text(0, 0, '← 返回', {
      font: 'bold 18px "Microsoft YaHei", Arial',
      color: '#FF6B6B',
    });
    text.setOrigin(0.5, 0.5);

    this.backButton.add([bg, text]);

    bg.setInteractive(
      new Phaser.Geom.Rectangle(-50, -20, 100, 40),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', () => {
      window.location.href = '/';
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
      if (!this.isFocused) return;

      if (event.key === 'Enter') {
        this.handleLogin();
        return;
      }

      if (event.key === 'Backspace') {
        this.username = this.username.slice(0, -1);
        this.updateInputDisplay();
        return;
      }

      // 过滤特殊字符，只允许中文、字母、数字
      if (event.key.length === 1 && /[a-zA-Z0-9\u4e00-\u9fa5]/.test(event.key)) {
        if (this.username.length < 10) {
          this.username += event.key;
          this.updateInputDisplay();
        }
      }
    });

    // 点击外部取消聚焦
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const inputBounds = this.inputBox?.getBounds();
      if (inputBounds && !Phaser.Geom.Rectangle.Contains(inputBounds, pointer.x, pointer.y)) {
        this.blurInput();
      }
    });
  }

  /**
   * 聚焦输入框
   */
  private focusInput(): void {
    this.isFocused = true;
    this.updateInputDisplay();
  }

  /**
   * 取消聚焦
   */
  private blurInput(): void {
    this.isFocused = false;
    this.updateInputDisplay();
  }

  /**
   * 更新输入显示
   */
  private updateInputDisplay(): void {
    if (!this.inputText) return;

    if (this.username.length === 0) {
      this.inputText.setText('输入昵称（3-10个字符）');
      this.inputText.setColor('#CCCCCC');
    } else {
      this.inputText.setText(this.username);
      this.inputText.setColor(this.isFocused ? '#333333' : '#666666');
    }

    this.updateCursorPosition();
  }

  /**
   * 更新光标位置
   */
  private updateCursorPosition(): void {
    if (!this.cursorGraphics || !this.inputText || !this.inputBox) return;

    const textWidth = this.inputText.width;
    const cursorX = -200 + 20 + textWidth + 2; // -200是输入框宽度的一半

    this.cursorGraphics.clear();
    this.cursorGraphics.fillStyle(0xFF6B6B, 1);
    this.cursorGraphics.fillRect(cursorX, -15, 2, 30);

    if (!this.isFocused) {
      this.cursorGraphics.alpha = 0;
    } else {
      this.cursorGraphics.alpha = 1;
    }
  }

  /**
   * 光标闪烁动画
   */
  private startCursorAnimation(): void {
    if (!this.cursorGraphics) return;

    this.tweens.add({
      targets: this.cursorGraphics,
      alpha: this.isFocused ? 0.3 : 1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      onYoyo: () => {
        if (!this.isFocused) {
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
      LogUtil.log('LoginScene: 正在登录中，忽略重复点击');
      return;
    }

    const trimmedUsername = this.username?.trim() || '';
    LogUtil.log('LoginScene: 尝试登录');
    LogUtil.log('LoginScene: this.username="' + this.username + '"');
    LogUtil.log('LoginScene: trimmedUsername="' + trimmedUsername + '"');
    LogUtil.log('LoginScene: username.length=' + (this.username?.length || 0));

    // 验证用户名
    if (!trimmedUsername || trimmedUsername.length === 0) {
      LogUtil.log('LoginScene: 用户名为空');
      this.showMessage('请输入昵称～');
      return;
    }

    if (trimmedUsername.length < 2) {
      LogUtil.log('LoginScene: 用户名太短: ' + trimmedUsername.length);
      this.showMessage('昵称至少需要2个字符哦～');
      return;
    }

    if (trimmedUsername.length > 10) {
      LogUtil.log('LoginScene: 用户名太长: ' + trimmedUsername.length);
      this.showMessage('昵称最多10个字符～');
      return;
    }

    // 设置登录状态
    this.isLoggingIn = true;

    // 登录
    LogUtil.log('LoginScene: 开始调用 userService.login');
    try {
      const user = userService.login(trimmedUsername);
      LogUtil.log('LoginScene: 登录成功, user=' + JSON.stringify(user));

      this.showMessage(`欢迎, ${user.username}! 🎉`);

      // 延迟跳转
      this.time.delayedCall(800, () => {
        // 检查是否有选中的游戏类型
        const selectedGameType = (window as any).__SELECTED_GAME_TYPE__;

        if (selectedGameType) {
          LogUtil.log('LoginScene: 有选中的游戏类型，跳转到主菜单:', selectedGameType);
          // 跳转到主菜单场景
          this.scene.start('MenuScene');
        } else {
          LogUtil.log('LoginScene: 开始跳转到首页');
          window.location.href = '/';
        }
      });
    } catch (error) {
      LogUtil.error('LoginScene: 登录失败', error);
      this.showMessage('登录失败，请重试～');
      this.isLoggingIn = false;
    }
  }

  /**
   * 快捷登录
   */
  private quickLogin(username: string): void {
    LogUtil.log('LoginScene: 快捷登录 - ' + username);
    this.username = username;
    this.updateInputDisplay();
    this.handleLogin();
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
      font: 'bold 20px "Microsoft YaHei", Arial',
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
    // 清理光标动画
    if (this.cursorGraphics) {
      this.cursorGraphics.destroy();
    }
    super.shutdown();
  }
}
