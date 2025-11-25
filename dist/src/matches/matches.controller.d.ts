import { MatchesService } from './matches.service';
import { MatchSuggestionQueryDto } from './dto/match.dto';
export declare class MatchesController {
    private matchesService;
    constructor(matchesService: MatchesService);
    createMatch(targetId: string, req: Request & {
        user: {
            userId: string;
        };
    }): Promise<import("./schemas/match.schema").Match>;
    unmatch(id: string, req: Request & {
        user: {
            userId: string;
        };
    }): Promise<{
        message: string;
    }>;
    getUserMatches(req: Request & {
        user: {
            userId: string;
        };
    }): Promise<import("./schemas/match.schema").Match[]>;
    getSuggestions(req: Request & {
        user: {
            userId: string;
        };
    }, query: MatchSuggestionQueryDto): Promise<{
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
