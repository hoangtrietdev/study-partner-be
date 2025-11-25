import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: resolve(__dirname, '../.env') });

const universities = [
  'Technical University of Munich',
  'ETH Zurich',
  'University of Oxford',
  'University of Cambridge',
  'Imperial College London',
  'Delft University of Technology',
  'KU Leuven',
  'University of Amsterdam',
  'Sorbonne University',
  'Ludwig Maximilian University of Munich',
  'University of Copenhagen',
  'Stockholm University',
  'University of Barcelona',
  'Sapienza University of Rome',
  'University of Vienna',
];

const faculties = [
  'Engineering',
  'Computer Science',
  'Natural Sciences',
  'Mathematics',
  'Physics',
  'Business Administration',
  'Economics',
  'Medicine',
  'Law',
  'Social Sciences',
  'Arts and Humanities',
  'Architecture',
];

const majors = [
  'Computer Science',
  'Software Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Business Administration',
  'Economics',
  'Finance',
  'Marketing',
  'Physics',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Medicine',
  'Law',
  'Psychology',
  'Sociology',
  'Architecture',
  'Industrial Design',
];

const interests = [
  'Programming',
  'Web Development',
  'Mobile Apps',
  'Machine Learning',
  'AI',
  'Data Science',
  'Blockchain',
  'Cybersecurity',
  'Game Development',
  'UI/UX Design',
  'Mathematics',
  'Physics',
  'Research',
  'Startups',
  'Entrepreneurship',
  'Photography',
  'Music',
  'Sports',
  'Reading',
  'Writing',
  'Travel',
  'Languages',
  'Cooking',
  'Fitness',
];

const firstNames = [
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Ava',
  'Lucas',
  'Sophia',
  'Oliver',
  'Isabella',
  'Elijah',
  'Mia',
  'James',
  'Charlotte',
  'Benjamin',
  'Amelia',
  'Alexander',
  'Harper',
  'William',
  'Evelyn',
  'Sebastian',
  'Aria',
  'Leon',
  'Luna',
  'Felix',
  'Sofia',
  'Max',
  'Ella',
  'Leo',
  'Marie',
  'Viktor',
  'Anna',
  'Marco',
  'Julia',
  'Adrian',
  'Laura',
  'Daniel',
  'Sarah',
  'David',
  'Nina',
  'Thomas',
];

const lastNames = [
  'Schmidt',
  'Mueller',
  'Schneider',
  'Fischer',
  'Weber',
  'Meyer',
  'Wagner',
  'Becker',
  'Schulz',
  'Hoffmann',
  'Koch',
  'Richter',
  'Klein',
  'Wolf',
  'Schroder',
  'Neumann',
  'Schwarz',
  'Zimmermann',
  'Braun',
  'Kruger',
  'Hartmann',
  'Lange',
  'Schmitt',
  'Werner',
  'Krause',
  'Meier',
  'Lehmann',
  'Huber',
  'Mayer',
  'Herrmann',
];

const bios = [
  'Passionate about technology and innovation. Looking for study partners to collaborate on exciting projects!',
  "Love learning new things and sharing knowledge. Let's study together!",
  'CS student with a passion for AI and machine learning. Open to collaboration!',
  'Engineering enthusiast who enjoys problem-solving and building things.',
  'Always curious and eager to learn. Looking for motivated study partners!',
  "Tech geek and coffee addict. Let's code and study together!",
  'Interested in research and academic excellence. Seeking serious study partners.',
  'Balancing studies with side projects. Would love to collaborate!',
  "Mathematics and algorithms are my jam. Let's solve problems together!",
  'Future entrepreneur looking for like-minded study buddies.',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateAvatar(name: string): string {
  // Using UI Avatars service for random avatars
  const encodedName = encodeURIComponent(name);
  const colors = ['7C3AED', '9333EA', 'A855F7', '8B5CF6', '6366F1', '4F46E5'];
  const color = getRandomElement(colors);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${color}&color=fff&size=200`;
}

// Define User schema directly for seeding
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: String,
    schoolName: String,
    age: Number,
    major: String,
    faculty: String,
    interests: [String],
    bio: String,
    settings: {
      aiSuggestionsEnabled: Boolean,
      notifications: Boolean,
      darkMode: Boolean,
    },
    lastSeenAt: Date,
    refreshToken: String,
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

async function seedData() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB\n');

    // Clear existing mock users (keep real ones)
    await User.deleteMany({
      email: { $regex: '@mockuni\\.edu$' },
    });

    console.log('Creating 50 mock students...\n');

    const mockUsers = [];

    for (let i = 0; i < 50; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@mockuni.edu`;
      const schoolName = getRandomElement(universities);
      const faculty = getRandomElement(faculties);
      const major = getRandomElement(majors);
      const age = 18 + Math.floor(Math.random() * 8); // 18-25
      const userInterests = getRandomElements(interests, 3 + Math.floor(Math.random() * 5)); // 3-7 interests

      const user = {
        _id: uuidv4(),
        googleId: `mock-google-${uuidv4()}`,
        name: fullName,
        email: email,
        imageUrl: generateAvatar(fullName),
        schoolName: schoolName,
        age: age,
        major: major,
        faculty: faculty,
        interests: userInterests,
        bio: getRandomElement(bios),
        settings: {
          aiSuggestionsEnabled: true,
          notifications: true,
          darkMode: Math.random() > 0.5,
        },
        lastSeenAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within last week
      };

      mockUsers.push(user);

      console.log(`${i + 1}. ${fullName} - ${major} at ${schoolName.substring(0, 30)}...`);
    }

    await User.insertMany(mockUsers);

    console.log('\n✅ Successfully created 50 mock students!');
    console.log('\nSample users:');
    mockUsers.slice(0, 3).forEach((user) => {
      console.log(`  • ${user.name} (${user.email})`);
      console.log(`    ${user.major} - ${user.schoolName}`);
      console.log(`    Interests: ${user.interests.join(', ')}`);
      console.log(`    Avatar: ${user.imageUrl}\n`);
    });

    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Connection closed');
  }
}

seedData();
