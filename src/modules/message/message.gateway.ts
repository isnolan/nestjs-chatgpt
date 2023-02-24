import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from '../room/room.interface';
import { RoomService } from '../room/room.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public readonly server: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

  constructor(
    @InjectQueue('message')
    private readonly messageQueue: Queue,
    private readonly room: RoomService,
  ) {}

  /**
   * 提问
   * @param payload
   */
  @SubscribeMessage('question')
  async handleQuestionEvent(@MessageBody() payload: any) {
    // 接收请求，并广播到房间所有人
    // this.server.to(payload.RoomId).emit('question', payload); // broadcast messages
    const job = await this.messageQueue.add('chatgpt', payload, {
      attempts: 2,
      removeOnComplete: true,
      removeOnFail: true,
    });

    return { id: job.id, name: job.name };
  }

  /**
   * Join room
   * 加入房间，获取远程配置
   * @param payload
   */
  // @UseGuards(AuthGuard('jwt'))
  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(@MessageBody() payload: any) {
    if (payload.socketId) {
      await this.server.in(payload.socketId).socketsJoin(payload.roomId);
      await this.room.addUserToRoom(payload.roomId, { userId: payload.userId, socketId: payload.socketId });
    }
    console.log(`->Join Room:`, payload);
    return { message: `Join room: ${payload.roomId}` };
  }

  // Will fire when a client connects to the server
  async handleConnection(socket: Socket): Promise<void> {
    console.log(`Socket connected: ${socket.id}`);
  }

  // Will fire when a client disconnects from the server
  async handleDisconnect(socket: Socket): Promise<void> {
    await this.room.removeUserFromAllRooms(socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
  }
}
