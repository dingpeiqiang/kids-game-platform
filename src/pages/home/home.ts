/**
 * 儿童游戏平台首页交互逻辑
 * 功能：学龄选择、轮播Banner、游戏加载、家长验证、响应式交互
 * 优化：使用配置化加载，支持游戏定制化上架
 */

// 导入配置化服务
import { homeConfigService } from '../../services/home.config.service';
import type { GameConfig, BannerConfig } from '../../config/home.types';
import './styles/home.css';
import './config-manager/config-manager.css';

// ===== 类型定义 =====
interface Game {
  id: string;
  name: string;
  icon: string;
  ageRange: string;
  category: string;
  grade: string[];
  gameUrl?: string; // 游戏对应的场景名称
}

interface User {
  username: string;
  avatar: string;
  points: number;
  grade: string;
  recentGames: string[];
}

// ===== 从配置服务获取数据 =====
const GAMES_DATA: Game[] = []; // 将在初始化时从配置加载
const BANNER_DATA: BannerConfig[] = []; // 将在初始化时从配置加载

const AVATARS = ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🦁', '🐯', '🐸', '🐵'];

// ===== 配置化数据初始化函数 =====
function initializeConfigData(): void {
  // 从配置服务加载游戏数据
  const games = homeConfigService.getAllGames();
  GAMES_DATA.push(...games.map((game): Game => ({
    id: game.id,
    name: game.name,
    icon: game.icon,
    ageRange: game.ageRange,
    category: game.category,
    grade: game.grades,
    gameUrl: game.sceneName || game.gameUrl,
  })));

  // 从配置服务加载Banner数据
  const banners = homeConfigService.getBanners();
  BANNER_DATA.push(...banners);
}

// ===== 登录状态检查 =====
function checkLoginStatus(): boolean {
  console.log('[首页] 检查登录状态...');

  try {
    // 检查 localStorage 中是否有当前用户
    const currentUserData = localStorage.getItem('currentUser');

    if (!currentUserData) {
      console.log('[首页] 用户未登录，跳过首页初始化');
      return false; // 返回 false 表示未登录
    }

    // 已登录，更新首页用户信息
    const user = JSON.parse(currentUserData);
    console.log('[首页] 用户已登录:', user.username);

    // 确保移除 in-game 类和隐藏加载动画
    document.body.classList.remove('in-game');
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }

    // 更新首页用户信息
    updateUserInterface(user);

    return true; // 返回 true 表示已登录

  } catch (error) {
    console.error('[首页] 检查登录状态失败:', error);
    return false;
  }
}

// ===== 更新首页用户界面 =====
function updateUserInterface(user: any): void {
  console.log('[首页] 更新用户界面:', user);
  console.log('[首页] 用户数据:', JSON.stringify(user, null, 2));

  // 更新头部用户信息
  const headerUserInfo = document.getElementById('headerUserInfo');
  const headerAvatar = document.getElementById('headerAvatar');
  const headerUsername = document.getElementById('headerUsername');
  const headerLoginBtn = document.getElementById('headerLoginBtn');

  console.log('[首页] headerUserInfo:', headerUserInfo);
  console.log('[首页] headerAvatar:', headerAvatar);
  console.log('[首页] headerUsername:', headerUsername);
  console.log('[首页] headerLoginBtn:', headerLoginBtn);

  if (headerUserInfo && headerAvatar && headerUsername) {
    headerUserInfo.style.display = 'flex';
    headerAvatar.textContent = user.avatar || '🐱';
    headerUsername.textContent = user.username || '小玩家';
    console.log('[首页] ✓ 头部用户信息已更新:', {
      avatar: headerAvatar.textContent,
      username: headerUsername.textContent,
      display: headerUserInfo.style.display
    });
  } else {
    console.error('[首页] ✗ 头部用户信息元素未找到:', {
      headerUserInfo: !!headerUserInfo,
      headerAvatar: !!headerAvatar,
      headerUsername: !!headerUsername
    });
  }

  // 隐藏登录按钮
  if (headerLoginBtn) {
    headerLoginBtn.style.display = 'none';
    console.log('[首页] ✓ 登录按钮已隐藏');
  }

  // 更新个人中心的用户头像
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) {
    userAvatar.textContent = user.avatar || '🐱';
    console.log('[首页] ✓ 个人中心头像已更新:', userAvatar.textContent);
  } else {
    console.error('[首页] ✗ 个人中心头像元素未找到');
  }

  // 更新个人中心的用户名
  const username = document.getElementById('username');
  if (username) {
    username.textContent = user.username || '小玩家';
    console.log('[首页] ✓ 个人中心用户名已更新:', username.textContent);
  } else {
    console.error('[首页] ✗ 个人中心用户名元素未找到');
  }

  // 更新用户点数
  const userPoints = document.getElementById('userPoints');
  if (userPoints) {
    userPoints.textContent = (user.points || 0).toString();
    console.log('[首页] ✓ 用户点数已更新:', userPoints.textContent);
  } else {
    console.error('[首页] ✗ 用户点数元素未找到');
  }

  console.log('[首页] 用户界面更新完成');
}

