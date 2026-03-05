import { BaseScene } from '@/core/scene.base';
import { BattleSelectScene, GameId } from '@/core/battle-select.scene';
import { SplitScreenSelectScene } from '@/core/split-screen-select.scene';
import { LogUtil } from '@/utils/log.util';
import { DeviceUtil } from '@/utils/device.util';
import { SCENE_NAMES, GAME_LIST, FILTER_OPTIONS, GAME_TYPES, GAME_TYPE_LABELS } from '@/config/constant';
import { GameCard, FilterButton, SearchBox } from './components';
import { userService } from '@/services/user.service';
import type { GameItem } from './components';

/**
 * 筛选模式类型
 */
type FilterMode = 'all' | 'favorites' | 'category';

/**
 * 主菜单场景（重构版）
 * 儿童友好：清晰的图标、简单的点击操作
 * 支持多端适配：手机、平板、PC、智能电视
 * 支持搜索、收藏和分类筛选功能
 */
export class MenuScene extends BaseScene {
  private gameCards: GameCard[] = [];
  private filterButtons: FilterButton[] = [];
  private searchBox?: SearchBox;
  private currentFocusIndex = 0;
  private displayedGames: GameItem[] = [...GAME_LIST];
  private favoriteGameIds = new Set<string>();
  private filterMode: FilterMode = 'all';
  private currentCategory: string | null = null;

  constructor() {
    super(SCENE_NAMES.MENU);
  }

  /**
   * 创建主菜单场景
   */
  public create(): void {
    const deviceInfo = DeviceUtil.getDeviceInfo();
    LogUtil.log('MenuScene: 创建主菜单，设备类型:', deviceInfo.type, '方向:', deviceInfo.orientation);

    // 验证登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 检查是否有选中的游戏类型
    const selectedGameType = (window as any).__SELECTED_GAME_TYPE__;
    if (selectedGameType) {
      LogUtil.log('MenuScene: 检测到选中的游戏类型:', selectedGameType);
      // 清除全局变量
      delete (window as any).__SELECTED_GAME_TYPE__;
      // 直接进入模式选择
      this.startBattleSelect(selectedGameType as GameId);
      return;
    }

    this.loadFavorites();
    this.createUI();
    this.setupKeyboardControl();
    this.setupResizeListener();

    this.events.on('shutdown', this.shutdown.bind(this));
  }

