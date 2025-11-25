"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const groq_llm_client_1 = require("../src/matches/clients/groq-llm.client");
const config_1 = require("@nestjs/config");
describe('GroqLLMClient', () => {
    let client;
    let configService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                groq_llm_client_1.GroqLLMClient,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            const config = {
                                GROQ_API_KEY: 'test-key',
                                GROQ_BASE_URL: 'https://api.groq.com/openai/v1',
                            };
                            return config[key];
                        }),
                    },
                },
            ],
        }).compile();
        client = module.get(groq_llm_client_1.GroqLLMClient);
        configService = module.get(config_1.ConfigService);
    });
    it('should be defined', () => {
        expect(client).toBeDefined();
    });
    it('should use fallback matcher when API key is not configured', async () => {
        jest.spyOn(configService, 'get').mockReturnValue('');
        const candidates = [
            {
                id: '1',
                age: 20,
                major: 'Computer Science',
                faculty: 'Engineering',
                interests: ['coding', 'ai'],
                bio: 'Love programming',
            },
        ];
        const results = await client.computeCompatibility('user123', candidates);
        expect(results).toBeDefined();
        expect(results.length).toBe(1);
        expect(results[0].candidateId).toBe('1');
        expect(results[0].score).toBeGreaterThanOrEqual(0);
        expect(results[0].score).toBeLessThanOrEqual(100);
    });
    it('should return compatibility results with correct structure', async () => {
        const candidates = [
            {
                id: '1',
                age: 20,
                major: 'Computer Science',
                faculty: 'Engineering',
                interests: ['coding', 'ai', 'math'],
                bio: 'Love programming',
            },
            {
                id: '2',
                age: 22,
                major: 'Mathematics',
                faculty: 'Science',
                interests: ['statistics'],
                bio: 'Data analysis enthusiast',
            },
        ];
        const results = await client.computeCompatibility('user123', candidates);
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        results.forEach((result) => {
            expect(result).toHaveProperty('candidateId');
            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('explanation');
            expect(typeof result.score).toBe('number');
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
        });
    });
});
//# sourceMappingURL=groq-llm-client.spec.js.map