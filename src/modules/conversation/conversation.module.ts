import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MessageModule } from '../message/message.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from './entity/conversation.entity';

@Module({
  imports: [
    // MySQL
    TypeOrmModule.forFeature([Conversation]),

    // Redis Queue
    BullModule.registerQueueAsync({
      name: 'message',
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({ redis: config.get('redis') }),
    }),

    MessageModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
