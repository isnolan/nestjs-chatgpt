import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  RoomId: string;

  @IsNotEmpty()
  @IsString()
  UserId: string;

  @IsNotEmpty()
  @IsObject()
  Supplier: { Id: number; Type: string; User: string; Password: string; ApiKey: string; Authorisation: string };

  @IsNotEmpty()
  @IsObject()
  Message: { Id: number; QuestionId: string; Question: string };
}
