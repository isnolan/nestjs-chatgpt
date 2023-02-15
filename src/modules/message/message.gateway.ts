import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  WsResponse,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, Message, User } from '../room/room.interface';
import { RoomService } from '../room/room.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public readonly server: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

  constructor(private readonly room: RoomService) {}

  /**
   * Node init
   * Get node config from center server
   */
  afterInit() {
    console.log(`->after init`);
  }

  @SubscribeMessage('events')
  findAll(@ConnectedSocket() client: Socket, @MessageBody() data: any): Observable<WsResponse<number>> {
    console.log(`->events:`, client.id, data);
    return from([1, 2, 3]).pipe(map((item) => ({ event: 'events', data: item })));
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log(`->identity:`, data + 1);
    return data + 1;
  }

  /**
   * 广播消息
   * @param payload
   */
  @SubscribeMessage('events')
  handleQuestionEvent(@MessageBody() payload: Message) {
    // 接收请求，并广播到房间所有人
    this.server.to(payload.RoomId).emit('events', payload); // broadcast messages
    return payload;
  }

  /**
   * Join room
   * @param payload
   */
  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(@MessageBody() payload: { RoomId: string; User: User }) {
    if (payload.User.SocketId) {
      //
      await this.server.in(payload.User.SocketId).socketsJoin(payload.RoomId);
      await this.room.addUserToRoom(payload.RoomId, payload.User);
    }
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
