import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './room.interface';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(
    @InjectQueue('message')
    private readonly messageQueue: Queue,
    private readonly service: RoomService,
  ) {}

  @Get('')
  async getAllRooms(): Promise<Room[]> {
    return await this.service.getRooms();
  }

  @Get('get')
  async getRoom(@Query() query): Promise<Room> {
    console.log(`->room:`, query.roomId);
    const rooms = await this.service.getRooms();
    const room = await this.service.getRoomById(query.roomId);
    return rooms[room];
  }

  /**
   * Create room
   * @example
   * curl 'http://127.0.0.1:3000/room/create' \
          -H 'Content-Type: application/json' \
          --data-raw '{ "roomId": "1a23c5066d05474304c03", "user":{"userId": "1111", "userName": "haha"} }' \
          --compressed
   */
  @Post('create')
  async create(@Body() payload: CreateRoomDto) {
    console.log(`->payload`, payload);
    // Create Room
    const { RoomId, UserId } = payload;
    this.service.createRoom(RoomId, { UserId });

    // Create Quene for Message
    const job = await this.messageQueue.add(payload.Supplier.Type, payload, {
      attempts: 2,
      removeOnComplete: true,
      removeOnFail: true,
    });

    return { code: 0 };
  }

  /**
   * Create room
   * @example
   * curl 'http://127.0.0.1:3000/room/delete?roomId=1a23c5066d05474304c03' \
          -H 'Content-Type: application/json' \
          --compressed
   */
  @Get('delete')
  async delete(@Query() query) {
    this.service.removeRoom(query.roomId);
    return;
  }
}
