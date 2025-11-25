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
exports.MatchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const matches_service_1 = require("./matches.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const match_dto_1 = require("./dto/match.dto");
let MatchesController = class MatchesController {
    constructor(matchesService) {
        this.matchesService = matchesService;
    }
    async createMatch(targetId, req) {
        return this.matchesService.createMatch(req.user.userId, targetId);
    }
    async unmatch(id, req) {
        await this.matchesService.unmatch(id, req.user.userId);
        return { message: 'Unmatched successfully' };
    }
    async getUserMatches(req) {
        return this.matchesService.getUserMatches(req.user.userId);
    }
    async getSuggestions(req, query) {
        return this.matchesService.getSuggestions(req.user.userId, query.limit, query.useAI, query.matchMode);
    }
};
exports.MatchesController = MatchesController;
__decorate([
    (0, common_1.Post)(':targetId'),
    (0, swagger_1.ApiOperation)({ summary: 'Create match request (swipe right)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: match_dto_1.MatchResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Param)('targetId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "createMatch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Unmatch with user' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Match not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "unmatch", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all matches for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [match_dto_1.MatchResponseDto] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getUserMatches", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered match suggestions' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [match_dto_1.MatchSuggestionDto] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'useAI', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({
        name: 'matchMode',
        required: false,
        type: String,
        description: 'strict (same school only) or random (all schools)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, match_dto_1.MatchSuggestionQueryDto]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getSuggestions", null);
exports.MatchesController = MatchesController = __decorate([
    (0, swagger_1.ApiTags)('matches'),
    (0, common_1.Controller)('matches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [matches_service_1.MatchesService])
], MatchesController);
//# sourceMappingURL=matches.controller.js.map