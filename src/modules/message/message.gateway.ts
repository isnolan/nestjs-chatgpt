import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, WsResponse } from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'ws';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log(`->events:`, data);
    return from([1, 2, 3]).pipe(map((item) => ({ event: 'events', data: item })));
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log(`->events:`, data);
    return data;
  }

  // @SubscribeMessage('events')
  // handleEvent(@MessageBody() data: any): string {
  //   console.log(`->events:`, data);
  //   return data;
  // }
}
