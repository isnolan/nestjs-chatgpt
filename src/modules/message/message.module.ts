import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [
    // TypeOrmModule.forFeature([TLibrary]),
    AccountModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
