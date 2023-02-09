import { plainToClass } from 'class-transformer';
import { Controller, Post, Body, Query } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

import { Message } from '../message/entity/message.entity';
import { Conversation } from './entity/conversation.entity';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly service: ConversationService, private readonly messageService: MessageService) {}

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
    const { MerchantId, UserId, ConversationId, Question } = payload;

    // If the conversation does not exist,
    // then create the record after getting the vendor ID according to the policy
    // Let us first assume that the supply ID is 101
    if (!ConversationId) {
      const SupplierId = 101;
      const model = plainToClass(Conversation, { MerchantId, UserId, SupplierId });
      const { Id } = await this.service.save(model);
      payload.ConversationId = Id;
      // console.log(`->conversationId`, Id);
    }

    // Record the message and join the sending queue
    const model = plainToClass(Message, { ConversationId: payload.ConversationId, Question });
    const message = await this.messageService.save(model);
    // console.log(`->message`, message);

    return { code: 0, message: 'success', data: { ConversationId, MessageId: message.Id } };
  }
}
