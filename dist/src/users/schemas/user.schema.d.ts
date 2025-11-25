import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    _id: string;
    googleId: string;
    name: string;
    email: string;
    imageUrl?: string;
    schoolName: string;
    age: number;
    major: string;
    faculty: string;
    interests: string[];
    bio: string;
    settings: {
        aiSuggestionsEnabled: boolean;
        notifications: boolean;
        darkMode: boolean;
    };
    lastSeenAt: Date;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
