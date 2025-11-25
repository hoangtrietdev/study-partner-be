import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  @ApiOperation({ summary: 'Authenticate with Google OAuth token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async googleAuth(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.googleAuth(googleAuthDto.token);

    // Set refresh token as httpOnly cookie (for backup)
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Also return refresh token in response body for localStorage
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and revoke tokens' })
  @ApiResponse({ status: 200 })
  async logout(
    @Req() req: Request & { user: { userId: string } },
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(req.user.userId);
    response.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200 })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    // Try to get refresh token from cookie first, then from body
    let refreshToken = req.cookies['refreshToken'];

    if (!refreshToken && req.body?.refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    // Decode to get userId (in production, verify the token first)
    const decoded: any = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
    const result = await this.authService.refreshTokens(decoded.sub, refreshToken);

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return both tokens in response body for localStorage
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}
