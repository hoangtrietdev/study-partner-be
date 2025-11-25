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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqLLMClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let GroqLLMClient = class GroqLLMClient {
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('GROQ_API_KEY') || '';
        this.baseUrl = this.configService.get('GROQ_BASE_URL') || 'https://api.groq.com/openai/v1';
    }
    async computeCompatibility(userId, candidates) {
        if (!this.apiKey) {
            console.warn('Groq API key not configured, using fallback matcher');
            return this.fallbackMatcher(candidates);
        }
        try {
            const prompt = this.buildPrompt(candidates);
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI study partner matching assistant. Analyze candidate profiles and return compatibility scores with explanations. Return JSON array only.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const content = response.data.choices[0]?.message?.content;
            if (!content) {
                return this.fallbackMatcher(candidates);
            }
            const results = JSON.parse(content);
            return results.map((r) => ({
                candidateId: r.candidateId || r.id,
                score: Math.min(100, Math.max(0, r.score)),
                explanation: r.explanation || r.reason || 'Compatible study partner',
            }));
        }
        catch (error) {
            console.error('Groq API error:', error);
            return this.fallbackMatcher(candidates);
        }
    }
    buildPrompt(candidates) {
        const candidatesJson = candidates.map((c) => ({
            id: c.id,
            age: c.age,
            major: c.major,
            faculty: c.faculty,
            interests: c.interests,
            bio: c.bio,
        }));
        return `
Analyze these study partner candidates and rank them by compatibility.
Consider: academic overlap (major/faculty), shared interests, age proximity, and study goals from bio.

Candidates:
${JSON.stringify(candidatesJson, null, 2)}

Return JSON array (no markdown):
[
  {
    "candidateId": "id",
    "score": 0-100,
    "explanation": "Brief reason (2-3 sentences)"
  }
]

Order by score descending.
    `.trim();
    }
    fallbackMatcher(candidates) {
        return candidates.map((candidate) => {
            let score = 50;
            const interestBonus = Math.min(30, candidate.interests.length * 5);
            score += interestBonus;
            score += Math.floor(Math.random() * 20);
            return {
                candidateId: candidate.id,
                score: Math.min(100, score),
                explanation: `Compatible based on ${candidate.interests.length} shared interests and ${candidate.major} major.`,
            };
        });
    }
};
exports.GroqLLMClient = GroqLLMClient;
exports.GroqLLMClient = GroqLLMClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GroqLLMClient);
//# sourceMappingURL=groq-llm.client.js.map