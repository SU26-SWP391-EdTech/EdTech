import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ConnectionManager } from '../manager/connection.manager';

@Injectable()
export class SocketService {
  private server!: Server;

  constructor(
    private readonly connectionManager: ConnectionManager,
  ) {}

  /**
   * Được Gateway gọi khi khởi động
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Gửi event tới 1 user
   */
  emitToUser(
    userId: number,
    event: string,
    payload: any,
  ): void {
    if (!this.server) {
        throw new Error('Socket server has not been initialized.');
      }

    const socketId =
      this.connectionManager.getSocketId(userId);

    if (!socketId) {
      return;
    }

    this.server
      .to(socketId)
      .emit(event, payload);
  }

  /**
   * Gửi event tới nhiều user
   */
  emitToUsers(
    userIds: number[],
    event: string,
    payload: any,
  ): void {
    if (!this.server) {
        throw new Error('Socket server has not been initialized.');
    }

    for (const userId of userIds) {
      this.emitToUser(userId, event, payload);
    }
  }

  /**
   * Broadcast tới toàn bộ client
   */
  broadcast(
    event: string,
    payload: any,
  ): void {
    if (!this.server) {
        throw new Error('Socket server has not been initialized.');
    }
    
    this.server.emit(event, payload);
  }

  /**
   * Gửi tới một room
   */
  emitToRoom(
    roomId: string,
    event: string,
    payload: any,
  ): void {
    if (!this.server) {
        throw new Error('Socket server has not been initialized.');
    }

    this.server
      .to(roomId)
      .emit(event, payload);
  }

  async joinUserToRoom(
    userId: number,
    roomId: string,
  ): Promise<void> {
    if (!this.server) {
      throw new Error('Socket server has not been initialized.');
    }

    const socketId = this.connectionManager.getSocketId(userId);

    if (!socketId) {
      return;
    }

    const socket = this.server.sockets.sockets.get(socketId);

    if (!socket) {
      return;
    }

    await socket.join(roomId);
  }

  async leaveUserFromRoom(
    userId: number,
    roomId: string,
  ): Promise<void> {
    if (!this.server) {
      throw new Error('Socket server has not been initialized.');
    }

    const socketId = this.connectionManager.getSocketId(userId);

    if (!socketId) {
      return;
    }

    const socket = this.server.sockets.sockets.get(socketId);

    if (!socket) {
      return;
    }

    await socket.leave(roomId);
  }
}