import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchStatus } from '../schemas/match.schema';

export class CreateMatchDto {
  @ApiProperty({ description: 'Target user ID to match with' })
  @IsString()
  targetUserId: string;
}

export class MatchSuggestionQueryDto {
  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Use AI-powered suggestions' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  useAI?: boolean = true;

  @ApiProperty({
    required: false,
    enum: ['strict', 'random'],
    default: 'random',
    description: 'strict = same school only, random = all schools',
  })
  @IsOptional()
  @IsString()
  matchMode?: string = 'random';
}

export class MatchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userAId: string;

  @ApiProperty()
  userBId: string;

  @ApiProperty({ enum: MatchStatus })
  status: MatchStatus;

  @ApiProperty()
  score?: number;

  @ApiProperty()
  explanation?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MatchSuggestionDto {
  @ApiProperty()
  candidateId: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  explanation: string;

  @ApiProperty()
  candidate: any;
}
