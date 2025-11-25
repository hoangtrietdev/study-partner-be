import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':matchId')
  @ApiOperation({ summary: 'Get all messages for a match' })
  @ApiResponse({ status: 200, type: [MessageResponseDto] })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getMessages(
    @Param('matchId') matchId: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.messagesService.findByMatch(matchId, req.user.userId);
  }

  @Post(':matchId')
  @ApiOperation({ summary: 'Send a message in a match' })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async sendMessage(
    @Param('matchId') matchId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.messagesService.create(matchId, req.user.userId, createMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message (soft delete)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Can only delete own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(@Param('id') id: string, @Req() req: Request & { user: { userId: string } }) {
    await this.messagesService.delete(id, req.user.userId);
    return { message: 'Message deleted successfully' };
  }
}
