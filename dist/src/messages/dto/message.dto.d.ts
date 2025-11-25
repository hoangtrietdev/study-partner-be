export declare class CreateMessageDto {
    content: string;
}
export declare class MessageResponseDto {
    id: string;
    matchId: string;
    senderId: string;
    recipientId: string;
    content: string;
    deleted: boolean;
    createdAt: Date;
}
