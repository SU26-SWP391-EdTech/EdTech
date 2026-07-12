import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionManager {
  /**
   * userId -> socketId
   */
  private readonly userConnections = new Map<number, string>();

  /**
   * socketId -> userId
   */
  private readonly socketConnections = new Map<string, number>();

  /**
   * User kết nối websocket
   */
  addConnection(userId: number, socketId: string): void {
    this.userConnections.set(userId, socketId);
    this.socketConnections.set(socketId, userId);
  }

  /**
   * User ngắt kết nối websocket
   */
  removeConnection(socketId: string): void {
    const userId = this.socketConnections.get(socketId);

    if (!userId) return;

    this.socketConnections.delete(socketId);
    this.userConnections.delete(userId);
  }

  /**
   * Lấy socketId theo userId
   */
  getSocketId(userId: number): string | undefined {
    return this.userConnections.get(userId);
  }

  /**
   * Lấy userId theo socketId
   */
  getUserId(socketId: string): number | undefined {
    return this.socketConnections.get(socketId);
  }

  /**
   * Kiểm tra user có online không
   */
  isOnline(userId: number): boolean {
    return this.userConnections.has(userId);
  }

  /**
   * Danh sách user đang online
   */
  getOnlineUsers(): number[] {
    return [...this.userConnections.keys()];
  }

  /**
   * Số lượng user online
   */
  countOnlineUsers(): number {
    return this.userConnections.size;
  }

  /**
   * Xóa toàn bộ connection (testing/shutdown)
   */
  clear(): void {
    this.userConnections.clear();
    this.socketConnections.clear();
  }
}