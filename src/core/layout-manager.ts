/**
 * 布局管理器
 * 职责：管理多人游戏的界面排版，根据玩家数量动态创建布局
 */

import { Player, PlayerId, Score, HexColor } from './events';

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 玩家数量 */
  playerCount: number;
  /** 是否显示 VS 分割线 */
  showDivider: boolean;
  /** 是否显示回合指示器 */
  showRoundIndicator: boolean;
}

/**
 * 布局管理器
 * 根据玩家数量自动计算和创建布局
 */
export class LayoutManager {
  private container: HTMLElement | null = null;
  private playerContainers: Map<PlayerId, HTMLElement> = new Map();
  private scorePanels: Map<PlayerId, HTMLElement> = new Map();
  private roundIndicator: HTMLElement | null = null;
  private resultModal: HTMLElement | null = null;
  private currentConfig: LayoutConfig | null = null;

  /**
   * 创建布局
   * @param players 玩家列表
   */
  public createLayout(players: Player[]): void {
    // 获取或创建游戏容器
    this.container = document.getElementById('game-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'game-container';
      document.body.appendChild(this.container);
    }

    // 清空现有内容
    this.clear();

    // 设置布局配置
    this.currentConfig = {
      playerCount: players.length,
      showDivider: players.length > 1,
      showRoundIndicator: true,
    };

    // 根据玩家数量创建布局
    if (players.length === 1) {
      this.createSinglePlayerLayout(players[0]);
    } else if (players.length === 2) {
      this.createTwoPlayerLayout(players);
    } else {
      this.createMultiPlayerLayout(players);
    }

    // 创建回合指示器
    if (this.currentConfig.showRoundIndicator) {
      this.createRoundIndicator();
    }

    console.log(`[LayoutManager] 布局创建完成: ${players.length} 名玩家`);
  }

  /**
   * 创建单人布局
   */
  private createSinglePlayerLayout(player: Player): void {
    if (!this.container) return;

    this.container.className = 'game-layout single';

    const wrapper = document.createElement('div');
    wrapper.className = 'player-wrapper';

    // 分数面板
    const scorePanel = document.createElement('div');
    scorePanel.className = 'score-panel';
    scorePanel.id = `score-${player.id}`;
    scorePanel.textContent = '分数: 0';
    this.scorePanels.set(player.id, scorePanel);

    // 游戏区域
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';
    gameArea.id = `player-area-${player.id}`;
    this.playerContainers.set(player.id, gameArea);

    wrapper.appendChild(scorePanel);
    wrapper.appendChild(gameArea);
    this.container.appendChild(wrapper);
  }

  /**
   * 创建双人对战布局
   */
  private createTwoPlayerLayout(players: Player[]): void {
    if (!this.container) return;

    this.container.className = 'game-layout battle';

    const wrapper = document.createElement('div');
    wrapper.className = 'battle-wrapper';

    // 玩家1区域
    const player1Section = this.createPlayerSection(players[0]);
    player1Section.id = 'section-1';

    // VS 分割线
    const divider = document.createElement('div');
    divider.className = 'vs-divider';
    divider.textContent = 'VS';

    // 玩家2区域
    const player2Section = this.createPlayerSection(players[1]);
    player2Section.id = 'section-2';

    wrapper.appendChild(player1Section);
    wrapper.appendChild(divider);
    wrapper.appendChild(player2Section);
    this.container.appendChild(wrapper);
  }

  /**
   * 创建多人布局（3+玩家）
   */
  private createMultiPlayerLayout(players: Player[]): void {
    if (!this.container) return;

    this.container.className = 'game-layout multi';

    const wrapper = document.createElement('div');
    wrapper.className = 'multi-wrapper';

    // 计算列数
    const cols = players.length <= 4 ? 2 : 3;
    const rows = Math.ceil(players.length / cols);

    wrapper.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    wrapper.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    players.forEach((player, index) => {
      const section = this.createPlayerSection(player);
      section.id = `section-${player.id}`;
      section.style.gridColumn = `${(index % cols) + 1}`;
      section.style.gridRow = `${Math.floor(index / cols) + 1}`;
      wrapper.appendChild(section);
    });

    this.container.appendChild(wrapper);
  }

