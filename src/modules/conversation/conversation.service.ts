import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { Conversation } from './entity/conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly repository: Repository<Conversation>,
  ) {}

  async save(model: Conversation): Promise<Conversation> {
    return this.repository.save(model);
  }

  async getList(): Promise<[Conversation[], number]> {
    const result = await this.repository.findAndCount({
      where: { Status: MoreThan(0) },
      order: { Id: 'DESC' },
    });

    return result;
  }

  async getOne(Id: number): Promise<Conversation> {
    return this.repository.findOneBy({ Id });
  }
}
