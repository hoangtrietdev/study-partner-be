import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ILLMClient,
  CandidateProfile,
  CompatibilityResult,
} from '../interfaces/llm-client.interface';

@Injectable()
export class GroqLLMClient implements ILLMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('GROQ_API_KEY') || '';
    this.baseUrl = this.configService.get('GROQ_BASE_URL') || 'https://api.groq.com/openai/v1';
  }

  async computeCompatibility(
    userId: string,
    candidates: CandidateProfile[],
  ): Promise<CompatibilityResult[]> {
    if (!this.apiKey) {
      console.warn('Groq API key not configured, using fallback matcher');
      return this.fallbackMatcher(candidates);
    }

    try {
      const prompt = this.buildPrompt(candidates);
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI study partner matching assistant. Analyze candidate profiles and return compatibility scores with explanations. Return JSON array only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        return this.fallbackMatcher(candidates);
      }

      // Parse JSON response
      const results = JSON.parse(content);
      return results.map((r: any) => ({
        candidateId: r.candidateId || r.id,
        score: Math.min(100, Math.max(0, r.score)),
        explanation: r.explanation || r.reason || 'Compatible study partner',
      }));
    } catch (error) {
      console.error('Groq API error:', error);
      return this.fallbackMatcher(candidates);
    }
  }

  private buildPrompt(candidates: CandidateProfile[]): string {
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

  private fallbackMatcher(candidates: CandidateProfile[]): CompatibilityResult[] {
    // Simple deterministic scoring for development
    return candidates.map((candidate) => {
      let score = 50; // base score

      // Interest overlap (up to +30)
      const interestBonus = Math.min(30, candidate.interests.length * 5);
      score += interestBonus;

      // Random variation for diversity
      score += Math.floor(Math.random() * 20);

      return {
        candidateId: candidate.id,
        score: Math.min(100, score),
        explanation: `Compatible based on ${candidate.interests.length} shared interests and ${candidate.major} major.`,
      };
    });
  }
}