  /**
   * 创建玩家区域
   */
  private createPlayerSection(player: Player): HTMLElement {
    const section = document.createElement('div');
    section.className = 'player-section';

    // 分数面板
    const scorePanel = document.createElement('div');
    scorePanel.className = 'score-panel';
    scorePanel.id = `score-${player.id}`;
    scorePanel.style.color = player.color;
    scorePanel.textContent = `${player.name}: 0`;
    this.scorePanels.set(player.id, scorePanel);

    // 活跃玩家指示器
    if (player.isActive) {
      section.classList.add('active');
      const indicator = document.createElement('div');
      indicator.className = 'active-indicator';
      indicator.textContent = '👤';
      section.appendChild(indicator);
    }

    // 游戏区域
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';
    gameArea.id = `player-area-${player.id}`;
    this.playerContainers.set(player.id, gameArea);

    section.appendChild(scorePanel);
    section.appendChild(gameArea);

    return section;
  }

  /**
   * 创建回合指示器
   */
  private createRoundIndicator(): void {
    if (!this.container) return;

    this.roundIndicator = document.createElement('div');
    this.roundIndicator.className = 'round-indicator';
    this.roundIndicator.textContent = '回合: 1/10';

    this.container.appendChild(this.roundIndicator);
  }

  /**
   * 获取玩家容器
   */
  public getPlayerContainer(playerId: PlayerId): HTMLElement {
    const container = this.playerContainers.get(playerId);
    if (!container) {
      throw new Error(`Player container not found for player ${playerId}`);
    }
    return container;
  }

  /**
   * 更新分数显示
   */
  public updateScore(playerId: PlayerId, score: Score): void {
    const panel = this.scorePanels.get(playerId);
    if (panel) {
      const player = this.getPlayerById(playerId);
      panel.textContent = `${player?.name || '玩家'}: ${score}`;
    }
  }

  /**
   * 更新回合指示器
   */
  public updateRoundIndicator(current: number, total: number): void {
    if (this.roundIndicator) {
      this.roundIndicator.textContent = `回合: ${current}/${total}`;
    }
  }

  /**
   * 高亮当前玩家
   */
  public highlightPlayer(playerId: PlayerId): void {
    // 移除所有活跃状态
    const sections = this.container?.querySelectorAll('.player-section');
    sections?.forEach((section) => {
      section.classList.remove('active');
      const indicator = section.querySelector('.active-indicator');
      indicator?.remove();
    });

    // 添加新的活跃状态
    const section = document.getElementById(`section-${playerId}`);
    if (section) {
      section.classList.add('active');
      const indicator = document.createElement('div');
      indicator.className = 'active-indicator';
      indicator.textContent = '👤';
      section.appendChild(indicator);
    }
  }

  /**
   * 显示游戏结果
   */
  public showResult(
    winner?: Player,
    isDraw: boolean = false,
    scores?: Map<PlayerId, Score>
  ): void {
    // 移除旧的结果弹窗
    this.hideResult();

    // 创建结果弹窗
    this.resultModal = document.createElement('div');
    this.resultModal.className = 'result-modal';

    let resultText = '';
    if (isDraw) {
      resultText = '平局！🤝';
    } else if (winner) {
      resultText = `${winner.name} 获胜！🎉`;
    }

    let scoresText = '';
    if (scores) {
      const scoreEntries = Array.from(scores.entries());
      scoresText = scoreEntries
        .map(([id, score]) => {
          const player = this.getPlayerById(id);
          return `${player?.name || '玩家'}: ${score}`;
        })
        .join('  vs  ');
    }

    this.resultModal.innerHTML = `
      <div class="result-content">
        <div class="result-title">${resultText}</div>
        <div class="result-scores">${scoresText}</div>
        <div class="result-buttons">
          <button class="result-btn restart">再来一局</button>
          <button class="result-btn home">返回主页</button>
        </div>
      </div>
    `;

    // 绑定按钮事件
    const restartBtn = this.resultModal.querySelector('.restart');
    restartBtn?.addEventListener('click', () => {
      this.hideResult();
      // 触发重新开始事件
      window.dispatchEvent(new CustomEvent('game:requestRestart'));
    });

    const homeBtn = this.resultModal.querySelector('.home');
    homeBtn?.addEventListener('click', () => {
      this.hideResult();
      window.location.href = '/';
    });

    document.body.appendChild(this.resultModal);
  }

  /**
   * 隐藏游戏结果
   */
  public hideResult(): void {
    if (this.resultModal) {
      this.resultModal.remove();
      this.resultModal = null;
    }
  }

  /**
   * 清理布局
   */
  public clear(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.playerContainers.clear();
    this.scorePanels.clear();
    this.roundIndicator = null;
    this.hideResult();
  }

  /**
   * 根据ID获取玩家
   */
  private getPlayerById(playerId: PlayerId): Player | undefined {
    // 从 scorePanels 的 id 中推断玩家名称
    return undefined;
  }
}
