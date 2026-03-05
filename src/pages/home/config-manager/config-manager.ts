/**
 * 首页配置管理器UI组件
 * 提供可视化的配置管理界面，实现游戏定制化上架
 */

import { homeConfigManager } from '../../../config/home.config.manager';
import type { GameConfig, BannerConfig, ConfigChangeLog } from '../../../config/home.types';

/**
 * 配置管理器类
 */
export class ConfigManagerUI {
  private modal: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  /**
   * 初始化配置管理器
   */
  private init(): void {
    this.createConfigManagerModal();
    this.bindEvents();
  }

  /**
   * 创建配置管理器模态框
   */
  private createConfigManagerModal(): void {
    const modal = document.createElement('div');
    modal.className = 'config-manager-modal';
    modal.id = 'configManagerModal';
    modal.innerHTML = `
      <div class="config-manager-content">
        <div class="config-manager-header">
          <h2 class="config-manager-title">首页配置管理</h2>
          <button class="config-manager-close" id="configManagerClose">✕</button>
        </div>

        <div class="config-manager-tabs">
          <button class="tab-btn active" data-tab="games">游戏管理</button>
          <button class="tab-btn" data-tab="banners">Banner管理</button>
          <button class="tab-btn" data-tab="recommend">推荐管理</button>
          <button class="tab-btn" data-tab="logs">变更日志</button>
        </div>

        <div class="config-manager-body">
          <!-- 游戏管理面板 -->
          <div class="tab-panel active" id="games-panel">
            <div class="panel-actions">
              <button class="action-btn" id="exportConfigBtn">导出配置</button>
              <button class="action-btn" id="resetConfigBtn">重置配置</button>
            </div>
            <div class="games-list" id="gamesList"></div>
          </div>

          <!-- Banner管理面板 -->
          <div class="tab-panel" id="banners-panel">
            <div class="panel-actions">
              <button class="action-btn primary" id="addBannerBtn">添加Banner</button>
            </div>
            <div class="banners-list" id="bannersList"></div>
          </div>

          <!-- 推荐管理面板 -->
          <div class="tab-panel" id="recommend-panel">
            <div class="panel-header">
              <h3>今日推荐游戏</h3>
            </div>
            <div class="recommend-list" id="recommendList"></div>
          </div>

          <!-- 变更日志面板 -->
          <div class="tab-panel" id="logs-panel">
            <div class="panel-header">
              <h3>配置变更日志</h3>
            </div>
            <div class="logs-list" id="logsList"></div>
          </div>
        </div>
      </div>
    `;

    this.modal = modal;
    document.body.appendChild(modal);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.modal) return;

    // 关闭按钮
    const closeBtn = this.modal.querySelector('#configManagerClose');
    closeBtn?.addEventListener('click', () => this.close());

