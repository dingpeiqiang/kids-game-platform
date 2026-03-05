/**
 * 用户管理服务
 * 模拟用户登录、在线用户管理、对战申请功能
 */

interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'in-battle';
  points: number;
}

interface BattleRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  gameId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  timestamp: number;
}

class UserService {
  private static instance: UserService;

  // 当前登录用户
  private currentUser: User | null = null;

  // 模拟在线用户列表
  private onlineUsers: User[] = [];

  // 对战申请列表
  private battleRequests: Map<string, BattleRequest> = new Map();

  // 事件监听器
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    this.loadCurrentUser();
    this.loadOnlineUsers();
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * 获取当前登录用户
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 用户登录
   */
  login(username: string, password?: string): User {
    const user: User = {
      id: this.generateUserId(),
      username,
      avatar: this.getRandomAvatar(),
      status: 'online',
      points: Math.floor(Math.random() * 100) + 10, // 随机初始点数
    };

    this.currentUser = user;
    this.saveCurrentUser(user);

    // 添加到在线用户列表
    this.addOnlineUser(user);

    this.emit('user:login', user);
    console.log(`[UserService] 用户登录: ${username}`);
    return user;
  }

  /**
   * 用户注册
   */
  register(username: string, password: string): { success: boolean; message: string; user?: User } {
    // 验证用户名
    if (!username || username.trim().length === 0) {
      return { success: false, message: '用户名不能为空' };
    }

    if (username.length < 3) {
      return { success: false, message: '用户名至少需要3个字符' };
    }

    if (username.length > 15) {
      return { success: false, message: '用户名最多15个字符' };
    }

    // 验证密码
    if (!password || password.length < 4) {
      return { success: false, message: '密码至少需要4个字符' };
    }

    // 检查用户名是否已注册
    const existingUsers = this.getRegisteredUsers();
    if (existingUsers.some(u => u.username === username)) {
      return { success: false, message: '用户名已被注册' };
    }

    // 创建新用户
    const user: User = {
      id: this.generateUserId(),
      username,
      avatar: this.getRandomAvatar(),
      status: 'online',
      points: 100, // 注册赠送100点数
    };

    // 保存用户信息
    this.saveRegisteredUser(user, password);

    // 自动登录
    this.currentUser = user;
    this.saveCurrentUser(user);
    this.addOnlineUser(user);

    this.emit('user:register', user);
    console.log(`[UserService] 用户注册: ${username}`);
    return { success: true, message: '注册成功', user };
  }

  /**
   * 验证登录（检查用户名是否已注册）
   */
  validateLogin(username: string): { success: boolean; message: string; registered: boolean } {
    const existingUsers = this.getRegisteredUsers();
    const exists = existingUsers.some(u => u.username === username);

    if (!exists) {
      return { success: false, message: '用户未注册，请先注册', registered: false };
    }

    return { success: true, message: '登录成功', registered: true };
  }

  /**
   * 用户登出
   */
  logout(): void {
    if (!this.currentUser) return;

    // 从在线用户中移除
    this.removeOnlineUser(this.currentUser.id);

    // 取消所有未处理的对战申请
    this.cancelAllRequests(this.currentUser.id);

    this.currentUser = null;
    localStorage.removeItem('currentUser');

    this.emit('user:logout', null);
    console.log('[UserService] 用户登出');
  }

  /**
   * 获取在线用户列表（排除当前用户）
   */
  getOnlineUsers(): User[] {
    if (!this.currentUser) return [];
    return this.onlineUsers.filter((user) => user.id !== this.currentUser?.id);
  }

  /**
   * 发起对战申请
   */
  sendBattleRequest(targetUserId: string, gameId: string): BattleRequest {
    if (!this.currentUser) {
      throw new Error('请先登录');
    }

    const request: BattleRequest = {
      id: this.generateRequestId(),
      fromUserId: this.currentUser.id,
      fromUsername: this.currentUser.username,
      toUserId: targetUserId,
      gameId,
      status: 'pending',
      timestamp: Date.now(),
    };

    this.battleRequests.set(request.id, request);

    // 模拟发送通知给目标用户
    this.emit('battle:request', request);

    console.log(`[UserService] 发送对战申请: ${this.currentUser.username} -> ${targetUserId}`);
    return request;
  }

  /**
   * 接受对战申请
   */
  acceptBattleRequest(requestId: string): BattleRequest {
    const request = this.battleRequests.get(requestId);
    if (!request) {
      throw new Error('对战申请不存在');
    }

    if (request.status !== 'pending') {
      throw new Error('该申请已被处理');
    }

    request.status = 'accepted';
    this.battleRequests.set(requestId, request);

    // 更新用户状态
    const fromUser = this.onlineUsers.find((u) => u.id === request.fromUserId);
    if (fromUser) fromUser.status = 'in-battle';

    if (this.currentUser) this.currentUser.status = 'in-battle';

    this.emit('battle:accepted', request);
    console.log(`[UserService] 对战申请已接受: ${requestId}`);

    return request;
  }

