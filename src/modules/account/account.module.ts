import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AccountService } from './account.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountService])],
  providers: [AccountService],
})
export class AccountModule {}
