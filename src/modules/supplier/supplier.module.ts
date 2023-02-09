import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { SupplierService } from './supplier.service';
import { Supplier } from './entity/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