  /**
   * 拒绝对战申请
   */
  rejectBattleRequest(requestId: string): BattleRequest {
    const request = this.battleRequests.get(requestId);
    if (!request) {
      throw new Error('对战申请不存在');
    }

    if (request.status !== 'pending') {
      throw new Error('该申请已被处理');
    }

    request.status = 'rejected';
    this.battleRequests.set(requestId, request);

    this.emit('battle:rejected', request);
    console.log(`[UserService] 对战申请已拒绝: ${requestId}`);

    return request;
  }

  /**
   * 获取收到的对战申请列表
   */
  getReceivedRequests(): BattleRequest[] {
    if (!this.currentUser) return [];

    return Array.from(this.battleRequests.values())
      .filter((req) => req.toUserId === this.currentUser?.id && req.status === 'pending')
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取发送的对战申请列表
   */
  getSentRequests(): BattleRequest[] {
    if (!this.currentUser) return [];

    return Array.from(this.battleRequests.values())
      .filter((req) => req.fromUserId === this.currentUser?.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 取消对战申请
   */
  cancelBattleRequest(requestId: string): void {
    const request = this.battleRequests.get(requestId);
    if (!request) return;

    request.status = 'cancelled';
    this.battleRequests.delete(requestId);

    this.emit('battle:cancelled', request);
    console.log(`[UserService] 对战申请已取消: ${requestId}`);
  }

  /**
   * 添加在线用户
   */
  private addOnlineUser(user: User): void {
    // 检查是否已存在
    const existingIndex = this.onlineUsers.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.onlineUsers[existingIndex] = user;
    } else {
      this.onlineUsers.push(user);
    }
    this.saveOnlineUsers();
    this.emit('user:online', user);
  }

  /**
   * 移除在线用户
   */
  private removeOnlineUser(userId: string): void {
    this.onlineUsers = this.onlineUsers.filter((u) => u.id !== userId);
    this.saveOnlineUsers();
    this.emit('user:offline', userId);
  }

  /**
   * 取消用户的所有申请
   */
  private cancelAllRequests(userId: string): void {
    this.battleRequests.forEach((request, id) => {
      if (request.fromUserId === userId || request.toUserId === userId) {
        request.status = 'cancelled';
        this.battleRequests.delete(id);
      }
    });
  }

  /**
   * 事件监听
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * 取消事件监听
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * 保存当前用户到本地存储
   */
  private saveCurrentUser(user: User): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (e) {
      console.error('[UserService] 保存用户失败:', e);
    }
  }

  /**
   * 从本地存储加载当前用户
   */
  private loadCurrentUser(): void {
    try {
      const data = localStorage.getItem('currentUser');
      if (data) {
        this.currentUser = JSON.parse(data);
        // 恢复在线状态
        if (this.currentUser) {
          this.currentUser.status = 'online';
          this.addOnlineUser(this.currentUser);
        }
      }
    } catch (e) {
      console.error('[UserService] 加载用户失败:', e);
    }
  }

  /**
   * 获取已注册用户列表
   */
  private getRegisteredUsers(): any[] {
    try {
      const data = localStorage.getItem('registeredUsers');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[UserService] 加载注册用户失败:', e);
      return [];
    }
  }

  /**
   * 保存注册用户
   */
  private saveRegisteredUser(user: User, password: string): void {
    try {
      const users = this.getRegisteredUsers();
      users.push({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        password: btoa(password), // 简单加密（仅用于演示）
        createdAt: Date.now(),
        points: user.points
      });
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    } catch (e) {
      console.error('[UserService] 保存注册用户失败:', e);
    }
  }

  /**
   * 保存在线用户到本地存储
   */
  private saveOnlineUsers(): void {
    try {
      localStorage.setItem('onlineUsers', JSON.stringify(this.onlineUsers));
    } catch (e) {
      console.error('[UserService] 保存在线用户失败:', e);
    }
  }

  /**
   * 加载在线用户（模拟其他用户）
   */
  private loadOnlineUsers(): void {
    try {
      const data = localStorage.getItem('onlineUsers');
      if (data) {
        this.onlineUsers = JSON.parse(data);
      } else {
        // 初始化一些模拟的在线用户
        this.initializeMockUsers();
      }
    } catch (e) {
      console.error('[UserService] 加载在线用户失败:', e);
      this.initializeMockUsers();
    }
  }

  /**
   * 初始化模拟用户
   */
  private initializeMockUsers(): void {
    const mockUsers: User[] = [
      { id: 'mock1', username: '小明', avatar: '🐱', status: 'online', points: 50 },
      { id: 'mock2', username: '小红', avatar: '🐶', status: 'online', points: 80 },
      { id: 'mock3', username: '小华', avatar: '🐰', status: 'online', points: 30 },
      { id: 'mock4', username: '小丽', avatar: '🐻', status: 'offline', points: 100 },
      { id: 'mock5', username: '小强', avatar: '🐼', status: 'online', points: 60 },
    ];
    this.onlineUsers = mockUsers;
    this.saveOnlineUsers();
  }

  /**
   * 生成用户ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 随机头像
   */
  private getRandomAvatar(): string {
    const avatars = ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🦁', '🐯', '🐮', '🐷'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  /**
   * 清理服务
   */
  destroy(): void {
    this.listeners.clear();
    this.battleRequests.clear();
  }
}

// 导出单例实例
export const userService = UserService.getInstance();
export type { User, BattleRequest };