// ===== 全局状态 =====
let currentUser: User = {
  username: '小玩家123',
  avatar: '🐱',
  points: 8,
  grade: homeConfigService.getDefaultGrade(), // 从配置获取默认学龄
  recentGames: [], // 初始为空，将从配置服务获取推荐
};

let currentCategory = homeConfigService.getDefaultCategory(); // 从配置获取默认分类
let currentBannerIndex = 0;
let bannerAutoPlayTimer: number | null = null;

// ===== DOM元素类型定义 =====
interface PageElements {
  // 头部导航
  gradeBtn: HTMLButtonElement;
  gradeDropdown: HTMLDivElement;
  currentGrade: HTMLSpanElement;
  hamburgerBtn: HTMLButtonElement;
  hamburgerMenu: HTMLDivElement;

  // 家长区
  parentBtn: HTMLButtonElement;
  parentBtnMobile: HTMLButtonElement;
  configBtn: HTMLButtonElement | null;
  rechargeBtn: HTMLButtonElement;
  rechargeBtnMobile: HTMLButtonElement;
  parentModal: HTMLDivElement;
  parentModalClose: HTMLButtonElement;
  parentPassword: HTMLInputElement;
  parentConfirm: HTMLButtonElement;

  // Banner
  bannerSlides: NodeListOf<HTMLDivElement>;
  bannerIndicators: NodeListOf<HTMLDivElement>;
  bannerPrev: HTMLButtonElement;
  bannerNext: HTMLButtonElement;

  // 游戏区
  gradeBadge: HTMLSpanElement;
  categoryBtns: NodeListOf<HTMLButtonElement>;
  gradeGamesGrid: HTMLDivElement;

  // 答题中心
  startQuizBtn: HTMLButtonElement;
  earnPointsBtn: HTMLButtonElement;

  // 个人中心
  userAvatar: HTMLDivElement;
  username: HTMLHeadingElement;
  userPoints: HTMLSpanElement;
  pointsNotice: HTMLDivElement;
  recentGamesList: HTMLDivElement;

  // 加载和提示
  loadingScreen: HTMLDivElement;
  toast: HTMLDivElement;
  toastIcon: HTMLSpanElement;
  toastText: HTMLSpanElement;
}

// ===== DOM元素（延迟初始化） =====
let elements: PageElements | null = null;

// ===== 工具函数 =====
function showToast(message: string, icon: string = '✨', duration: number = 2000): void {
  if (!elements || !elements.toast) return;
  elements.toastIcon.textContent = icon;
  elements.toastText.textContent = message;
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, duration);
}

function showLoading(): void {
  if (!elements || !elements.loadingScreen) return;
  elements.loadingScreen.style.display = 'flex';
}

function hideLoading(): void {
  if (!elements || !elements.loadingScreen) return;
  elements.loadingScreen.style.display = 'none';
}

// 判断游戏是否可玩
function isGamePlayable(game: Game): { canPlay: boolean; reason: string } {
  // 使用配置化服务判断游戏可玩性
  const gameConfig = homeConfigService.getGameById(game.id);
  if (!gameConfig) {
    return { canPlay: false, reason: '游戏不存在' };
  }

  const { canPlay, reason } = homeConfigService.isGamePlayable(gameConfig, currentUser.points);
  
  if (!canPlay) {
    return { canPlay: false, reason };
  }

  // 额外检查：如果有对应的游戏场景
  if (!gameConfig.sceneName && !gameConfig.gameUrl) {
    return { canPlay: false, reason: '即将上线' };
  }

  return { canPlay: true, reason: '' };
}

