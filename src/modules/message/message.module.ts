import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MessageController } from './message.controller';
import { MessageProcessor } from './message.processor';
import { MessageService } from './message.service';
import { SupplierModule } from '../supplier/supplier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),

    // Redis Queue
    BullModule.registerQueueAsync({
      name: 'message',
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({ redis: config.get('redis') }),
    }),

    SupplierModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageProcessor],
  exports: [MessageService],
})
export class MessageModule {}
