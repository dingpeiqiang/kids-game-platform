/**
 * 对战申请场景
 * 选择在线用户并发起对战申请
 */

import { BaseScene } from '@/core/scene.base';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';
import { userService, User, BattleRequest } from '@/services/user.service';
import { GameId } from '@/core/battle-select.scene';

export class BattleRequestScene extends BaseScene {
  private gameId: GameId = 'color-game';
  private gameSceneKey: string = '';
  private userContainers: Phaser.GameObjects.Container[] = [];
  private currentFocusIndex: number = 0;
  private requestPanel?: Phaser.GameObjects.Container;

  constructor() {
    super('BattleRequestScene');
  }

  /**
   * 设置游戏ID
   */
  public setGameId(gameId: GameId): void {
    this.gameId = gameId;
    this.setGameSceneKeys();
  }

  /**
   * 设置游戏场景键名
   */
  private setGameSceneKeys(): void {
    switch (this.gameId) {
      case 'color-game':
        this.gameSceneKey = 'ColorGameScene';
        break;
      case 'shape-game':
        this.gameSceneKey = 'ShapeGameScene';
        break;
      case 'demo-game':
        this.gameSceneKey = 'DemoGameScene';
        break;
    }
  }

  public create(): void {
    LogUtil.log('BattleRequestScene: 创建对战申请场景');

    // 检查登录状态
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      LogUtil.log('BattleRequestScene: 用户未登录，跳转到登录');
      this.scene.start('LoginScene');
      return;
    }

    // 设置场景键名
    this.setGameSceneKeys();

    // 设置背景
    this.cameras.main.setBackgroundColor('#FFF9E6');

    // 创建UI
    this.createTitle();
    this.createCurrentUserPanel();
    this.createOnlineUsersList();
    this.createBackButton();

    // 监听对战申请事件
    this.setupEventListeners();

    // 定时刷新在线用户列表
    this.time.addEvent({
      delay: 5000,
      callback: () => this.refreshOnlineUsers(),
      loop: true,
    });

    this.setupKeyboardControl();
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.1;

