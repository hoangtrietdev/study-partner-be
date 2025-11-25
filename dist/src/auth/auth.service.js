"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(jwtService, configService, usersService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
    }
    async googleAuth(token) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new common_1.UnauthorizedException('Invalid Google token');
            }
            const { sub: googleId, email, name, picture } = payload;
            if (!googleId || !email || !name) {
                throw new common_1.UnauthorizedException('Invalid Google token payload');
            }
            let user = await this.usersService.findByGoogleId(googleId);
            if (!user) {
                const createUserDto = {
                    googleId,
                    email,
                    name,
                    imageUrl: picture,
                    schoolName: 'Not Set',
                    age: 18,
                    major: 'Not Set',
                    faculty: 'Not Set',
                };
                try {
                    user = await this.usersService.create(createUserDto);
                }
                catch {
                    throw new common_1.UnauthorizedException('Failed to create user account');
                }
            }
            const userId = user._id;
            if (!userId) {
                throw new common_1.UnauthorizedException('Invalid user ID');
            }
            const tokens = await this.generateTokens(userId, email);
            await this.usersService.updateRefreshToken(userId, tokens.refreshToken);
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: userId,
                    email: user.email,
                    name: user.name,
                    imageUrl: user.imageUrl,
                },
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Google authentication failed');
        }
    }
    async logout(userId) {
        await this.usersService.updateRefreshToken(userId, null);
        return { message: 'Logged out successfully' };
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        if (user.refreshToken !== refreshToken) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const tokens = await this.generateTokens(userId, user.email);
        await this.usersService.updateRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }
    async generateTokens(userId, email) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email }, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN'),
            }),
            this.jwtService.signAsync({ sub: userId, email }, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map