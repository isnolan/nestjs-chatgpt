import { LessThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Message } from './entity/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  async save(model: Message): Promise<Message> {
    return this.repository.save(model);
  }

  async getOne(Id: number): Promise<Message> {
    return this.repository.findOneBy({ Id });
  }

  async getLastOne(ConversationId: number, MessageId: number): Promise<Message> {
    const result = await this.repository.find({
      where: { ConversationId, Id: LessThan(MessageId) },
      order: { Id: 'DESC' },
      take: 1,
    });
    return result[0];
  }
}
