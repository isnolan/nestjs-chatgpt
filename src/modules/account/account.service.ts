import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { Account } from './entity/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
  ) {}

  async save(model: Account): Promise<Account> {
    return this.repository.save(model);
  }

  /**
   * get all account list
   * @returns
   */
  async getList() {
    const result = await this.repository.findAndCount({
      where: { Status: MoreThan(0) },
      order: { Id: 'DESC' },
    });

    return result;
  }
}
