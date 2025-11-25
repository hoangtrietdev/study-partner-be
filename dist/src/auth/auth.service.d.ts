import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private jwtService;
    private configService;
    private usersService;
    private googleClient;
    constructor(jwtService: JwtService, configService: ConfigService, usersService: UsersService);
    googleAuth(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string & import("mongoose").Types.ObjectId;
            email: string;
            name: string;
            imageUrl: string | undefined;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
}
