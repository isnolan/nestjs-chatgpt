import { Injectable } from '@nestjs/common';
import { Room, User } from './room.interface';

@Injectable()
export class RoomService {
  private rooms: Room[] = [];

  /**
   * Create room
   */
  async createRoom(RoomId: string, Host: User): Promise<void> {
    const room = await this.getRoomById(RoomId);
    if (room === -1) {
      await this.rooms.push({ RoomId, Host, Users: [Host] });
    }
  }

  /**
   * Delete room
   * @param RoomId
   */
  async removeRoom(RoomId: string): Promise<void> {
    const findRoom = await this.getRoomById(RoomId);
    if (findRoom !== -1) {
      this.rooms = this.rooms.filter((room) => room.RoomId !== RoomId);
    }
  }

  /**
   * 获取房间所有者
   */
  async getRoomHost(HostId: string): Promise<User> {
    const roomIndex = await this.getRoomById(HostId);
    return this.rooms[roomIndex].Host;
  }

  /**
   * Get room by room Id
   */
  async getRoomById(RoomId: string): Promise<number> {
    const roomIndex = this.rooms.findIndex((room) => room?.RoomId === RoomId);
    return roomIndex;
  }

  /**
   * 加入房间
   */
  async addUserToRoom(RoomId: string, user: User): Promise<void> {
    const roomIndex = await this.getRoomById(RoomId);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].Users.push(user);
      const Host = await this.getRoomHost(RoomId);
      if (Host.UserId === user.UserId) {
        this.rooms[roomIndex].Host.SocketId = user.SocketId;
      }
    } else {
      await this.createRoom(RoomId, user);
    }
  }

  async findRoomsByUserSocketId(SocketId: string): Promise<Room[]> {
    const filteredRooms = this.rooms.filter((room) => {
      const found = room.Users.find((user) => user.SocketId === SocketId);
      if (found) {
        return found;
      }
    });
    return filteredRooms;
  }

  async removeUserFromAllRooms(SocketId: string): Promise<void> {
    const rooms = await this.findRoomsByUserSocketId(SocketId);
    for (const room of rooms) {
      await this.removeUserFromRoom(SocketId, room.RoomId);
    }
  }

  async removeUserFromRoom(SocketId: string, RoomId: string): Promise<void> {
    const room = await this.getRoomById(RoomId);
    this.rooms[room].Users = this.rooms[room].Users.filter((user) => user.SocketId !== SocketId);
    if (this.rooms[room].Users.length === 0) {
      await this.removeRoom(RoomId);
    }
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }
}