function navigateToGame(gameId: string): void {
  console.log('========== 游戏跳转开始 ==========');
  console.log('navigateToGame 被调用, gameId:', gameId);
  console.log('当前所有游戏数据:', GAMES_DATA.map(g => ({ id: g.id, name: g.name, gameUrl: g.gameUrl })));

  // 查找游戏信息
  const game = GAMES_DATA.find(g => g.id === gameId);
  if (!game) {
    console.error('❌ 游戏不存在:', gameId);
    console.log('可用的游戏ID:', GAMES_DATA.map(g => g.id));
    showToast('游戏不存在', '❌');
    return;
  }

  console.log('✓ 找到游戏:', game.name);
  console.log('游戏详细信息:', {
    id: game.id,
    name: game.name,
    icon: game.icon,
    ageRange: game.ageRange,
    category: game.category,
    grade: game.grade,
    gameUrl: game.gameUrl
  });

  // 检查游戏是否可玩
  const { canPlay, reason } = isGamePlayable(game);

  console.log('游戏可玩性检查:', { canPlay, reason });

  if (!canPlay) {
    console.warn('⚠️ 游戏不可玩:', reason);
    if (reason === '点数不足') {
      elements.pointsNotice.style.display = 'block';
      showToast('游戏点数用完啦，答题赚点吧～', '😿');
    } else if (reason === '即将上线') {
      showToast('该游戏即将上线，敬请期待～', '🚧');
    } else {
      showToast(`无法开始游戏：${reason}`, '❌');
    }
    return;
  }

  console.log('✓ 游戏可以玩，准备跳转...');
  console.log('当前用户点数:', currentUser.points);

  showLoading();

  // 模拟加载
  setTimeout(() => {
    hideLoading();

    // 更新最近游戏列表
    if (!currentUser.recentGames.includes(gameId)) {
      currentUser.recentGames.unshift(gameId);
      currentUser.recentGames = currentUser.recentGames.slice(0, 3);
      console.log('✓ 更新最近游戏列表:', currentUser.recentGames);
    }

    // 扣除点数
    currentUser.points -= 1;
    updateUserDisplay();
    console.log('✓ 扣除点数后剩余:', currentUser.points);

    // 获取场景名称
    const sceneName = game.gameUrl;
    console.log(`准备跳转游戏: ${gameId}, 场景: ${sceneName}`);

    // 检查场景名称是否有效
    if (!sceneName) {
      console.error('❌ 游戏缺少场景名称:', gameId);
      showToast('游戏配置错误，请联系管理员', '❌');
      return;
    }

    console.log('✓ 场景名称有效:', sceneName);

    showToast(`正在加载 ${game.name}...`, '🎮');

    // 跳转到游戏页面（只传递游戏ID，让 main.ts 内部处理场景映射）
    setTimeout(() => {
      const targetUrl = `/?game=${gameId}`;
      console.log('========== 开始跳转 ==========');
      console.log('目标URL:', targetUrl);
      console.log('游戏ID:', gameId);
      console.log('游戏名称:', game.name);
      console.log('================================');
      // 使用 replace 并添加时间戳确保重新加载
      window.location.replace(targetUrl + '&t=' + Date.now());
    }, 500);
  }, 1000);
}

// ===== 学龄选择 =====
function initGradeSelector(): void {
  // 从配置服务获取学龄数据
  const grades = homeConfigService.getGrades();
  const gradeNames: { [key: string]: string } = {};
  grades.forEach(grade => {
    gradeNames[grade.code] = grade.name;
  });

  // 设置初始学龄
  elements.currentGrade.textContent = gradeNames[currentUser.grade];
  elements.gradeBadge.textContent = gradeNames[currentUser.grade];

  // 标记当前选中的学龄
  const gradeOptions = elements.gradeDropdown.querySelectorAll('.grade-option');
  gradeOptions.forEach(option => {
    if (option.getAttribute('data-grade') === currentUser.grade) {
      option.classList.add('selected');
    }
  });
  
  // 点击学龄按钮
  elements.gradeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.gradeDropdown.classList.toggle('show');
  });
  
  // 选择学龄
  gradeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const grade = option.getAttribute('data-grade')!;
      currentUser.grade = grade;
      
      // 更新显示
      elements.currentGrade.textContent = gradeNames[grade];
      elements.gradeBadge.textContent = gradeNames[grade];
      
      // 更新选中状态
      gradeOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      
      // 关闭下拉菜单
      elements.gradeDropdown.classList.remove('show');
      
      // 刷新游戏列表
      loadGradeGames();
      
      showToast(`已切换到${GRADE_NAMES[grade]}`, '📚');
    });
  });
  
  // 点击其他地方关闭下拉菜单
  document.addEventListener('click', () => {
    elements.gradeDropdown.classList.remove('show');
  });
}

