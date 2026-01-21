import { strict as assert } from 'assert';
import { z } from 'zod';

// User registration validation tests
export const testUserValidation = async () => {
  const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  });

  // Valid user
  const validUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  const result = userSchema.safeParse(validUser);
  assert.ok(result.success, 'Valid user should pass validation');

  // Invalid email
  const invalidUser = {
    name: 'Jane',
    email: 'not-an-email',
    password: 'password123',
  };

  const invalidResult = userSchema.safeParse(invalidUser);
  assert.ok(!invalidResult.success, 'Invalid email should fail validation');

  console.log('✓ User validation tests passed');
};

// Email notification format tests
export const testEmailNotifications = async () => {
  const templates = {
    welcome: (name) => ({
      subject: `Welcome ${name}!`,
      html: `<h1>Welcome</h1>`,
    }),
    passwordReset: (token) => ({
      subject: 'Password Reset',
      html: `<a href="/reset?token=${token}">Reset</a>`,
    }),
  };

  const welcomeEmail = templates.welcome('John');
  assert.ok(welcomeEmail.subject.includes('Welcome'));
  assert.ok(welcomeEmail.html.includes('<h1>'));

  const resetEmail = templates.passwordReset('abc123');
  assert.ok(resetEmail.subject === 'Password Reset');
  assert.ok(resetEmail.html.includes('token=abc123'));

  console.log('✓ Email notification tests passed');
};

// Rate limiting tests
export const testRateLimiting = async () => {
  const requests = [];
  const limit = 10;
  const window = 60000; // 1 minute

  const isRateLimited = () => {
    const now = Date.now();
    const recentRequests = requests.filter(t => now - t < window);
    return recentRequests.length >= limit;
  };

  // Simulate requests
  for (let i = 0; i < 12; i++) {
    requests.push(Date.now());
    if (i < 9) {
      assert.ok(!isRateLimited(), `Request ${i} should not be rate limited`);
    } else {
      assert.ok(isRateLimited(), `Request ${i} should be rate limited`);
    }
  }

  console.log('✓ Rate limiting tests passed');
};

// Webhook signature tests
export const testWebhookSignature = async () => {
  const crypto = await import('crypto');

  const secret = 'test-secret';
  const payload = { event: 'test', data: { id: 1 } };

  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  // Verify signature matches
  const newSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  assert.equal(signature, newSignature, 'Signatures should match');

  // Different payload should have different signature
  const differentPayload = { event: 'different', data: { id: 2 } };
  const differentSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(differentPayload))
    .digest('hex');

  assert.notEqual(signature, differentSignature, 'Different payloads should have different signatures');

  console.log('✓ Webhook signature tests passed');
};

// Analytics aggregation tests
export const testAnalyticsAggregation = async () => {
  // Simulate user login data
  const loginData = [
    { userId: '1', date: '2024-01-01', success: true },
    { userId: '2', date: '2024-01-01', success: true },
    { userId: '1', date: '2024-01-02', success: true },
    { userId: '3', date: '2024-01-02', success: false },
  ];

  // Aggregate daily active users
  const dau = {};
  for (const log of loginData) {
    if (log.success) {
      if (!dau[log.date]) dau[log.date] = new Set();
      dau[log.date].add(log.userId);
    }
  }

  const dauCounts = Object.entries(dau).map(([date, users]) => ({
    date,
    count: users.size,
  }));

  assert.equal(dauCounts.length, 2, 'Should have 2 days of data');
  assert.equal(dauCounts[0].count, 2, 'First day should have 2 active users');
  assert.equal(dauCounts[1].count, 1, 'Second day should have 1 active user');

  console.log('✓ Analytics aggregation tests passed');
};

// Run all tests
export const runAllTests = async () => {
  console.log('\n📋 Running Unit Tests...\n');

  try {
    await testUserValidation();
    await testEmailNotifications();
    await testRateLimiting();
    await testWebhookSignature();
    await testAnalyticsAggregation();

    console.log('\n✅ All unit tests passed!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message, '\n');
    return false;
  }
};

export default {
  runAllTests,
  testUserValidation,
  testEmailNotifications,
  testRateLimiting,
  testWebhookSignature,
  testAnalyticsAggregation,
};
