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

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 接入客户端
  public wsClients = [];

  constructor() {
    setInterval(() => {
      console.log(`->server:`, this.wsClients.length);
      // if (this.wsClients.length > 0) {
      //   this.wsClients[0].emit('events', 'ping');
      // }
      this.server.in('9999999').emit('events', { ping: 'pong', time: +new Date() });
    }, 3000);
  }

  /**
   * Node init
   * Get node config from center server
   */
  afterInit() {
    console.log(`->after init`);
  }

  handleConnection(client: Socket, room: string) {
    this.wsClients.push(client);
    console.log(`->connected`, client.id, room);

    client.on('room', (roomId) => {
      client.join(room);
      console.log(`->join room:`, roomId);
    });
  }

  handleDisconnect(client) {
    for (let i = 0; i < this.wsClients.length; i++) {
      if (this.wsClients[i] === client) {
        this.wsClients.splice(i, 1);
        break;
      }
    }
    console.log(`->disconnected`);
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
}
