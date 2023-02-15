import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [
    // Redis Queue
    BullModule.registerQueueAsync({
      name: 'message',
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({ redis: config.get('redis') }),
    }),
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
