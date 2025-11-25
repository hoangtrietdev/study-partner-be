import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserListQueryDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const userId = uuidv4();
    const createdUser = new this.userModel({
      _id: userId,
      ...createUserDto,
    });
    return createdUser.save();
  }

  async findAll(query: UserListQueryDto) {
    const { page = 1, limit = 20, schoolName, major, faculty } = query;
    const filter: any = {};

    if (schoolName) filter.schoolName = schoolName;
    if (major) filter.major = major;
    if (faculty) filter.faculty = faculty;

    const total = await this.userModel.countDocuments(filter);
    const users = await this.userModel
      .find(filter)
      .select('-refreshToken')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ _id: id }).select('-refreshToken').exec();
    } catch {
      return null;
    }
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id }, updateUserDto, { new: true })
      .select('-refreshToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.userModel.findOneAndUpdate({ _id: userId }, { refreshToken }).exec();
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.userModel.findOneAndUpdate({ _id: userId }, { lastSeenAt: new Date() }).exec();
  }
}
