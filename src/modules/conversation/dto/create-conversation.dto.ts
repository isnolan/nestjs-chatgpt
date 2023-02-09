import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsNumber()
  MerchantId: number;

  @IsNotEmpty()
  @IsString()
  UserId: string;

  @IsNotEmpty()
  @IsNumber()
  ConversationId: number;

  @IsNotEmpty()
  @IsString()
  Question: string;
}
