import { Controller, Get, Post, Delete, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchResponseDto, MatchSuggestionDto, MatchSuggestionQueryDto } from './dto/match.dto';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post(':targetId')
  @ApiOperation({ summary: 'Create match request (swipe right)' })
  @ApiResponse({ status: 201, type: MatchResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createMatch(
    @Param('targetId') targetId: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.matchesService.createMatch(req.user.userId, targetId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unmatch with user' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async unmatch(@Param('id') id: string, @Req() req: Request & { user: { userId: string } }) {
    await this.matchesService.unmatch(id, req.user.userId);
    return { message: 'Unmatched successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches for current user' })
  @ApiResponse({ status: 200, type: [MatchResponseDto] })
  async getUserMatches(@Req() req: Request & { user: { userId: string } }) {
    return this.matchesService.getUserMatches(req.user.userId);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI-powered match suggestions' })
  @ApiResponse({ status: 200, type: [MatchSuggestionDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'useAI', required: false, type: Boolean })
  @ApiQuery({
    name: 'matchMode',
    required: false,
    type: String,
    description: 'strict (same school only) or random (all schools)',
  })
  async getSuggestions(
    @Req() req: Request & { user: { userId: string } },
    @Query() query: MatchSuggestionQueryDto,
  ) {
    return this.matchesService.getSuggestions(
      req.user.userId,
      query.limit,
      query.useAI,
      query.matchMode,
    );
  }
}
