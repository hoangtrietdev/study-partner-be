import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match, MatchSchema } from './schemas/match.schema';
import { UsersModule } from '../users/users.module';
import { GroqLLMClient } from './clients/groq-llm.client';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService, GroqLLMClient],
  exports: [MatchesService],
})
export class MatchesModule {}