    // 点击遮罩关闭
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // 标签切换
    const tabBtns = this.modal.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (e.target as HTMLElement).dataset.tab;
        if (tab) {
          this.switchTab(tab);
        }
      });
    });

    // 游戏管理面板按钮
    const exportBtn = this.modal.querySelector('#exportConfigBtn');
    exportBtn?.addEventListener('click', () => this.exportConfig());

    const resetBtn = this.modal.querySelector('#resetConfigBtn');
    resetBtn?.addEventListener('click', () => this.resetConfig());

    // Banner管理面板按钮
    const addBannerBtn = this.modal.querySelector('#addBannerBtn');
    addBannerBtn?.addEventListener('click', () => this.showAddBannerDialog());
  }

  /**
   * 打开配置管理器
   */
  public open(): void {
    this.modal?.classList.add('show');
    this.renderGamesList();
    this.renderBannersList();
    this.renderRecommendList();
    this.renderLogsList();
  }

  /**
   * 关闭配置管理器
   */
  public close(): void {
    this.modal?.classList.remove('show');
  }

  /**
   * 切换标签
   */
  private switchTab(tab: string): void {
    if (!this.modal) return;

    // 更新按钮状态
    const tabBtns = this.modal.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tab);
    });

    // 更新面板显示
    const panels = this.modal.querySelectorAll('.tab-panel');
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tab}-panel`);
    });
  }

  /**
   * 渲染游戏列表
   */
  private renderGamesList(): void {
    const gamesList = this.modal?.querySelector('#gamesList');
    if (!gamesList) return;

    const games = homeConfigManager.getAllGames();
    const categories = homeConfigManager.getCategories();

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>游戏</th>
            <th>分类</th>
            <th>适用学龄</th>
            <th>状态</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    games.forEach(game => {
      const category = categories.find(c => c.code === game.category);
      const grades = game.grades.map(g => homeConfigManager.getGradeName(g)).join(', ');

      html += `
        <tr data-game-id="${game.id}">
          <td>
            <div class="game-info">
              <span class="game-icon">${game.icon}</span>
              <span class="game-name">${game.name}</span>
              ${game.isNew ? '<span class="badge new">新</span>' : ''}
              ${game.isHot ? '<span class="badge hot">热</span>' : ''}
            </div>
          </td>
          <td>${category?.name || game.category}</td>
          <td>${grades}</td>
          <td>
            <button class="status-btn ${game.enabled ? 'enabled' : 'disabled'}"
                    data-action="toggle-enable" data-game-id="${game.id}">
              ${game.enabled ? '已启用' : '已禁用'}
            </button>
          </td>
          <td>
            <input type="number" class="order-input" value="${game.order}"
                   data-action="update-order" data-game-id="${game.id}" min="1" max="999">
          </td>
          <td>
            <div class="action-buttons">
              <button class="icon-btn edit-btn" title="编辑" data-action="edit" data-game-id="${game.id}">✎</button>
              <button class="icon-btn recommend-btn" title="${game.enabled ? '添加到推荐' : '需先启用游戏'}"
                      data-action="toggle-recommend" data-game-id="${game.id}">★</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    gamesList.innerHTML = html;

    // 绑定事件
    this.bindGamesListEvents(gamesList);
  }

  /**
   * 绑定游戏列表事件
   */
  private bindGamesListEvents(container: HTMLElement): void {
    // 启用/禁用游戏
    container.querySelectorAll('[data-action="toggle-enable"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameId = (e.target as HTMLElement).dataset.gameId;
        if (gameId) {
          const game = homeConfigManager.getGameById(gameId);
          if (game) {
            const newStatus = !game.enabled;
            homeConfigManager.toggleGameEnabled(gameId, newStatus);
            this.renderGamesList();
            this.showToast(
              newStatus ? `游戏"${game.name}"已启用` : `游戏"${game.name}"已禁用`,
              newStatus ? '✓' : '✗'
            );
          }
        }
      });
    });

    // 更新排序
    container.querySelectorAll('.order-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const gameId = (e.target as HTMLElement).dataset.gameId;
        const order = parseInt((e.target as HTMLInputElement).value, 10);
        if (gameId && !isNaN(order)) {
          homeConfigManager.updateGameOrders([{ id: gameId, order }]);
          this.showToast('排序已更新', '✓');
        }
      });
    });

    // 编辑游戏
    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameId = (e.target as HTMLElement).dataset.gameId;
        if (gameId) {
          this.showEditGameDialog(gameId);
        }
      });
    });

    // 添加到推荐
    container.querySelectorAll('[data-action="toggle-recommend"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameId = (e.target as HTMLElement).dataset.gameId;
        if (gameId) {
          const game = homeConfigManager.getGameById(gameId);
          if (game && game.enabled) {
            homeConfigManager.addToTodayRecommend(gameId);
            this.showToast(`已将"${game.name}"添加到推荐`, '★');
          } else {
            this.showToast('需要先启用游戏才能添加到推荐', '⚠');
          }
        }
      });
    });
  }

  /**
   * 渲染Banner列表
   */
  private renderBannersList(): void {
    const bannersList = this.modal?.querySelector('#bannersList');
    if (!bannersList) return;

    const banners = homeConfigManager.getConfig().banners;

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>描述</th>
            <th>关联</th>
            <th>状态</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    banners.forEach(banner => {
      const relatedInfo = banner.gameId
        ? `游戏: ${homeConfigManager.getGameById(banner.gameId)?.name || '未知'}`
        : banner.route
        ? `路由: ${banner.route}`
        : '-';

      html += `
        <tr data-banner-id="${banner.id}">
          <td>${banner.title}</td>
          <td>${banner.description}</td>
          <td>${relatedInfo}</td>
          <td>
            <button class="status-btn ${banner.enabled ? 'enabled' : 'disabled'}"
                    data-action="toggle-banner" data-banner-id="${banner.id}">
              ${banner.enabled ? '已启用' : '已禁用'}
            </button>
          </td>
          <td>
            <input type="number" class="order-input" value="${banner.order}"
                   data-action="update-banner-order" data-banner-id="${banner.id}" min="1" max="999">
          </td>
          <td>
            <div class="action-buttons">
              <button class="icon-btn edit-btn" title="编辑" data-action="edit-banner" data-banner-id="${banner.id}">✎</button>
              <button class="icon-btn delete-btn" title="删除" data-action="delete-banner" data-banner-id="${banner.id}">🗑</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    bannersList.innerHTML = html;

    // 绑定事件
    this.bindBannersListEvents(bannersList);
  }

  /**
   * 绑定Banner列表事件
   */
  private bindBannersListEvents(container: HTMLElement): void {
    // 启用/禁用Banner
    container.querySelectorAll('[data-action="toggle-banner"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bannerId = (e.target as HTMLElement).dataset.bannerId;
        if (bannerId) {
          const banners = homeConfigManager.getConfig().banners;
          const banner = banners.find(b => b.id === bannerId);
          if (banner) {
            const newStatus = !banner.enabled;
            homeConfigManager.toggleBannerEnabled(bannerId, newStatus);
            this.renderBannersList();
            this.showToast(
              newStatus ? 'Banner已启用' : 'Banner已禁用',
              newStatus ? '✓' : '✗'
            );
          }
        }
      });
    });

    // 更新排序
    container.querySelectorAll('[data-action="update-banner-order"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const bannerId = (e.target as HTMLElement).dataset.bannerId;
        const order = parseInt((e.target as HTMLInputElement).value, 10);
        if (bannerId && !isNaN(order)) {
          homeConfigManager.updateBanner(bannerId, { order });
          this.showToast('排序已更新', '✓');
        }
      });
    });

    // 编辑Banner
    container.querySelectorAll('[data-action="edit-banner"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bannerId = (e.target as HTMLElement).dataset.bannerId;
        if (bannerId) {
          this.showEditBannerDialog(bannerId);
        }
      });
    });

    // 删除Banner
    container.querySelectorAll('[data-action="delete-banner"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bannerId = (e.target as HTMLElement).dataset.bannerId;
        if (bannerId && confirm('确定要删除这个Banner吗？')) {
          // 这里需要实现删除功能
          this.showToast('删除功能开发中', '⚠');
        }
      });
    });
  }

  /**
   * 渲染推荐列表
   */
  private renderRecommendList(): void {
    const recommendList = this.modal?.querySelector('#recommendList');
    if (!recommendList) return;

    const recommendGames = homeConfigManager.getTodayRecommend();

    if (recommendGames.length === 0) {
      recommendList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无推荐游戏</div>
          <div class="empty-hint">前往游戏管理添加推荐</div>
        </div>
      `;
      return;
    }

    let html = '<div class="recommend-grid">';
    recommendGames.forEach((game, index) => {
      html += `
        <div class="recommend-card" data-game-id="${game.id}">
          <div class="recommend-order">${index + 1}</div>
          <div class="recommend-icon">${game.icon}</div>
          <div class="recommend-name">${game.name}</div>
          <button class="remove-btn" data-action="remove-recommend" data-game-id="${game.id}">✕</button>
        </div>
      `;
    });
    html += '</div>';
    recommendList.innerHTML = html;

    // 绑定事件
    recommendList.querySelectorAll('[data-action="remove-recommend"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameId = (e.target as HTMLElement).dataset.gameId;
        if (gameId) {
          const game = homeConfigManager.getGameById(gameId);
          homeConfigManager.removeFromTodayRecommend(gameId);
          this.renderRecommendList();
          this.showToast(`已从推荐中移除"${game?.name}"`, '✓');
        }
      });
    });
  }

  /**
   * 渲染变更日志
   */
  private renderLogsList(): void {
    const logsList = this.modal?.querySelector('#logsList');
    if (!logsList) return;

    const logs = homeConfigManager.getChangeLogs(20);

    if (logs.length === 0) {
      logsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无变更日志</div>
        </div>
      `;
      return;
    }

    let html = '<div class="logs-container">';
    logs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleString('zh-CN');
      html += `
        <div class="log-item">
          <div class="log-header">
            <span class="log-operation">${this.getOperationText(log.operation)}</span>
            <span class="log-time">${time}</span>
          </div>
          <div class="log-content">
            <div class="log-target">目标: ${log.targetId}</div>
            ${log.remark ? `<div class="log-remark">备注: ${log.remark}</div>` : ''}
          </div>
        </div>
      `;
    });
    html += '</div>';
    logsList.innerHTML = html;
  }

  /**
   * 获取操作类型文本
   */
  private getOperationText(operation: string): string {
    const texts: Record<string, string> = {
      'enable_game': '启用游戏',
      'disable_game': '禁用游戏',
      'update_game_order': '更新游戏排序',
      'add_to_recommend': '添加到推荐',
      'remove_from_recommend': '从推荐移除',
      'update_banner': '更新Banner',
      'toggle_banner': '切换Banner状态',
    };
    return texts[operation] || operation;
  }

  /**
   * 显示编辑游戏对话框
   */
  private showEditGameDialog(gameId: string): void {
    const game = homeConfigManager.getGameById(gameId);
    if (!game) return;

    // 这里可以打开一个编辑对话框
    this.showToast('编辑游戏功能开发中', '⚠');
  }

  /**
   * 显示添加Banner对话框
   */
  private showAddBannerDialog(): void {
    this.showToast('添加Banner功能开发中', '⚠');
  }

  /**
   * 显示编辑Banner对话框
   */
  private showEditBannerDialog(bannerId: string): void {
    const banners = homeConfigManager.getConfig().banners;
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;

    this.showToast('编辑Banner功能开发中', '⚠');
  }

  /**
   * 导出配置
   */
  private exportConfig(): void {
    const config = homeConfigManager.exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('配置已导出', '📥');
  }

  /**
   * 重置配置
   */
  private resetConfig(): void {
    if (confirm('确定要重置为默认配置吗？此操作不可撤销。')) {
      homeConfigManager.resetToDefault();
      this.renderGamesList();
      this.renderBannersList();
      this.renderRecommendList();
      this.showToast('配置已重置', '🔄');
    }
  }

  /**
   * 显示提示消息
   */
  private showToast(message: string, icon: string = '✓'): void {
    const existingToast = document.querySelector('.config-manager-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'config-manager-toast';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}

/**
 * 导出单例（延迟实例化）
 */
let configManagerInstance: ConfigManagerUI | null = null;

export function getConfigManagerUI(): ConfigManagerUI {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManagerUI();
  }
  return configManagerInstance;
}

// 不在模块加载时立即创建实例
// 使用时通过 getConfigManagerUI() 获取


