import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan } from 'typeorm';

import { Account } from './entity/account';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
  ) {}

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