// ===== 汉堡菜单（移动端） =====
function initHamburgerMenu(): void {
  elements.hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.hamburgerMenu.classList.toggle('show');
  });
  
  document.addEventListener('click', () => {
    elements.hamburgerMenu.classList.remove('show');
  });
}

// ===== 家长验证 =====
function initParentZone(): void {
  const openParentModal = () => {
    elements.parentModal.classList.add('show');
    elements.parentPassword.value = '';
    elements.parentPassword.focus();
  };

  elements.parentBtn.addEventListener('click', openParentModal);
  elements.parentBtnMobile.addEventListener('click', openParentModal);

  // 配置管理按钮（动态加载）
  if (elements.configBtn) {
    elements.configBtn.addEventListener('click', () => {
      // 动态导入配置管理器
      import('./config-manager/config-manager').then(module => {
        const configManagerUI = module.getConfigManagerUI();
        configManagerUI.open();
      }).catch(err => {
        console.error('加载配置管理器失败:', err);
        showToast('配置管理器加载失败', '❌');
      });
    });
  }

  // 充值按钮
  const openRecharge = () => {
    showToast('充值功能开发中...', '💎');
  };

  elements.rechargeBtn.addEventListener('click', openRecharge);
  elements.rechargeBtnMobile.addEventListener('click', openRecharge);
  
  // 关闭弹窗
  elements.parentModalClose.addEventListener('click', () => {
    elements.parentModal.classList.remove('show');
  });
  
  // 确认按钮
  elements.parentConfirm.addEventListener('click', () => {
    const password = elements.parentPassword.value;
    if (password === '123456') { // 模拟密码
      elements.parentModal.classList.remove('show');
      showToast('家长验证成功', '✓');
      // 跳转到家长中心
      console.log('进入家长中心');
    } else {
      showToast('密码错误，请重试', '✗');
      elements.parentPassword.value = '';
      elements.parentPassword.focus();
    }
  });
  
  // Enter键确认
  elements.parentPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      elements.parentConfirm.click();
    }
  });
}

// ===== 轮播Banner =====
function initBanner(): void {
  // 从配置获取Banner自动播放间隔
  const autoPlayInterval = homeConfigService.getBannerAutoPlayInterval();

  // 自动播放
  const startAutoPlay = () => {
    bannerAutoPlayTimer = window.setInterval(() => {
      currentBannerIndex = (currentBannerIndex + 1) % elements.bannerSlides.length;
      updateBanner();
    }, autoPlayInterval);
  };
  
  const stopAutoPlay = () => {
    if (bannerAutoPlayTimer) {
      clearInterval(bannerAutoPlayTimer);
      bannerAutoPlayTimer = null;
    }
  };
  
  const updateBanner = () => {
    elements.bannerSlides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentBannerIndex);
    });
    
    elements.bannerIndicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentBannerIndex);
    });
  };
  
  // 左右箭头
  elements.bannerPrev.addEventListener('click', () => {
    stopAutoPlay();
    currentBannerIndex = (currentBannerIndex - 1 + elements.bannerSlides.length) % elements.bannerSlides.length;
    updateBanner();
    startAutoPlay();
  });
  
  elements.bannerNext.addEventListener('click', () => {
    stopAutoPlay();
    currentBannerIndex = (currentBannerIndex + 1) % elements.bannerSlides.length;
    updateBanner();
    startAutoPlay();
  });
  
  // 指示器点击
  elements.bannerIndicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      stopAutoPlay();
      currentBannerIndex = index;
      updateBanner();
      startAutoPlay();
    });
  });
  
  // Banner按钮点击
  elements.bannerSlides.forEach(slide => {
    const playBtn = slide.querySelector('.banner-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const gameId = slide.getAttribute('data-game');
        const bannerConfig = BANNER_DATA.find(b => b.id === slide.getAttribute('data-banner-id'));

        if (gameId) {
          // 跳转到游戏
          navigateToGame(gameId);
        } else if (bannerConfig?.route === 'quiz-center') {
          // 跳转到答题中心
          startQuiz();
        } else if (bannerConfig?.route) {
          // 跳转到指定路由
          window.location.href = `#${bannerConfig.route}`;
        } else {
          showToast('即将开始游戏', '🎮');
        }
      });
    }
  });
  
  // 开始自动播放
  startAutoPlay();
}

