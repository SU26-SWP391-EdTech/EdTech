import { Injectable } from '@nestjs/common';
import { RoomPrefix } from '../constants/room-prefix.constant';
import { BattleRoom } from '../interfaces/battle-room.interface';

@Injectable()
export class RoomManager {
  private readonly rooms = new Map<number, BattleRoom>();

  buildRoomId(matchId: number): string {
    return `${RoomPrefix.MATCH}${matchId}`;
  }

  createRoom(matchId: number, player1Id: number, player2Id: number): BattleRoom {
    const room: BattleRoom = {
      roomId: this.buildRoomId(matchId),
      matchId,
      player1Id,
      player2Id,
    };

    this.rooms.set(matchId, room);
    return room;
  }

  getRoom(matchId: number): BattleRoom | undefined {
    return this.rooms.get(matchId);
  }

  removeRoom(matchId: number): void {
    this.rooms.delete(matchId);
  }
}