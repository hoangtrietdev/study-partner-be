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
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
async function deleteOldUsers() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not found in environment variables');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        const db = mongoose.connection;
        const usersCollection = db.collection('users');
        const oldUsers = await usersCollection
            .find({
            _id: { $type: 'objectId' },
        })
            .toArray();
        console.log(`Found ${oldUsers.length} users with old ObjectId format`);
        if (oldUsers.length > 0) {
            console.log('Old users:');
            oldUsers.forEach((user) => {
                console.log(`  - ${user._id} (${user.email})`);
            });
            const result = await usersCollection.deleteMany({
                _id: { $type: 'objectId' },
            });
            console.log(`\n✅ Deleted ${result.deletedCount} old users`);
            console.log('You can now log in with Google to create a new UUID-based account');
        }
        else {
            console.log('No old users found');
        }
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
deleteOldUsers();
//# sourceMappingURL=delete-old-users.js.map