// ===== 游戏分类和列表 =====
function initGameCategories(): void {
  elements.categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category')!;
      
      // 更新选中状态
      elements.categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentCategory = category;
      loadGradeGames();
    });
  });
}

function loadGradeGames(): void {
  console.log('========== 加载学龄游戏 ==========');
  console.log('当前学龄:', currentUser.grade, '当前分类:', currentCategory);
  console.log('可用游戏总数:', GAMES_DATA.length);

  // 筛选当前学龄和分类的游戏
  const filteredGames = GAMES_DATA.filter(game =>
    game.grade.includes(currentUser.grade) && game.category === currentCategory
  );

  console.log('筛选后的游戏数量:', filteredGames.length);
  console.log('筛选结果:', filteredGames.map(g => ({
    id: g.id,
    name: g.name,
    grade: g.grade,
    category: g.category,
    gameUrl: g.gameUrl
  })));

  // 清空游戏网格
  elements.gradeGamesGrid.innerHTML = '';

  // 生成游戏卡片
  filteredGames.forEach(game => {
    const { canPlay, reason } = isGamePlayable(game);

    console.log(`创建游戏卡片: ${game.name} (${game.id}), 可玩: ${canPlay}, 原因: ${reason}`);

    const gameCard = document.createElement('div');
    gameCard.className = `game-card ${canPlay ? '' : 'locked'}`;
    gameCard.setAttribute('data-game', game.id);

    // 构建卡片内容
    let cardContent = `
      <div class="game-cover">${game.icon}</div>
      <div class="game-name">${game.name}</div>
      <div class="game-age">${game.ageRange}</div>
    `;

    // 如果不可玩，添加状态标签
    if (!canPlay) {
      cardContent += `
        <div class="game-status-badge">
          <span class="badge-icon">${reason === '点数不足' ? '🔒' : '🚧'}</span>
          <span class="badge-text">${reason}</span>
        </div>
      `;
    }

    gameCard.innerHTML = cardContent;

    // 使用 pointerdown 事件替代 click，确保在所有情况下都能触发
    gameCard.addEventListener('click', (e) => {
      console.log(`🎮 学龄游戏卡片被点击: ${game.name} (${game.id})`);
      e.preventDefault();
      e.stopPropagation();
      navigateToGame(game.id);
    });

    // 添加触摸支持
    gameCard.addEventListener('touchstart', (e) => {
      console.log(`👆 学龄游戏卡片被触摸: ${game.name} (${game.id})`);
      e.preventDefault();
      navigateToGame(game.id);
    });

    // 确保游戏卡片有正确的光标样式
    gameCard.style.cursor = canPlay ? 'pointer' : 'not-allowed';

    elements.gradeGamesGrid.appendChild(gameCard);
  });

  console.log('✓ 已创建', filteredGames.length, '个游戏卡片');
  console.log('================================');

  // 如果没有游戏，显示提示
  if (filteredGames.length === 0) {
    elements.gradeGamesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #999;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
        <div>该分类暂无适合当前学龄的游戏</div>
      </div>
    `;
    console.log('⚠️ 没有找到符合条件的游戏');
  }
}

// ===== 答题中心 =====
function startQuiz(): void {
  showToast('答题功能开发中...', '✏️');
  // 实际项目中应该跳转到答题页面
}

function initQuizCenter(): void {
  elements.startQuizBtn.addEventListener('click', startQuiz);
  elements.earnPointsBtn.addEventListener('click', startQuiz);
}

// ===== 个人中心 =====
function updateUserDisplay(): void {
  elements.username.textContent = currentUser.username;
  elements.userAvatar.textContent = currentUser.avatar;
  elements.userPoints.textContent = currentUser.points.toString();
  
  // 点数不足时显示提示
  if (currentUser.points <= 0) {
    elements.pointsNotice.style.display = 'block';
    elements.userPoints.style.color = '#999';
  } else {
    elements.pointsNotice.style.display = 'none';
    elements.userPoints.style.color = '#FFD666';
  }
  
  // 更新最近游戏列表
  loadRecentGames();
}

function loadRecentGames(): void {
  console.log('========== 加载最近游戏 ==========');
  elements.recentGamesList.innerHTML = '';

  const recentGames = currentUser.recentGames
    .map(gameId => {
      const game = GAMES_DATA.find(g => g.id === gameId);
      if (!game) {
        console.warn('⚠️ 最近游戏列表中的游戏未找到:', gameId);
      }
      return game;
    })
    .filter(Boolean) as Game[];

  console.log('最近游戏列表:', recentGames.map(g => g.id));

  recentGames.slice(0, 3).forEach(game => {
    const { canPlay, reason } = isGamePlayable(game);

    console.log(`创建最近游戏卡片: ${game.name} (${game.id}), 可玩: ${canPlay}`);

    const gameCard = document.createElement('div');
    gameCard.className = `recent-game-card ${canPlay ? '' : 'locked'}`;
    gameCard.setAttribute('data-game', game.id);

    let cardContent = `
      <div class="recent-cover">${game.icon}</div>
      <div class="recent-name">${game.name}</div>
    `;

    // 如果不可玩，添加状态标签
    if (!canPlay) {
      cardContent += `
        <div class="game-status-badge">
          <span class="badge-icon">${reason === '点数不足' ? '🔒' : '🚧'}</span>
          <span class="badge-text">${reason}</span>
        </div>
      `;
    }

    gameCard.innerHTML = cardContent;

    // 使用 pointerdown 事件替代 click，确保在所有情况下都能触发
    gameCard.addEventListener('click', (e) => {
      console.log(`🎮 最近游戏卡片被点击: ${game.name} (${game.id})`);
      e.preventDefault();
      e.stopPropagation();
      navigateToGame(game.id);
    });

    // 添加触摸支持
    gameCard.addEventListener('touchstart', (e) => {
      console.log(`👆 最近游戏卡片被触摸: ${game.name} (${game.id})`);
      e.preventDefault();
      navigateToGame(game.id);
    });

    // 确保游戏卡片有正确的光标样式
    gameCard.style.cursor = canPlay ? 'pointer' : 'not-allowed';

    elements.recentGamesList.appendChild(gameCard);
  });

  console.log('✓ 最近游戏加载完成');
  console.log('================================');
}

function initProfile(): void {
  // 头像点击更换
  elements.userAvatar.addEventListener('click', () => {
    const currentIndex = AVATARS.indexOf(currentUser.avatar);
    const nextIndex = (currentIndex + 1) % AVATARS.length;
    currentUser.avatar = AVATARS[nextIndex];
    elements.userAvatar.textContent = currentUser.avatar;
    showToast('头像已更换', '😊');
  });
}

// ===== 退出登录 =====
function initLogout(): void {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('currentUser');
      showToast('已退出登录', '👋');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  });
}

// ===== 头部登录按钮 =====
function initHeaderLoginBtn(): void {
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  if (!headerLoginBtn) return;

  headerLoginBtn.addEventListener('click', () => {
    // 显示登录场景
    document.body.classList.add('in-game');
    const gameScript = document.createElement('script');
    gameScript.type = 'module';
    gameScript.src = '/src/main.ts';
    document.body.appendChild(gameScript);
  });
}

// ===== 游戏卡片点击（今日推荐） =====
function initGameCards(): void {
  console.log('========== 初始化游戏卡片（今日推荐） ==========');
  console.log('当前可用游戏数量:', GAMES_DATA.length);
  console.log('所有游戏ID:', GAMES_DATA.map(g => g.id));

  const todayGameCards = document.querySelectorAll('.game-card[data-game]');
  console.log('找到', todayGameCards.length, '个游戏卡片');

  todayGameCards.forEach((card, index) => {
    const gameId = card.getAttribute('data-game');
    console.log(`卡片 ${index}: data-game="${gameId}"`);

    if (!gameId) {
      console.warn('⚠️ 游戏卡片缺少 data-game 属性');
      return;
    }

    const game = GAMES_DATA.find(g => g.id === gameId);
    if (!game) {
      console.warn('⚠️ 未找到游戏配置:', gameId);
      console.warn('可用游戏ID:', GAMES_DATA.map(g => g.id));
      return;
    }

    const { canPlay, reason } = isGamePlayable(game);

    console.log(`✓ 处理游戏卡片: ${game.name} (${gameId}), 可玩: ${canPlay}`);

    // 如果不可玩，添加锁定类和状态标签
    if (!canPlay) {
      card.classList.add('locked');

      // 添加状态标签
      const badge = document.createElement('div');
      badge.className = 'game-status-badge';
      badge.innerHTML = `
        <span class="badge-icon">${reason === '点数不足' ? '🔒' : '🚧'}</span>
        <span class="badge-text">${reason}</span>
      `;
      card.appendChild(badge);
    }

    // 移除旧的事件监听器
    const newCard = card.cloneNode(true) as HTMLElement;
    card.parentNode?.replaceChild(newCard, card);

    // 添加新的事件监听器
    newCard.addEventListener('click', (e) => {
      console.log(`🎮 今日推荐游戏卡片被点击: ${game.name} (${gameId})`);
      e.preventDefault();
      e.stopPropagation();
      navigateToGame(gameId);
    });

    // 添加触摸支持
    newCard.addEventListener('touchstart', (e) => {
      console.log(`👆 今日推荐游戏卡片被触摸: ${game.name} (${gameId})`);
      e.preventDefault();
      navigateToGame(gameId);
    });

    // 设置正确的光标样式
    newCard.style.cursor = canPlay ? 'pointer' : 'not-allowed';

    console.log(`✓ 已为游戏卡片 ${game.name} 添加点击事件监听器`);
  });

  console.log('✓ 游戏卡片初始化完成');
  console.log('================================');
}

// ===== 键盘导航（电视端） =====
function initKeyboardNavigation(): void {
  let focusedElement: HTMLElement | null = null;
  
  document.addEventListener('keydown', (e) => {
    // 只在电视端或需要键盘导航时启用
    const focusableElements = document.querySelectorAll(
      'button, a, input, .game-card, .category-btn'
    );
    const focusableArray = Array.from(focusableElements) as HTMLElement[];
    
    if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      if (!focusedElement) {
        focusedElement = focusableArray[0];
      } else {
        const currentIndex = focusableArray.indexOf(focusedElement);
        const nextIndex = (currentIndex + 1) % focusableArray.length;
        focusedElement = focusableArray[nextIndex];
      }
      
      focusedElement.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      if (!focusedElement) {
        focusedElement = focusableArray[focusableArray.length - 1];
      } else {
        const currentIndex = focusableArray.indexOf(focusedElement);
        const prevIndex = (currentIndex - 1 + focusableArray.length) % focusableArray.length;
        focusedElement = focusableArray[prevIndex];
      }
      
      focusedElement.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (focusedElement) {
        focusedElement.click();
      }
    }
  });
}

// ===== 加载游戏脚本 =====
function loadGameScript(gameId: string): void {
  console.log('加载游戏脚本，游戏ID:', gameId);

  const gameScript = document.createElement('script');
  gameScript.type = 'module';
  gameScript.src = '/src/main.ts';

  gameScript.onload = () => {
    console.log('✓ 游戏脚本加载成功');
  };

  gameScript.onerror = (error) => {
    console.error('❌ 游戏脚本加载失败:', error);
    showToast('游戏加载失败，请刷新页面重试', '❌');
  };

  document.body.appendChild(gameScript);
  console.log('脚本标签已添加到页面');
}

// ===== 初始化 =====
function init(): void {
  console.log('首页初始化...');

  // 检查是否有游戏参数
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('game');

  if (gameId) {
    console.log('检测到游戏参数:', gameId, '，准备加载游戏');
    // 隐藏首页内容，加载游戏
    document.body.classList.add('in-game');
    loadGameScript(gameId);
    return; // 不继续初始化首页
  }

  // ✅ 检查登录状态 - 如果未登录则不继续初始化首页
  const isLoggedIn = checkLoginStatus();
  if (!isLoggedIn) {
    console.log('[首页] 用户未登录，跳过首页初始化');
    return;
  }

  // 获取DOM元素
  elements = {
    // 头部导航
    gradeBtn: document.getElementById('gradeBtn') as HTMLButtonElement,
    gradeDropdown: document.getElementById('gradeDropdown') as HTMLDivElement,
    currentGrade: document.getElementById('currentGrade') as HTMLSpanElement,
    hamburgerBtn: document.getElementById('hamburgerBtn') as HTMLButtonElement,
    hamburgerMenu: document.getElementById('hamburgerMenu') as HTMLDivElement,

    // 家长区
    parentBtn: document.getElementById('parentBtn') as HTMLButtonElement,
    parentBtnMobile: document.getElementById('parentBtnMobile') as HTMLButtonElement,
    configBtn: document.getElementById('configBtn') as HTMLButtonElement,
    rechargeBtn: document.getElementById('rechargeBtn') as HTMLButtonElement,
    rechargeBtnMobile: document.getElementById('rechargeBtnMobile') as HTMLButtonElement,
    parentModal: document.getElementById('parentModal') as HTMLDivElement,
    parentModalClose: document.getElementById('parentModalClose') as HTMLButtonElement,
    parentPassword: document.getElementById('parentPassword') as HTMLInputElement,
    parentConfirm: document.getElementById('parentConfirm') as HTMLButtonElement,

    // Banner
    bannerSlides: document.querySelectorAll('.banner-slide') as NodeListOf<HTMLDivElement>,
    bannerIndicators: document.querySelectorAll('.indicator') as NodeListOf<HTMLDivElement>,
    bannerPrev: document.getElementById('bannerPrev') as HTMLButtonElement,
    bannerNext: document.getElementById('bannerNext') as HTMLButtonElement,

    // 游戏区
    gradeBadge: document.getElementById('gradeBadge') as HTMLSpanElement,
    categoryBtns: document.querySelectorAll('.category-btn') as NodeListOf<HTMLButtonElement>,
    gradeGamesGrid: document.getElementById('gradeGamesGrid') as HTMLDivElement,

    // 答题中心
    startQuizBtn: document.getElementById('startQuizBtn') as HTMLButtonElement,
    earnPointsBtn: document.getElementById('earnPointsBtn') as HTMLButtonElement,

    // 个人中心
    userAvatar: document.getElementById('userAvatar') as HTMLDivElement,
    username: document.getElementById('username') as HTMLHeadingElement,
    userPoints: document.getElementById('userPoints') as HTMLSpanElement,
    pointsNotice: document.getElementById('pointsNotice') as HTMLDivElement,
    recentGamesList: document.getElementById('recentGamesList') as HTMLDivElement,

    // 加载和提示
    loadingScreen: document.getElementById('loadingScreen') as HTMLDivElement,
    toast: document.getElementById('toast') as HTMLDivElement,
    toastIcon: document.getElementById('toastIcon') as HTMLSpanElement,
    toastText: document.getElementById('toastText') as HTMLSpanElement,
  };

  // 检查关键DOM元素是否存在
  const missingElements: string[] = [];
  if (elements) {
    Object.entries(elements).forEach(([key, element]) => {
      if (element === null && key !== 'configBtn') { // configBtn是可选的
        missingElements.push(key);
      }
    });
  }

  if (missingElements.length > 0) {
    console.error('以下DOM元素未找到:', missingElements);
  }

  // 初始化配置数据
  try {
    initializeConfigData();
    console.log('配置数据初始化完成');
  } catch (error) {
    console.error('配置数据初始化失败:', error);
  }

  // 初始化各个模块
  if (elements) {
    initGradeSelector();
    initHamburgerMenu();
    initParentZone();
    initBanner();
    initGameCategories();
    initQuizCenter();
    initProfile();
    initGameCards();
    initKeyboardNavigation();
    initLogout();
    initHeaderLoginBtn();

    // 加载数据
    loadGradeGames();
    updateUserDisplay();
  }

  console.log('首页初始化完成');
  console.log(`配置版本: ${homeConfigService.getConfigVersion()}`);
  console.log(`配置更新时间: ${homeConfigService.getConfigUpdateTime()}`);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
