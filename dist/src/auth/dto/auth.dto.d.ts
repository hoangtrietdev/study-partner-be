export declare class GoogleAuthDto {
    token: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        imageUrl?: string;
    };
}
