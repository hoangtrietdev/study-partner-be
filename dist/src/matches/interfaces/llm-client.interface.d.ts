export interface ILLMClient {
    computeCompatibility(userId: string, candidates: CandidateProfile[]): Promise<CompatibilityResult[]>;
}
export interface CandidateProfile {
    id: string;
    age: number;
    major: string;
    faculty: string;
    interests: string[];
    bio: string;
}
export interface CompatibilityResult {
    candidateId: string;
    score: number;
    explanation: string;
}
