import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Match, MatchDocument, MatchStatus } from './schemas/match.schema';
import { UsersService } from '../users/users.service';
import { GroqLLMClient } from './clients/groq-llm.client';
import { CandidateProfile } from './interfaces/llm-client.interface';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private usersService: UsersService,
    private groqClient: GroqLLMClient,
  ) {}

  async createMatch(userId: string, targetUserId: string): Promise<Match> {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot match with yourself');
    }

    // Check if match already exists
    const existingMatch = await this.matchModel
      .findOne({
        $or: [
          { userAId: userId, userBId: targetUserId },
          { userAId: targetUserId, userBId: userId },
        ],
      })
      .exec();

    if (existingMatch) {
      if (existingMatch.status === MatchStatus.UNMATCHED) {
        // Reactivate the match
        existingMatch.status = MatchStatus.PENDING;
        return existingMatch.save();
      }
      throw new BadRequestException('Match already exists');
    }

    // Check if target user has already liked this user
    const reverseMatch = await this.matchModel
      .findOne({
        userAId: targetUserId,
        userBId: userId,
        status: MatchStatus.PENDING,
      })
      .exec();

    const status = reverseMatch ? MatchStatus.MATCHED : MatchStatus.PENDING;

    const match = new this.matchModel({
      _id: uuidv4(),
      userAId: userId,
      userBId: targetUserId,
      status,
    });

    const savedMatch = await match.save();

    // Update reverse match if it exists
    if (reverseMatch) {
      reverseMatch.status = MatchStatus.MATCHED;
      await reverseMatch.save();
    }

    return savedMatch;
  }

  async unmatch(matchId: string, userId: string): Promise<void> {
    const match = await this.matchModel.findOne({ _id: matchId }).exec();

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      throw new BadRequestException('Not authorized to unmatch');
    }

    match.status = MatchStatus.UNMATCHED;
    await match.save();
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return this.matchModel
      .find({
        $or: [{ userAId: userId }, { userBId: userId }],
        status: MatchStatus.MATCHED,
      })
      .populate('userAId userBId', '-refreshToken')
      .exec();
  }

  async getSuggestions(
    userId: string,
    limit: number = 10,
    useAI: boolean = true,
    matchMode: string = 'random',
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get users the current user hasn't matched with
    const existingMatches = await this.matchModel
      .find({
        $or: [{ userAId: userId }, { userBId: userId }],
      })
      .exec();

    const excludeIds = existingMatches.map((m) => (m.userAId === userId ? m.userBId : m.userAId));
    excludeIds.push(userId);

    // Get candidate users based on match mode
    let candidateUsers;
    if (matchMode === 'strict' && user.schoolName) {
      // Strict mode: only same school
      candidateUsers = await this.usersService.findAll({
        page: 1,
        limit: 100,
        schoolName: user.schoolName,
      });
    } else {
      // Random mode: all schools
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
      // Return random candidates
      return candidates.slice(0, limit).map((c) => ({
        candidateId: c._id,
        score: 50 + Math.floor(Math.random() * 50),
        explanation:
          matchMode === 'strict'
            ? 'Study partner from your school'
            : 'Study partner - Discover new connections!',
        candidate: c,
      }));
    }

    // Use AI matching
    const candidateProfiles: CandidateProfile[] = candidates.map((c) => ({
      id: c._id,
      age: c.age,
      major: c.major,
      faculty: c.faculty,
      interests: c.interests || [],
      bio: c.bio || '',
    }));

    const results = await this.groqClient.computeCompatibility(userId, candidateProfiles);

    // Sort by score and attach full candidate info
    const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, limit);

    return sortedResults.map((r) => ({
      ...r,
      candidate: candidates.find((c) => c._id === r.candidateId),
    }));
  }
}
