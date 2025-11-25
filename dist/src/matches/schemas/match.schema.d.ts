import { Document } from 'mongoose';
export type MatchDocument = Match & Document;
export declare enum MatchStatus {
    PENDING = "pending",
    MATCHED = "matched",
    UNMATCHED = "unmatched"
}
export declare class Match {
    _id: string;
    userAId: string;
    userBId: string;
    status: MatchStatus;
    score?: number;
    explanation?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MatchSchema: import("mongoose").Schema<Match, import("mongoose").Model<Match, any, any, any, Document<unknown, any, Match, any, {}> & Match & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Match, Document<unknown, {}, import("mongoose").FlatRecord<Match>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Match> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
