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
exports.MatchSchema = exports.Match = exports.MatchStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["PENDING"] = "pending";
    MatchStatus["MATCHED"] = "matched";
    MatchStatus["UNMATCHED"] = "unmatched";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Match ID' }),
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Match.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User A ID' }),
    (0, mongoose_1.Prop)({ type: String, ref: 'User', required: true }),
    __metadata("design:type", String)
], Match.prototype, "userAId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User B ID' }),
    (0, mongoose_1.Prop)({ type: String, ref: 'User', required: true }),
    __metadata("design:type", String)
], Match.prototype, "userBId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Match status', enum: MatchStatus }),
    (0, mongoose_1.Prop)({ type: String, enum: MatchStatus, default: MatchStatus.PENDING }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AI compatibility score (0-100)' }),
    (0, mongoose_1.Prop)({ min: 0, max: 100 }),
    __metadata("design:type", Number)
], Match.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AI explanation for the match' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Match.prototype, "explanation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at timestamp' }),
    __metadata("design:type", Date)
], Match.prototype, "updatedAt", void 0);
exports.Match = Match = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Match);
exports.MatchSchema = mongoose_1.SchemaFactory.createForClass(Match);
exports.MatchSchema.index({ userAId: 1, userBId: 1 }, { unique: true });
//# sourceMappingURL=match.schema.js.map