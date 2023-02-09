import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { InjectQueue } from '@nestjs/bull';
import { plainToClass } from 'class-transformer';
import { Controller, Post, Body, Query } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

import { Message } from '../message/entity/message.entity';
import { Conversation } from './entity/conversation.entity';
import { SupplierEnum } from '../supplier/entity/supplier.entity';

@Controller('conversation')
export class ConversationController {
  constructor(
    @InjectQueue('message')
    private readonly messageQueue: Queue,
    private readonly service: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * Create an Conversation
   * TODO: Get a provider according to policy distribution
   * @example
        curl 'http://127.0.0.1:3000/conversation/create' \
          -H 'Content-Type: application/json' \
          --data-raw '{ "MerchantId": 1, "UserId": "1a23c5066d05474304c03", "ConversationId":9, "Question": "hello" }' \
          --compressed
   *
   */
  @Post('create')
  async create(@Body() payload: CreateConversationDto) {
    let supplier: { Id: number; Type: number };
    const { MerchantId, UserId, Question } = payload;
    let ConversationId = payload.ConversationId;

    // If the conversation does not exist,
    // then create the record after getting the vendor ID according to the policy
    // Let us first assume that the supply ID is 101
    if (!ConversationId) {
      supplier = { Id: 101, Type: 1 }; // from the prolicy, later
      const model = plainToClass(Conversation, {
        MerchantId,
        UserId,
        SupplierId: supplier.Id,
        SupplierType: supplier.Type,
      });
      const { Id } = await this.service.save(model);
      ConversationId = Id;
    } else {
      // get the last supplier from db
      const result = await this.service.getOne(ConversationId);
      supplier = {
        Id: result.SupplierId,
        Type: result.SupplierType,
      };
    }

    // Record the message
    const model = plainToClass(Message, { ConversationId, QuestionId: uuidv4(), Question });
    const { Id: MessageId } = await this.messageService.save(model);
    // console.log(`->message`, MessageId, SupplierEnum[supplier.Type]);

    // Join the sending queue
    const job = await this.messageQueue.add(
      `${SupplierEnum[supplier.Type].toLowerCase()}`,
      { SupplierId: supplier.Id, ConversationId, MessageId },
      { attempts: 2, removeOnComplete: true, removeOnFail: true },
    );

    return { code: 0, message: 'success', data: { ConversationId, MessageId, JodId: job.id } };
  }
}
