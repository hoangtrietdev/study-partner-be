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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const match_schema_1 = require("./schemas/match.schema");
const users_service_1 = require("../users/users.service");
const groq_llm_client_1 = require("./clients/groq-llm.client");
let MatchesService = class MatchesService {
    constructor(matchModel, usersService, groqClient) {
        this.matchModel = matchModel;
        this.usersService = usersService;
        this.groqClient = groqClient;
    }
    async createMatch(userId, targetUserId) {
        if (userId === targetUserId) {
            throw new common_1.BadRequestException('Cannot match with yourself');
        }
        const existingMatch = await this.matchModel
            .findOne({
            $or: [
                { userAId: userId, userBId: targetUserId },
                { userAId: targetUserId, userBId: userId },
            ],
        })
            .exec();
        if (existingMatch) {
            if (existingMatch.status === match_schema_1.MatchStatus.UNMATCHED) {
                existingMatch.status = match_schema_1.MatchStatus.PENDING;
                return existingMatch.save();
            }
            throw new common_1.BadRequestException('Match already exists');
        }
        const reverseMatch = await this.matchModel
            .findOne({
            userAId: targetUserId,
            userBId: userId,
            status: match_schema_1.MatchStatus.PENDING,
        })
            .exec();
        const status = reverseMatch ? match_schema_1.MatchStatus.MATCHED : match_schema_1.MatchStatus.PENDING;
        const match = new this.matchModel({
            _id: (0, uuid_1.v4)(),
            userAId: userId,
            userBId: targetUserId,
            status,
        });
        const savedMatch = await match.save();
        if (reverseMatch) {
            reverseMatch.status = match_schema_1.MatchStatus.MATCHED;
            await reverseMatch.save();
        }
        return savedMatch;
    }
    async unmatch(matchId, userId) {
        const match = await this.matchModel.findOne({ _id: matchId }).exec();
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        if (match.userAId !== userId && match.userBId !== userId) {
            throw new common_1.BadRequestException('Not authorized to unmatch');
        }
        match.status = match_schema_1.MatchStatus.UNMATCHED;
        await match.save();
    }
    async getUserMatches(userId) {
        return this.matchModel
            .find({
            $or: [{ userAId: userId }, { userBId: userId }],
            status: match_schema_1.MatchStatus.MATCHED,
        })
            .populate('userAId userBId', '-refreshToken')
            .exec();
    }
    async getSuggestions(userId, limit = 10, useAI = true, matchMode = 'random') {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingMatches = await this.matchModel
            .find({
            $or: [{ userAId: userId }, { userBId: userId }],
        })
            .exec();
        const excludeIds = existingMatches.map((m) => (m.userAId === userId ? m.userBId : m.userAId));
        excludeIds.push(userId);
        let candidateUsers;
        if (matchMode === 'strict' && user.schoolName) {
            candidateUsers = await this.usersService.findAll({
                page: 1,
                limit: 100,
                schoolName: user.schoolName,
            });
        }
        else {
            candidateUsers = await this.usersService.findAll({
                page: 1,
                limit: 100,
            });
        }
        const candidates = candidateUsers.data
            .filter((u) => !excludeIds.includes(u._id))
            .slice(0, limit * 2);
        if (candidates.length === 0) {
            return [];
        }
        if (!useAI || !user.settings?.aiSuggestionsEnabled) {
            return candidates.slice(0, limit).map((c) => ({
                candidateId: c._id,
                score: 50 + Math.floor(Math.random() * 50),
                explanation: matchMode === 'strict'
                    ? 'Study partner from your school'
                    : 'Study partner - Discover new connections!',
                candidate: c,
            }));
        }
        const candidateProfiles = candidates.map((c) => ({
            id: c._id,
            age: c.age,
            major: c.major,
            faculty: c.faculty,
            interests: c.interests || [],
            bio: c.bio || '',
        }));
        const results = await this.groqClient.computeCompatibility(userId, candidateProfiles);
        const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, limit);
        return sortedResults.map((r) => ({
            ...r,
            candidate: candidates.find((c) => c._id === r.candidateId),
        }));
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(match_schema_1.Match.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService,
        groq_llm_client_1.GroqLLMClient])
], MatchesService);
//# sourceMappingURL=matches.service.js.map