import { Controller, Get } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly service: MessageService) {}

  @Get('get')
  async get() {
    // return await this.service.getLastOne(10, 28);
  }
}
