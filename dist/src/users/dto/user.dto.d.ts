export declare class CreateUserDto {
    googleId: string;
    name: string;
    email: string;
    imageUrl?: string;
    schoolName: string;
    age: number;
    major: string;
    faculty: string;
    interests?: string[];
    bio?: string;
}
export declare class UpdateUserDto {
    name?: string;
    imageUrl?: string;
    schoolName?: string;
    age?: number;
    major?: string;
    faculty?: string;
    interests?: string[];
    bio?: string;
    settings?: {
        aiSuggestionsEnabled?: boolean;
        notifications?: boolean;
        darkMode?: boolean;
    };
}
export declare class UserListQueryDto {
    page?: number;
    limit?: number;
    schoolName?: string;
    major?: string;
    faculty?: string;
}
