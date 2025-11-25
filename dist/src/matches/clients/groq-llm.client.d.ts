import { ConfigService } from '@nestjs/config';
import { ILLMClient, CandidateProfile, CompatibilityResult } from '../interfaces/llm-client.interface';
export declare class GroqLLMClient implements ILLMClient {
    private configService;
    private apiKey;
    private baseUrl;
    constructor(configService: ConfigService);
    computeCompatibility(userId: string, candidates: CandidateProfile[]): Promise<CompatibilityResult[]>;
    private buildPrompt;
    private fallbackMatcher;
}