  /**
   * 验证登录状态
   */
  private checkLoginStatus(): boolean {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      LogUtil.log('MenuScene: 用户未登录，跳转到登录场景');
      this.scene.start('LoginScene');
      return false;
    }
    return true;
  }

  /**
   * 创建UI界面
   */
  private createUI(): void {
    const deviceInfo = DeviceUtil.getDeviceInfo();
    
    this.createGradientBackground();
    this.createTitle(deviceInfo);
    this.createSearchBox(deviceInfo);
    this.createFilterButtons();
    this.createGameList();
    this.createFooter();
  }

  /**
   * 创建渐变背景
   */
  private createGradientBackground(): void {
    const bg = this.add.graphics();
    
    // 更丰富的渐变效果
    bg.fillGradientStyle(0xF8FAFC, 0xE2F0FB, 0xE2F0FB, 0xF8FAFC, 1);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    // 装饰圆点（更多样化）
    const colors = [0x74B9FF, 0x95E1D3, 0xFFD93D, 0x9B59B6];
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * this.scale.width;
      const y = Math.random() * this.scale.height;
      const radius = Math.random() * 25 + 10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      bg.fillStyle(color, Math.random() * 0.08 + 0.03);
      bg.fillCircle(x, y, radius);
    }
  }

  /**
   * 创建标题
   */
  private createTitle(deviceInfo: any): void {
    const centerX = this.scale.width / 2;
    const fontSize = DeviceUtil.getOptimalFontSize(deviceInfo.type === 'mobile' ? 36 : 42);

    const titleY = deviceInfo.type === 'mobile' ? this.scale.height * 0.08 : this.scale.height * 0.06;
    const titleContainer = this.add.container(centerX, titleY);

    const titleBg = this.add.graphics();
    const titleBgWidth = Math.min(400, this.scale.width * 0.7);
    const titleBgHeight = deviceInfo.type === 'mobile' ? 40 : 50;

    titleBg.fillStyle(0x74B9FF, 0.15);
    titleBg.fillRoundedRect(-titleBgWidth / 2, -titleBgHeight / 2, titleBgWidth, titleBgHeight, 25);

    const titleText = this.add.text(0, 0, '', {
      font: `bold ${fontSize}px "Microsoft YaHei", Arial`,
      color: '#2D3436',
    }).setOrigin(0.5, 0.5);

    titleContainer.add([titleBg, titleText]);
  }

  /**
   * 创建搜索框
   */
  private createSearchBox(deviceInfo: any): void {
    const centerX = this.scale.width / 2;
    const searchY = deviceInfo.type === 'mobile' ? this.scale.height * 0.16 : this.scale.height * 0.13;
    const boxWidth = Math.min(400, this.scale.width * 0.85);

    this.searchBox = new SearchBox(
      this,
      centerX,
      searchY,
      boxWidth,
      (value) => this.handleSearch(value),
      () => this.clearSearch(),
    );
    this.searchBox.showAnimation();
  }

  /**
   * 创建筛选按钮
   */
  private createFilterButtons(): void {
    const deviceInfo = DeviceUtil.getDeviceInfo();
    const centerX = this.scale.width / 2;
    const btnY = this.scale.height * 0.20;
    
    // 获取所有游戏类型
    const gameTypes = [...new Set(GAME_LIST.map(g => g.type))];
    const totalButtons = 2 + gameTypes.length; // 全部 + 收藏 + 各类型
    
    // 圆形按钮大小
    const btnSize = DeviceUtil.getOptimalFontSize(48);
    
    // 计算最大可用宽度和间距
    const maxAvailableWidth = this.scale.width * 0.9;
    const minGap = deviceInfo.type === 'mobile' ? 12 : 18;
    const gap = Math.min(minGap, Math.floor((maxAvailableWidth - totalButtons * btnSize) / (totalButtons - 1)));
    const totalWidth = totalButtons * btnSize + (totalButtons - 1) * gap;
    let startX = centerX - totalWidth / 2 + btnSize / 2;

    this.filterButtons = [];

    // 全部按钮
    this.filterButtons.push(
      new FilterButton(this, startX, btnY, FILTER_OPTIONS.ALL, '#74B9FF', (label) => this.handleFilter(label), true),
    );
    startX += btnSize + gap;

    // 收藏按钮
    this.filterButtons.push(
      new FilterButton(this, startX, btnY, FILTER_OPTIONS.FAVORITES, '#FFD93D', (label) => this.handleFilter(label)),
    );
    startX += btnSize + gap;

    // 分类按钮
    gameTypes.forEach((type) => {
      const label = GAME_TYPE_LABELS[type] || type;
      const color = this.getTypeColor(type);
      this.filterButtons.push(
        new FilterButton(this, startX, btnY, label, color, (label) => this.handleFilter(label)),
      );
      startX += btnSize + gap;
    });
  }

  /**
   * 获取类型颜色
   */
  private getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      [GAME_TYPES.MATH]: '#FF6B6B',
      [GAME_TYPES.PUZZLE]: '#9B59B6',
      [GAME_TYPES.MEMORY]: '#4ECDC4',
      [GAME_TYPES.COLORING]: '#95E1D3',
      [GAME_TYPES.MUSIC]: '#FFD93D',
    };
    return colors[type] || '#74B9FF';
  }

  /**
   * 创建游戏列表
   */
  private createGameList(): void {
    this.clearGameCards();

    const deviceInfo = DeviceUtil.getDeviceInfo();
    const cardSize = DeviceUtil.getGameCardSize();
    const scaleFactor = DeviceUtil.getScaleFactor();
    const colsPerRow = DeviceUtil.getColumnsCount();

    const buttonWidth = cardSize.width * scaleFactor * 0.9;
    const buttonHeight = cardSize.height * scaleFactor * 0.9;
    
    // 计算间距（更合理的算法）
    const totalCardWidth = buttonWidth * colsPerRow;
    const availableWidth = this.scale.width * 0.95;
    const gapX = Math.max(8, Math.floor((availableWidth - totalCardWidth) / (colsPerRow + 1)));
    const gapY = Math.max(16, gapX * 1.2); // 垂直间距稍大于水平间距
    
    // 计算起始位置（居中对齐）
    const totalRowWidth = totalCardWidth + (colsPerRow - 1) * gapX;
    const startX = (this.scale.width - totalRowWidth) / 2 + buttonWidth / 2;
    const startY = deviceInfo.isLandscape ? this.scale.height * 0.32 : this.scale.height * 0.26;

    this.displayedGames.forEach((game, index) => {
      const row = Math.floor(index / colsPerRow);
      const col = index % colsPerRow;
      const x = startX + col * (buttonWidth + gapX);
      const y = startY + row * (buttonHeight + gapY);

      const card = new GameCard(
        this,
        x,
        y,
        game,
        scaleFactor,
        index,
        this.favoriteGameIds.has(game.id),
        (gameId) => this.startGame(gameId),
        (g) => this.toggleFavorite(g),
      );
      this.gameCards.push(card);
    });

    // 设置初始焦点
    if (this.gameCards.length > 0) {
      this.time.delayedCall(300, () => {
        this.currentFocusIndex = 0;
        this.gameCards[0].highlight();
      });
    }
  }

  /**
   * 创建底部信息
   */
  private createFooter(): void {
    const centerX = this.scale.width / 2;
    const favoriteCount = this.favoriteGameIds.size;
    const footerText = favoriteCount > 0 ? `已收藏 ${favoriteCount} 个游戏` : '点击 ★ 收藏喜欢的游戏';

    this.add.text(centerX, this.scale.height * 0.94, footerText, {
      font: `${DeviceUtil.getOptimalFontSize(14)}px "Microsoft YaHei", Arial`,
      color: '#A0AEC0',
    }).setOrigin(0.5, 0.5);
  }

  /**
   * 处理筛选
   */
  private handleFilter(label: string): void {
    // 更新按钮状态
    this.filterButtons.forEach((btn) => {
      btn.setActive(btn.getLabel() === label);
    });

    // 设置筛选模式
    if (label === FILTER_OPTIONS.ALL) {
      this.filterMode = 'all';
      this.currentCategory = null;
    } else if (label === FILTER_OPTIONS.FAVORITES) {
      this.filterMode = 'favorites';
      this.currentCategory = null;
    } else {
      this.filterMode = 'category';
      // 查找对应的类型
      this.currentCategory = Object.entries(GAME_TYPE_LABELS).find(([_, v]) => v === label)?.[0] || null;
    }

    this.updateGameList();
  }

  /**
   * 处理搜索
   */
  private handleSearch(_value: string): void {
    this.updateGameList();
  }

  /**
   * 清除搜索
   */
  private clearSearch(): void {
    this.searchBox?.setValue('');
    this.updateGameList();
  }

  /**
   * 更新游戏列表
   */
  private updateGameList(): void {
    let filteredGames: GameItem[] = [...GAME_LIST];

    // 应用筛选
    if (this.filterMode === 'favorites') {
      filteredGames = filteredGames.filter((game) => this.favoriteGameIds.has(game.id));
    } else if (this.filterMode === 'category' && this.currentCategory) {
      filteredGames = filteredGames.filter((game) => game.type === this.currentCategory);
    }

    // 应用搜索
    const searchTerm = this.searchBox?.getValue() || '';
    if (searchTerm.trim()) {
      filteredGames = filteredGames.filter((game) => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    this.displayedGames = filteredGames;
    this.createGameList();
  }

  /**
   * 切换收藏
   */
  private toggleFavorite(game: GameItem): void {
    const isFavorite = this.favoriteGameIds.has(game.id);
    
    if (isFavorite) {
      this.favoriteGameIds.delete(game.id);
    } else {
      this.favoriteGameIds.add(game.id);
    }

    // 更新卡片显示
    const cardIndex = this.displayedGames.findIndex((g) => g.id === game.id);
    if (cardIndex >= 0 && this.gameCards[cardIndex]) {
      this.gameCards[cardIndex].updateFavoriteState(!isFavorite);
    }

    this.saveFavorites();

    // 如果在收藏模式下，刷新列表
    if (this.filterMode === 'favorites') {
      this.updateGameList();
    } else {
      // 更新底部信息
      this.createFooter();
    }
  }

  /**
   * 保存收藏
   */
  private saveFavorites(): void {
    try {
      localStorage.setItem('favoriteGames', JSON.stringify([...this.favoriteGameIds]));
    } catch (e) {
      console.error('保存收藏失败:', e);
    }
  }

  /**
   * 加载收藏
   */
  private loadFavorites(): void {
    try {
      const favorites = localStorage.getItem('favoriteGames');
      if (favorites) {
        this.favoriteGameIds = new Set(JSON.parse(favorites));
      }
    } catch (e) {
      console.error('加载收藏失败:', e);
    }
  }

  /**
   * 开始游戏
   */
  private startGame(gameId: string): void {
    LogUtil.log('MenuScene: 选择游戏', gameId);

    // 再次验证登录状态（防止在游戏过程中用户登出）
    if (!this.checkLoginStatus()) {
      return;
    }

    switch (gameId) {
      case 'math-game':
        // 进入数字游戏模式选择
        this.startBattleSelect('demo-game');
        break;
      case 'color-game':
        // 进入颜色游戏模式选择
        this.startBattleSelect('color-game');
        break;
      case 'shape-game':
        // 进入形状游戏模式选择
        this.startBattleSelect('shape-game');
        break;
      case 'color-game-splitscreen':
        // 进入颜色游戏分屏模式
        this.startSplitScreenSelect('color-game');
        break;
      case 'shape-game-splitscreen':
        // 进入形状游戏分屏模式
        this.startSplitScreenSelect('shape-game');
        break;
      case 'memory-game':
        this.showComingSoon();
        break;
      default:
        this.showComingSoon();
    }
  }

  /**
   * 启动对战模式选择场景
   */
  private startBattleSelect(gameId: GameId): void {
    LogUtil.log('MenuScene: 启动对战模式选择', gameId);

    // 再次验证登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 检查场景是否存在，设置游戏ID并启动
    const scene = this.scene.get('BattleSelectScene');
    if (scene) {
      // 场景已存在，设置游戏ID并启动
      scene.setGameId(gameId);
    }

    this.scene.start('BattleSelectScene');

    LogUtil.log('MenuScene: 战斗选择场景已启动');
  }

  /**
   * 启动分屏模式选择场景
   */
  private startSplitScreenSelect(gameId: GameId): void {
    LogUtil.log('MenuScene: 启动分屏模式选择', gameId);

    // 再次验证登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 检查场景是否存在，设置游戏ID并启动
    const scene = this.scene.get('SplitScreenSelectScene');
    if (scene) {
      // 场景已存在，设置游戏ID并启动
      scene.setGameId(gameId);
    }

    this.scene.start('SplitScreenSelectScene');
  }

  /**
   * 显示"即将推出"
   */
  private showComingSoon(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const message = this.add.text(centerX, centerY, '🎉 该游戏即将推出\n敬请期待！', {
      font: `bold ${DeviceUtil.getOptimalFontSize(36)}px Arial`,
      color: '#333333',
      align: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: { x: 40, y: 30 },
    }).setOrigin(0.5, 0.5);

    this.time.delayedCall(1500, () => message.destroy());
  }

  /**
   * 设置键盘控制
   */
  private setupKeyboardControl(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const colsPerRow = DeviceUtil.getColumnsCount();

      switch (event.key) {
        case 'ArrowUp':
          this.moveFocus(-colsPerRow);
          break;
        case 'ArrowDown':
          this.moveFocus(colsPerRow);
          break;
        case 'ArrowLeft':
          this.moveFocus(-1);
          break;
        case 'ArrowRight':
          this.moveFocus(1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.activateFocusedButton();
          break;
      }
    });
  }

  /**
   * 移动焦点
   */
  private moveFocus(delta: number): void {
    const newIndex = Math.max(0, Math.min(this.gameCards.length - 1, this.currentFocusIndex + delta));
    if (newIndex !== this.currentFocusIndex) {
      this.updateFocus(newIndex);
    }
  }

  /**
   * 更新焦点
   */
  private updateFocus(index: number): void {
    if (this.gameCards[this.currentFocusIndex]) {
      this.gameCards[this.currentFocusIndex].unhighlight();
    }
    this.currentFocusIndex = index;
    if (this.gameCards[index]) {
      this.gameCards[index].highlight();
    }
  }

  /**
   * 激活焦点按钮
   */
  private activateFocusedButton(): void {
    const game = this.displayedGames[this.currentFocusIndex];
    if (game) {
      this.startGame(game.id);
    }
  }

  /**
   * 清空游戏卡片
   */
  private clearGameCards(): void {
    this.gameCards.forEach((card) => card.destroy());
    this.gameCards = [];
    this.currentFocusIndex = 0;
  }

  /**
   * 设置窗口大小变化监听
   */
  private setupResizeListener(): void {
    DeviceUtil.onResize(() => {
      this.handleResize();
    });
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    LogUtil.log('MenuScene: 窗口大小变化');
    this.cleanup();
    this.createUI();
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.clearGameCards();
    this.filterButtons.forEach((btn) => btn.destroy());
    this.filterButtons = [];
    this.searchBox?.destroy();
    this.searchBox = undefined;
  }

  /**
   * 场景销毁
   */
  public shutdown(): void {
    DeviceUtil.removeResizeListener();
    this.cleanup();
  }
}
