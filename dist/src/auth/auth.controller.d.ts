import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/auth.dto';
import { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    googleAuth(googleAuthDto: GoogleAuthDto, response: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string & import("mongoose").Types.ObjectId;
            email: string;
            name: string;
            imageUrl: string | undefined;
        };
    }>;
    logout(req: Request & {
        user: {
            userId: string;
        };
    }, response: Response): Promise<{
        message: string;
    }>;
    refresh(req: Request, response: Response): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
