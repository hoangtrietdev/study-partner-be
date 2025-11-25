import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    getMessages(matchId: string, req: Request & {
        user: {
            userId: string;
        };
    }): Promise<import("./schemas/message.schema").Message[]>;
    sendMessage(matchId: string, createMessageDto: CreateMessageDto, req: Request & {
        user: {
            userId: string;
        };
    }): Promise<import("./schemas/message.schema").Message>;
    deleteMessage(id: string, req: Request & {
        user: {
            userId: string;
        };
    }): Promise<{
        message: string;
    }>;
}
