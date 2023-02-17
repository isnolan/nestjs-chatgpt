import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MessageController } from './message.controller';
import { MessageProcessor } from './message.processor';
import { MessageService } from './message.service';

import { MessageGateway } from './message.gateway';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    // Redis Queue
    BullModule.registerQueueAsync({
      name: 'message',
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({ redis: config.get('redis') }),
    }),

    RoomModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageProcessor, MessageGateway],
  exports: [MessageService, MessageGateway],
})
export class MessageModule {}
