import { Injectable } from '@nestjs/common';
import { Room, User } from './room.interface';

@Injectable()
export class RoomService {
  private rooms: Room[] = [];

  /**
   * Create room
   */
  async createRoom(roomId: string, host: User): Promise<void> {
    const room = await this.getRoomById(roomId);
    if (room === -1) {
      await this.rooms.push({ roomId, host, users: [host] });
    }
  }

  /**
   * Delete room
   * @param roomId
   */
  async removeRoom(roomId: string): Promise<void> {
    const findRoom = await this.getRoomById(roomId);
    if (findRoom !== -1) {
      this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
    }
  }

  /**
   * 获取房间所有者
   */
  async getRoomhost(hostId: string): Promise<User> {
    const roomIndex = await this.getRoomById(hostId);
    return this.rooms[roomIndex].host;
  }

  /**
   * Get room by room Id
   */
  async getRoomById(roomId: string): Promise<number> {
    const roomIndex = this.rooms.findIndex((room) => room?.roomId === roomId);
    return roomIndex;
  }

  /**
   * 加入房间
   */
  async addUserToRoom(roomId: string, user: User): Promise<void> {
    const roomIndex = await this.getRoomById(roomId);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].users.push(user);
      const host = await this.getRoomhost(roomId);
      if (host.userId === user.userId) {
        this.rooms[roomIndex].host.socketId = user.socketId;
      }
    } else {
      await this.createRoom(roomId, user);
    }
  }

  async findRoomsByUsersocketId(socketId: string): Promise<Room[]> {
    const filteredRooms = this.rooms.filter((room) => {
      const found = room.users.find((user) => user.socketId === socketId);
      if (found) {
        return found;
      }
    });
    return filteredRooms;
  }

  async removeUserFromAllRooms(socketId: string): Promise<void> {
    const rooms = await this.findRoomsByUsersocketId(socketId);
    for (const room of rooms) {
      await this.removeUserFromRoom(socketId, room.roomId);
    }
  }

  async removeUserFromRoom(socketId: string, roomId: string): Promise<void> {
    const room = await this.getRoomById(roomId);
    this.rooms[room].users = this.rooms[room].users.filter((user) => user.socketId !== socketId);
    if (this.rooms[room].users.length === 0) {
      await this.removeRoom(roomId);
    }
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }
}
