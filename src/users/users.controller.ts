import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UserListQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './schemas/user.schema';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of users with filters and pagination' })
  @ApiResponse({ status: 200, type: [User] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'schoolName', required: false, type: String })
  @ApiQuery({ name: 'major', required: false, type: String })
  @ApiQuery({ name: 'faculty', required: false, type: String })
  async findAll(@Query() query: UserListQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user public profile by ID' })
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update own user profile' })
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 403, description: 'Cannot update other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    if (id !== req.user.userId) {
      throw new ForbiddenException('Cannot update other users');
    }
    return this.usersService.update(id, updateUserDto);
  }
}
