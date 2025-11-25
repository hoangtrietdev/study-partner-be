import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MatchDocument = Match & Document;

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  UNMATCHED = 'unmatched',
}

@Schema({ timestamps: true })
export class Match {
  @ApiProperty({ description: 'Match ID' })
  @Prop({ type: String })
  _id: string;

  @ApiProperty({ description: 'User A ID' })
  @Prop({ type: String, ref: 'User', required: true })
  userAId: string;

  @ApiProperty({ description: 'User B ID' })
  @Prop({ type: String, ref: 'User', required: true })
  userBId: string;

  @ApiProperty({ description: 'Match status', enum: MatchStatus })
  @Prop({ type: String, enum: MatchStatus, default: MatchStatus.PENDING })
  status: MatchStatus;

  @ApiProperty({ description: 'AI compatibility score (0-100)' })
  @Prop({ min: 0, max: 100 })
  score?: number;

  @ApiProperty({ description: 'AI explanation for the match' })
  @Prop()
  explanation?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Compound index to prevent duplicate matches
MatchSchema.index({ userAId: 1, userBId: 1 }, { unique: true });
