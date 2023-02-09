import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { Supplier } from './entity/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repository: Repository<Supplier>,
  ) {}

  async save(model: Supplier): Promise<Supplier> {
    return this.repository.save(model);
  }

  /**
   * get all Supplier list
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
