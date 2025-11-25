import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { CreateUserDto } from '../users/dto/user.dto';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
  }

  async googleAuth(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!googleId || !email || !name) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      let user = await this.usersService.findByGoogleId(googleId);

      if (!user) {
        // Create new user account automatically on first login
        const createUserDto: CreateUserDto = {
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
        } catch {
          throw new UnauthorizedException('Failed to create user account');
        }
      }

      const userId = user._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user ID');
      }

      const tokens = await this.generateTokens(userId, email!);

      // Store refresh token
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
    } catch {
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(userId, user.email);
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
