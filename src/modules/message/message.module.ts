import { Module } from '@nestjs/common';
import { SupplierModule } from '../supplier/supplier.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [SupplierModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
