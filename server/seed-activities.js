import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from './models/Activity.js';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_profile_manager';

async function seedActivities() {
    try {
        console.log('🌱 Seeding demo activities...');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find();
        if (users.length === 0) {
            console.log('❌ No users found. Run seed-demo-users.js first.');
            process.exit(1);
        }

        const actions = [
            { type: 'LOGIN', msg: 'User logged in' },
            { type: 'PROFILE_UPDATE', msg: 'Updated profile information' },
            { type: 'SEARCH', msg: 'Searched for users' },
            { type: 'ROLE_CHANGE', msg: 'Changed user role' },
            { type: 'EXPORT', msg: 'Exported user data' }
        ];

        const activities = [];
        const now = new Date();

        for (let i = 0; i < 100; i += 1) {
            const user = users[Math.floor(Math.random() * users.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const date = new Date(now);
            date.setHours(now.getHours() - Math.floor(Math.random() * 24 * 7)); // Within last 7 days

            activities.push({
                actorId: user._id,
                actor: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                actionType: action.type,
                message: action.msg,
                status: 'SUCCESS',
                createdAt: date,
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                device: 'Desktop',
                severity: 'INFO'
            });
        }

        await Activity.deleteMany({}); // Clear existing
        await Activity.insertMany(activities);

        console.log(`✨ Seeded ${activities.length} activities successfully!`);

    } catch (error) {
        console.error('❌ Error seeding activities:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seedActivities();
