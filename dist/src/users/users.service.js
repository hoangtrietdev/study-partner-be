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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const userId = (0, uuid_1.v4)();
        const createdUser = new this.userModel({
            _id: userId,
            ...createUserDto,
        });
        return createdUser.save();
    }
    async findAll(query) {
        const { page = 1, limit = 20, schoolName, major, faculty } = query;
        const filter = {};
        if (schoolName)
            filter.schoolName = schoolName;
        if (major)
            filter.major = major;
        if (faculty)
            filter.faculty = faculty;
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
    async findById(id) {
        try {
            return await this.userModel.findOne({ _id: id }).select('-refreshToken').exec();
        }
        catch {
            return null;
        }
    }
    async findByGoogleId(googleId) {
        return this.userModel.findOne({ googleId }).exec();
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async update(id, updateUserDto) {
        const user = await this.userModel
            .findOneAndUpdate({ _id: id }, updateUserDto, { new: true })
            .select('-refreshToken')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateRefreshToken(userId, refreshToken) {
        await this.userModel.findOneAndUpdate({ _id: userId }, { refreshToken }).exec();
    }
    async updateLastSeen(userId) {
        await this.userModel.findOneAndUpdate({ _id: userId }, { lastSeenAt: new Date() }).exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map