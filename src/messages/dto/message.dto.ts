import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matchId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  recipientId: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  deleted: boolean;

  @ApiProperty()
  createdAt: Date;
}
