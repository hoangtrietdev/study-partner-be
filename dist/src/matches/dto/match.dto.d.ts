import { MatchStatus } from '../schemas/match.schema';
export declare class CreateMatchDto {
    targetUserId: string;
}
export declare class MatchSuggestionQueryDto {
    limit?: number;
    useAI?: boolean;
    matchMode?: string;
}
export declare class MatchResponseDto {
    id: string;
    userAId: string;
    userBId: string;
    status: MatchStatus;
    score?: number;
    explanation?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MatchSuggestionDto {
    candidateId: string;
    score: number;
    explanation: string;
    candidate: any;
}
