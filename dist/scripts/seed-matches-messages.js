"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
const uuid_1 = require("uuid");
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
const targetUserId = '8312bfc2-763c-4398-b719-7d82910dc24a';
const matchSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    userAId: { type: String, ref: 'User', required: true },
    userBId: { type: String, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'matched', 'unmatched'],
        required: true,
    },
    score: Number,
    explanation: String,
}, { timestamps: true });
const messageSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    matchId: { type: String, ref: 'Match', required: true },
    senderId: { type: String, ref: 'User', required: true },
    recipientId: { type: String, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: String,
    email: String,
    major: String,
    interests: [String],
}, { strict: false });
const Match = mongoose.model('Match', matchSchema);
const Message = mongoose.model('Message', messageSchema);
const User = mongoose.model('User', userSchema);
const messageTemplates = [
    "Hey! I saw we're both studying {major}. Want to form a study group?",
    'Hi! Are you taking {course} this semester? Maybe we could help each other out.',
    "Hello! I'm interested in {interest} too. Have you worked on any projects?",
    'Hey there! Would you be interested in collaborating on assignments?',
    'Hi! I noticed we have similar interests. Want to study together sometime?',
    "Hello! I'm preparing for finals. Want to create a study schedule together?",
    'Hey! Are you familiar with {topic}? I could use some help understanding it.',
    "Hi! I'm working on a project about {interest}. Want to team up?",
    "Hello! Do you have notes from last week's lecture? I missed it.",
    'Hey! Want to grab coffee and discuss our upcoming exam?',
];
const responses = [
    'Sure! That sounds great. When are you free?',
    "Yes! I'd love to. Let me check my schedule.",
    'Absolutely! I was looking for a study partner too.',
    "That would be awesome! Let's do it.",
    'Count me in! What time works for you?',
    "Great idea! I'm available this week.",
    'Sounds perfect! Should we meet at the library?',
    "I'm definitely interested! Let's plan something.",
    'Yes please! I need help with that too.',
    'For sure! Let me know what works best for you.',
];
const followUps = [
    'How about tomorrow at 3pm?',
    "I'm free on Wednesday afternoon.",
    'The library has good study rooms. Want to book one?',
    'I have some great resources we could use.',
    'Maybe we could start with chapter 5?',
    "I'm also working on the assignment due next week.",
    'Do you prefer morning or afternoon study sessions?',
    'I know a quiet cafe near campus if you prefer.',
    'I can bring my notes and we can compare.',
    "Let's create a shared document to organize our work.",
];
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function generateMessageContent(template, user) {
    const interests = ['AI', 'Machine Learning', 'Web Development', 'Data Science'];
    const courses = ['Advanced Algorithms', 'Database Systems', 'Software Engineering'];
    const topics = ['recursion', 'binary trees', 'dynamic programming', 'APIs'];
    return template
        .replace('{major}', user.major || 'Computer Science')
        .replace('{interest}', getRandomElement(user.interests || interests))
        .replace('{course}', getRandomElement(courses))
        .replace('{topic}', getRandomElement(topics));
}
async function seedMatchesAndMessages() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not found');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB\n');
        const targetUser = (await User.findOne({ _id: targetUserId }));
        if (!targetUser) {
            console.error(`User with ID ${targetUserId} not found!`);
            process.exit(1);
        }
        console.log(`Found target user: ${targetUser.name} (${targetUser.email})\n`);
        const allUsers = (await User.find({
            _id: { $ne: targetUserId },
            email: { $regex: '@mockuni\\.edu$' },
        }).limit(10));
        if (allUsers.length === 0) {
            console.error('No other users found! Please run seed-mock-data.ts first.');
            process.exit(1);
        }
        console.log(`Found ${allUsers.length} potential matches\n`);
        await Match.deleteMany({
            $or: [{ userAId: targetUserId }, { userBId: targetUserId }],
        });
        console.log('Cleared existing matches\n');
        const matches = [];
        const messages = [];
        for (let i = 0; i < Math.min(6, allUsers.length); i++) {
            const otherUser = allUsers[i];
            const matchId = (0, uuid_1.v4)();
            const isUserA = Math.random() > 0.5;
            const match = {
                _id: matchId,
                userAId: isUserA ? targetUserId : otherUser._id,
                userBId: isUserA ? otherUser._id : targetUserId,
                status: 'matched',
                score: 70 + Math.floor(Math.random() * 30),
                explanation: `Great match! Both interested in ${getRandomElement(otherUser.interests || ['technology', 'learning'])} and studying ${otherUser.major || 'similar fields'}.`,
            };
            matches.push(match);
            const messageCount = 3 + Math.floor(Math.random() * 6);
            const now = Date.now();
            for (let j = 0; j < messageCount; j++) {
                const isSender = j % 2 === 0;
                const senderId = isSender ? targetUserId : otherUser._id;
                const recipientId = isSender ? otherUser._id : targetUserId;
                let content;
                if (j === 0) {
                    content = generateMessageContent(getRandomElement(messageTemplates), otherUser);
                }
                else if (j === 1) {
                    content = getRandomElement(responses);
                }
                else {
                    content = getRandomElement(followUps);
                }
                const message = {
                    _id: (0, uuid_1.v4)(),
                    matchId: matchId,
                    senderId: senderId,
                    recipientId: recipientId,
                    content: content,
                    read: j < messageCount - 2,
                    deleted: false,
                    createdAt: new Date(now - (messageCount - j) * 3600000),
                    updatedAt: new Date(now - (messageCount - j) * 3600000),
                };
                messages.push(message);
            }
        }
        for (let i = 6; i < Math.min(9, allUsers.length); i++) {
            const otherUser = allUsers[i];
            const matchId = (0, uuid_1.v4)();
            const match = {
                _id: matchId,
                userAId: otherUser._id,
                userBId: targetUserId,
                status: 'pending',
                score: 60 + Math.floor(Math.random() * 25),
                explanation: `Potential study partner with shared interest in ${getRandomElement(otherUser.interests || ['academics'])}.`,
            };
            matches.push(match);
        }
        if (matches.length > 0) {
            await Match.insertMany(matches);
            console.log(`✅ Created ${matches.length} matches`);
            console.log(`   - ${matches.filter((m) => m.status === 'matched').length} matched`);
            console.log(`   - ${matches.filter((m) => m.status === 'pending').length} pending\n`);
        }
        if (messages.length > 0) {
            await Message.insertMany(messages);
            console.log(`✅ Created ${messages.length} messages\n`);
        }
        console.log('📊 Summary:');
        console.log('\nMatched Users:');
        matches
            .filter((m) => m.status === 'matched')
            .forEach((match) => {
            const otherUserId = match.userAId === targetUserId ? match.userBId : match.userAId;
            const otherUser = allUsers.find((u) => u._id === otherUserId);
            const msgCount = messages.filter((msg) => msg.matchId === match._id).length;
            console.log(`  • ${otherUser?.name} (${otherUser?.major}) - ${msgCount} messages - Score: ${match.score}`);
        });
        console.log('\nPending Matches:');
        matches
            .filter((m) => m.status === 'pending')
            .forEach((match) => {
            const otherUser = allUsers.find((u) => u._id === match.userAId);
            console.log(`  • ${otherUser?.name} (${otherUser?.major}) - Score: ${match.score}`);
        });
        console.log('\n🎉 Mock matches and messages created successfully!');
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
    finally {
        await mongoose.disconnect();
        console.log('\nConnection closed');
    }
}
seedMatchesAndMessages();
//# sourceMappingURL=seed-matches-messages.js.map