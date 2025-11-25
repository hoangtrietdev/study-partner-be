import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @ApiProperty({ description: 'Message ID' })
  _id: string;

  @ApiProperty({ description: 'Match ID' })
  @Prop({ type: String, ref: 'Match', required: true })
  matchId: string;

  @ApiProperty({ description: 'Sender user ID' })
  @Prop({ type: String, ref: 'User', required: true })
  senderId: string;

  @ApiProperty({ description: 'Recipient user ID' })
  @Prop({ type: String, ref: 'User', required: true })
  recipientId: string;

  @ApiProperty({ description: 'Message content' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'Is message deleted' })
  @Prop({ default: false })
  deleted: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Index for efficient queries
MessageSchema.index({ matchId: 1, createdAt: -1 });
