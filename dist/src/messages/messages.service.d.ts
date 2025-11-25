import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { MatchesService } from '../matches/matches.service';
import { CreateMessageDto } from './dto/message.dto';
export declare class MessagesService {
    private messageModel;
    private matchesService;
    constructor(messageModel: Model<MessageDocument>, matchesService: MatchesService);
    create(matchId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<Message>;
    findByMatch(matchId: string, userId: string): Promise<Message[]>;
    delete(messageId: string, userId: string): Promise<void>;
}
