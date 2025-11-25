import { Model } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';
import { UsersService } from '../users/users.service';
import { GroqLLMClient } from './clients/groq-llm.client';
export declare class MatchesService {
    private matchModel;
    private usersService;
    private groqClient;
    constructor(matchModel: Model<MatchDocument>, usersService: UsersService, groqClient: GroqLLMClient);
    createMatch(userId: string, targetUserId: string): Promise<Match>;
    unmatch(matchId: string, userId: string): Promise<void>;
    getUserMatches(userId: string): Promise<Match[]>;
    getSuggestions(userId: string, limit?: number, useAI?: boolean, matchMode?: string): Promise<{
        candidate: (import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").UserDocument, {}, {}> & import("../users/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: string & import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | undefined;
        candidateId: string;
        score: number;
        explanation: string;
    }[]>;
}
