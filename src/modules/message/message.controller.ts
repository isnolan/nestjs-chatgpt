import { Controller, Get } from '@nestjs/common';
import { SupplierService } from '../supplier/supplier.service';

@Controller('message')
export class MessageController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get('Supplier')
  async Supplier() {
    return this.supplierService.getList();
  }
}
