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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const matches_service_1 = require("../matches/matches.service");
let MessagesService = class MessagesService {
    constructor(messageModel, matchesService) {
        this.messageModel = messageModel;
        this.matchesService = matchesService;
    }
    async create(matchId, senderId, createMessageDto) {
        const matches = await this.matchesService.getUserMatches(senderId);
        const match = matches.find((m) => String(m._id) === matchId);
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        const recipientId = match.userAId === senderId ? match.userBId : match.userAId;
        const message = new this.messageModel({
            matchId,
            senderId,
            recipientId,
            content: createMessageDto.content,
        });
        return message.save();
    }
    async findByMatch(matchId, userId) {
        const matches = await this.matchesService.getUserMatches(userId);
        const match = matches.find((m) => String(m._id) === matchId);
        if (!match) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.messageModel.find({ matchId, deleted: false }).sort({ createdAt: 1 }).exec();
    }
    async delete(messageId, userId) {
        const message = await this.messageModel.findById(messageId).exec();
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('Can only delete your own messages');
        }
        message.deleted = true;
        await message.save();
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        matches_service_1.MatchesService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map