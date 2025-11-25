import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { MatchesService } from '../matches/matches.service';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private matchesService: MatchesService,
  ) {}

  async create(
    matchId: string,
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    // Verify match exists and user is part of it
    const matches = await this.matchesService.getUserMatches(senderId);
    const match = matches.find((m) => String(m._id) === matchId);

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const recipientId = match.userAId === senderId ? match.userBId : match.userAId;

    const message = new this.messageModel({
      matchId,
      senderId,
      recipientId,
      content: createMessageDto.content,
    });

    return message.save();
  }

  async findByMatch(matchId: string, userId: string): Promise<Message[]> {
    // Verify user has access to this match
    const matches = await this.matchesService.getUserMatches(userId);
    const match = matches.find((m) => String(m._id) === matchId);

    if (!match) {
      throw new ForbiddenException('Access denied');
    }

    return this.messageModel.find({ matchId, deleted: false }).sort({ createdAt: 1 }).exec();
  }

  async delete(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId).exec();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Can only delete your own messages');
    }

    message.deleted = true;
    await message.save();
  }
}
