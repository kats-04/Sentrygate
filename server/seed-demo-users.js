import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_profile_manager';

const demoUsers = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin12345',
        role: 'Admin',
        status: 'active',
    },
    {
        name: 'Team Lead User',
        email: 'teamlead@example.com',
        password: 'teamlead123',
        role: 'TeamLead',
        status: 'active',
    },
    {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user12345',
        role: 'User',
        status: 'active',
    },
    {
        name: 'Auditor User',
        email: 'auditor@example.com',
        password: 'auditor123',
        role: 'Auditor',
        status: 'active',
    },
];

async function seedDemoUsers() {
    try {
        console.log('🌱 Seeding demo users...');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⏭️  User ${userData.email} already exists, skipping...`);
                continue;
            }

            // Password is automatically hashed by User model pre-save hook
            const user = await User.create(userData);
            console.log(`✅ Created ${user.role}: ${user.email}`);
        }

        console.log('\n✨ Demo users ready!');
        console.log('\n📝 Login credentials:');
        console.log('👑 Admin: admin@example.com / admin12345');
        console.log('👨‍💼 TeamLead: teamlead@example.com / teamlead123');
        console.log('👤 User: user@example.com / user12345');
        console.log('👁️ Auditor: auditor@example.com / auditor123\n');

    } catch (error) {
        console.error('❌ Error seeding demo users:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seedDemoUsers();
