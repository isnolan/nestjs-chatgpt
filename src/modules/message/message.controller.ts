import { Controller, Get } from '@nestjs/common';
import { AccountService } from '../account/account.service';

@Controller('message')
export class MessageController {
  constructor(private readonly accountService: AccountService) {}

  @Get('account')
  async account() {
    return this.accountService.getList();
  }
}
