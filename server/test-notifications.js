import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
const Notification = (await import('./models/Notification.js')).default;
const User = (await import('./models/User.js')).default;

/**
 * Test script to create sample notifications for testing
 */
async function createTestNotifications() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/user-profile-manager');
        console.log('✅ Connected to database');

        // Get all users to create notifications for each
        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        const notificationTypes = [
            { type: 'info', title: 'Welcome!', message: 'Welcome to your dashboard. Explore all the features!' },
            { type: 'success', title: 'Profile Updated', message: 'Your profile has been successfully updated.' },
            { type: 'warning', title: 'Security Alert', message: 'New login detected from an unknown device.' },
            { type: 'alert', title: 'Important Notice', message: 'System maintenance scheduled for tonight at 2 AM.' },
            { type: 'error', title: 'Failed Action', message: 'Failed to process your last request. Please try again.' },
        ];

        for (const user of users) {
            console.log(`\n📬 Creating notifications for ${user.email}...`);

            // Create 3 random notifications for each user
            for (let i = 0; i < 3; i++) {
                const randomNotif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

                await Notification.create({
                    userId: user._id,
                    type: randomNotif.type,
                    title: randomNotif.title,
                    message: randomNotif.message,
                    read: i === 2, // Make the last one already read
                    actionUrl: i === 0 ? '/security' : null,
                });

                console.log(`  ✓ Created: ${randomNotif.title}`);
            }
        }

        console.log('\n✅ Test notifications created successfully!');
        console.log('🔍 You can now login and check the bell icon in the top right.');

        // Also send a real-time notification via Socket.io if server is running
        console.log('\n💡 To test real-time notifications, make sure the server is running with Socket.io');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestNotifications();