    const title = this.add.text(centerX, centerY, '⚔️ 选择对战对手', {
      font: `bold ${DeviceUtil.getOptimalFontSize(42)}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    title.setOrigin(0.5, 0.5);

    // 标题动画
    this.tweens.add({
      targets: title,
      scale: { from: 0.8, to: 1 },
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 创建当前用户面板
   */
  private createCurrentUserPanel(): void {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) return;

    const centerX = this.scale.width / 2;
    const y = this.scale.height * 0.18;
    const scale = DeviceUtil.getScaleFactor();

    const container = this.add.container(centerX, y);
    const width = 500 * scale;
    const height = 60 * scale;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x74B9FF, 0.2);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);

    // 头像
    const avatar = this.add.text(-width / 2 + 40 * scale, 0, currentUser.avatar, {
      font: `${40 * scale}px Arial`,
    });
    avatar.setOrigin(0.5, 0.5);

    // 用户名
    const username = this.add.text(-width / 2 + 100 * scale, 0, `我: ${currentUser.username}`, {
      font: `bold ${DeviceUtil.getOptimalFontSize(22) * scale}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    username.setOrigin(0, 0.5);

    // 点数
    const points = this.add.text(width / 2 - 40 * scale, 0, `💎 ${currentUser.points}点`, {
      font: `${DeviceUtil.getOptimalFontSize(18) * scale}px "Microsoft YaHei", Arial`,
      color: '#666666',
    });
    points.setOrigin(1, 0.5);

    container.add([bg, avatar, username, points]);
  }

  /**
   * 创建在线用户列表
   */
  private createOnlineUsersList(): void {
    this.refreshOnlineUsers();
  }

  /**
   * 刷新在线用户列表
   */
  private refreshOnlineUsers(): void {
    // 清空现有列表
    this.userContainers.forEach((container) => container.destroy());
    this.userContainers = [];

    const onlineUsers = userService.getOnlineUsers();
    const centerX = this.scale.width / 2;
    const startY = this.scale.height * 0.3;
    const scale = DeviceUtil.getScaleFactor();
    const cardHeight = 80 * scale;
    const gap = 15 * scale;

    if (onlineUsers.length === 0) {
      // 显示没有在线用户
      const noUsersText = this.add.text(centerX, startY + 100 * scale, '暂无在线用户', {
        font: `${DeviceUtil.getOptimalFontSize(24)}px "Microsoft YaHei", Arial`,
        color: '#999999',
      });
      noUsersText.setOrigin(0.5, 0.5);
      return;
    }

    onlineUsers.forEach((user, index) => {
      const y = startY + index * (cardHeight + gap);
      const container = this.createUserCard(centerX, y, user, scale);
      this.userContainers.push(container);
    });

    // 设置初始焦点
    if (this.userContainers.length > 0) {
      this.currentFocusIndex = 0;
      this.highlightUserCard(this.userContainers[0]);
    }
  }

  /**
   * 创建用户卡片
   */
  private createUserCard(x: number, y: number, user: User, scale: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const width = 500 * scale;
    const height = 80 * scale;

    // 背景颜色根据状态变化
    let bgColor = 0xffffff;
    let borderColor = 0xE0E0E0;

    if (user.status === 'in-battle') {
      bgColor = 0xFFF0F0;
      borderColor = 0xFF6B6B;
    } else if (user.status === 'online') {
      bgColor = 0xF0FFF0;
      borderColor = 0x95E1D3;
    }

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
    bg.lineStyle(3, borderColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);

    // 头像
    const avatar = this.add.text(-width / 2 + 50 * scale, 0, user.avatar, {
      font: `${50 * scale}px Arial`,
    });
    avatar.setOrigin(0.5, 0.5);

    // 用户名
    const username = this.add.text(-width / 2 + 100 * scale, -height * 0.15, user.username, {
      font: `bold ${DeviceUtil.getOptimalFontSize(22) * scale}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    username.setOrigin(0, 0.5);

    // 点数
    const points = this.add.text(-width / 2 + 100 * scale, height * 0.15, `💎 ${user.points}点`, {
      font: `${DeviceUtil.getOptimalFontSize(16) * scale}px "Microsoft YaHei", Arial`,
      color: '#666666',
    });
    points.setOrigin(0, 0.5);

    // 状态标签
    let statusText = '';
    let statusColor = '#666666';
    if (user.status === 'online') {
      statusText = '🟢 在线';
      statusColor = '#4CAF50';
    } else if (user.status === 'in-battle') {
      statusText = '🔴 对战中';
      statusColor = '#FF6B6B';
    }

    const status = this.add.text(width / 2 - 20 * scale, 0, statusText, {
      font: `${DeviceUtil.getOptimalFontSize(16) * scale}px "Microsoft YaHei", Arial`,
      color: statusColor,
    });
    status.setOrigin(1, 0.5);

    // 对战按钮
    let challengeButton: Phaser.GameObjects.Container | undefined;
    if (user.status === 'online') {
      challengeButton = this.createChallengeButton(
        container,
        width / 2 - 80 * scale,
        0,
        scale,
        user.id
      );
    }

    container.add([bg, avatar, username, points, status]);

    // 交互
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerover', () => {
      if (user.status === 'online') {
        this.tweens.add({
          targets: container,
          scale: 1.02,
          duration: 100,
        });
      }
    });

    bg.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
      });
    });

    return container;
  }

  /**
   * 创建对战按钮
   */
  private createChallengeButton(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    scale: number,
    userId: string
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const width = 100 * scale;
    const height = 35 * scale;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0xFF6B6B, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

    // 文字
    const text = this.add.text(0, 0, '对战', {
      font: `bold ${DeviceUtil.getOptimalFontSize(16) * scale}px "Microsoft YaHei", Arial`,
      color: '#ffffff',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    // 交互
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', () => {
      this.sendBattleRequest(userId);
    });

    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xFF4444, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    });

    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0xFF6B6B, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    });

    parent.add(container);
    return container;
  }

  /**
   * 发送对战申请
   */
  private sendBattleRequest(targetUserId: string): void {
    try {
      const request = userService.sendBattleRequest(targetUserId, this.gameId);

      // 显示申请成功提示
      this.showMessage('对战申请已发送，等待对方回复...');

      // 监听申请状态变化
      const checkRequest = setInterval(() => {
        const updatedRequest = userService.getSentRequests().find(r => r.id === request.id);
        if (!updatedRequest || updatedRequest.status !== 'pending') {
          clearInterval(checkRequest);

          if (updatedRequest?.status === 'accepted') {
            this.showMessage('对方接受了对战！');
            this.time.delayedCall(1000, () => {
              this.startBattle(request);
            });
          } else if (updatedRequest?.status === 'rejected') {
            this.showMessage('对方拒绝了对战');
          } else {
            this.showMessage('申请已取消');
          }
        }
      }, 1000);

    } catch (error: any) {
      this.showMessage(error.message || '发送申请失败');
    }
  }

  /**
   * 开始对战
   */
  private startBattle(request: BattleRequest): void {
    LogUtil.log('BattleRequestScene: 开始对战', request);

    // 存储对战信息到全局
    (window as any).__BATTLE_INFO__ = {
      gameId: request.gameId,
      players: [
        { id: request.fromUserId, username: request.fromUsername },
        { id: request.toUserId, username: userService.getCurrentUser()?.username || '玩家2' },
      ],
    };

    // 启动游戏
    this.startGameScene(request.gameId);
  }

  /**
   * 启动游戏场景
   */
  private startGameScene(gameId: GameId): void {
    if (this.gameSceneKey) {
      this.scene.start(this.gameSceneKey);
    }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听收到对战申请
    userService.on('battle:request', (request: BattleRequest) => {
      this.showBattleRequestDialog(request);
    });
  }

  /**
   * 显示对战申请对话框
   */
  private showBattleRequestDialog(request: BattleRequest): void {
    // 移除旧的对话框
    if (this.requestPanel) {
      this.requestPanel.destroy();
    }

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const scale = DeviceUtil.getScaleFactor();

    const container = this.add.container(centerX, centerY);
    const width = 400 * scale;
    const height = 250 * scale;

    // 遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(-this.scale.width / 2, -this.scale.height / 2, this.scale.width, this.scale.height);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 20);

    // 标题
    const title = this.add.text(0, -height * 0.35, '⚔️ 收到对战申请', {
      font: `bold ${DeviceUtil.getOptimalFontSize(28) * scale}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    title.setOrigin(0.5, 0.5);

    // 内容
    const content = this.add.text(
      0,
      -height * 0.1,
      `${request.fromUsername} 想和你对战！`,
      {
        font: `${DeviceUtil.getOptimalFontSize(20) * scale}px "Microsoft YaHei", Arial`,
        color: '#666666',
      }
    );
    content.setOrigin(0.5, 0.5);

    // 接受按钮
    const acceptBtn = this.createDialogButton(
      container,
      -width * 0.2,
      height * 0.25,
      '接受',
      '#4CAF50',
      scale,
      () => {
        this.acceptRequest(request);
      }
    );

    // 拒绝按钮
    const rejectBtn = this.createDialogButton(
      container,
      width * 0.2,
      height * 0.25,
      '拒绝',
      '#FF6B6B',
      scale,
      () => {
        this.rejectRequest(request);
      }
    );

    container.add([bg, title, content]);
    this.requestPanel = container;

    // 动画
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 创建对话框按钮
   */
  private createDialogButton(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    text: string,
    color: string,
    scale: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const width = 120 * scale;
    const height = 45 * scale;

    const bg = this.add.graphics();
    const colorValue = parseInt(color.replace('#', '0x'));
    bg.fillStyle(colorValue, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

    const buttonText = this.add.text(0, 0, text, {
      font: `bold ${DeviceUtil.getOptimalFontSize(18) * scale}px "Microsoft YaHei", Arial`,
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5, 0.5);

    container.add([bg, buttonText]);

    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', onClick);

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

    parent.add(container);
    return container;
  }

  /**
   * 接受对战申请
   */
  private acceptRequest(request: BattleRequest): void {
    try {
      userService.acceptBattleRequest(request.id);

      if (this.requestPanel) {
        this.requestPanel.destroy();
        this.requestPanel = undefined;
      }

      this.showMessage('已接受对战！');

      // 延迟开始对战
      this.time.delayedCall(1000, () => {
        this.startBattle(request);
      });
    } catch (error: any) {
      this.showMessage(error.message || '接受失败');
    }
  }

  /**
   * 拒绝对战申请
   */
  private rejectRequest(request: BattleRequest): void {
    try {
      userService.rejectBattleRequest(request.id);

      if (this.requestPanel) {
        this.requestPanel.destroy();
        this.requestPanel = undefined;
      }

      this.showMessage('已拒绝对战');
    } catch (error: any) {
      this.showMessage(error.message || '拒绝失败');
    }
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    const padding = DeviceUtil.getOptimalFontSize(20);

    const container = this.add.container(padding, DeviceUtil.getOptimalFontSize(30));
    const width = 120;
    const height = 40;

    const bg = this.add.graphics();
    bg.fillStyle(0xE0E0E0, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);

    const text = this.add.text(0, 0, '← 返回', {
      font: `bold ${DeviceUtil.getOptimalFontSize(16)}px "Microsoft YaHei", Arial`,
      color: '#333333',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', () => {
      this.scene.stop('BattleRequestScene');
      this.scene.start('BattleSelectScene');
    });

    bg.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.05,
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
  }

  /**
   * 高亮用户卡片
   */
  private highlightUserCard(card: Phaser.GameObjects.Container): void {
    // 重置所有卡片
    this.userContainers.forEach((c) => {
      this.tweens.killTweensOf(c);
      this.tweens.add({
        targets: c,
        scale: 1,
        duration: 100,
      });
    });

    // 高亮当前卡片
    this.tweens.killTweensOf(card);
    this.tweens.add({
      targets: card,
      scale: 1.05,
      duration: 100,
    });
  }

  /**
   * 显示消息
   */
  private showMessage(message: string): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.85;

    const msgText = this.add.text(centerX, centerY, message, {
      font: `bold ${DeviceUtil.getOptimalFontSize(22)}px "Microsoft YaHei", Arial`,
      color: '#333333',
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: { x: 20, y: 10 },
    });
    msgText.setOrigin(0.5, 0.5);

    // 动画
    msgText.setAlpha(0);
    this.tweens.add({
      targets: msgText,
      alpha: { from: 0, to: 1 },
      y: { from: centerY - 20, to: centerY },
      duration: 300,
      ease: 'Back.easeOut',
    });

    // 自动消失
    this.time.delayedCall(2500, () => {
      this.tweens.add({
        targets: msgText,
        alpha: 0,
        duration: 300,
        onComplete: () => msgText.destroy(),
      });
    });
  }

  /**
   * 设置键盘控制
   */
  private setupKeyboardControl(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          this.moveFocus(-1);
          break;
        case 'ArrowDown':
          this.moveFocus(1);
          break;
        case 'Enter':
          this.activateFocusedUser();
          break;
        case 'Escape':
          this.scene.stop('BattleRequestScene');
          this.scene.start('BattleSelectScene');
          break;
      }
    });
  }

  /**
   * 移动焦点
   */
  private moveFocus(delta: number): void {
    const newIndex = Math.max(
      0,
      Math.min(this.userContainers.length - 1, this.currentFocusIndex + delta)
    );
    if (newIndex !== this.currentFocusIndex) {
      this.currentFocusIndex = newIndex;
      this.highlightUserCard(this.userContainers[newIndex]);
    }
  }

  /**
   * 激活焦点用户
   */
  private activateFocusedUser(): void {
    if (this.userContainers[this.currentFocusIndex]) {
      // 这里可以添加对战逻辑
      // 由于用户卡片结构复杂，暂时简化为点击第一个在线用户的对战按钮
      // 实际应用中需要更精确的处理
    }
  }

  public shutdown(): void {
    this.userContainers.forEach((c) => c.destroy());
    this.userContainers = [];
    if (this.requestPanel) {
      this.requestPanel.destroy();
    }
  }
}
