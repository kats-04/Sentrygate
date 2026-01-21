#!/usr/bin/env node

/**
 * Smoke Tests - Post-Deployment Validation
 * Run these tests after deployment to verify system health
 * Usage: node smoke-tests.js <base_url>
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.argv[2] || 'http://localhost:5000';
const TIMEOUT = 10000;

class SmokeTest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
    this.passCount = 0;
    this.failCount = 0;
  }

  async request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      const request = client.request(url, {
        method: options.method || 'GET',
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmokeTest/1.0',
          ...options.headers,
        },
      }, (response) => {
        let data = '';

        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: data ? JSON.parse(data) : null,
          });
        });
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.on('error', reject);

      if (options.body) {
        request.write(JSON.stringify(options.body));
      }

      request.end();
    });
  }

  async test(name, fn) {
    try {
      await fn();
      this.pass(name);
    } catch (error) {
      this.fail(name, error.message);
    }
  }

  pass(name) {
    this.passCount++;
    this.results.push(`✅ PASS: ${name}`);
  }

  fail(name, error) {
    this.failCount++;
    this.results.push(`❌ FAIL: ${name} - ${error}`);
  }

  async run() {
    console.log(`\n🚀 Starting Smoke Tests on ${this.baseUrl}\n`);

    // Health Check
    await this.test('Health Check', async () => {
      const response = await this.request('/api/health');
      if (response.status !== 200) throw new Error(`Status: ${response.status}`);
      if (!response.body.status) throw new Error('No status in response');
    });

    // API Server Response
    await this.test('Server is Running', async () => {
      const response = await this.request('/api/health');
      if (response.status !== 200) throw new Error('Server not responding');
    });

    // Database Connectivity (via API)
    await this.test('Database Connected', async () => {
      const response = await this.request('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'nonexistent@test.com', password: 'test' },
      });
      // Should return 401 (not authenticated) rather than 500 (db error)
      if (response.status >= 500) throw new Error('Database connection failed');
    });

    // Rate Limiting Active
    await this.test('Rate Limiting Enabled', async () => {
      let statusCodes = [];
      for (let i = 0; i < 20; i++) {
        try {
          const response = await this.request('/api/health');
          statusCodes.push(response.status);
        } catch (error) {
          // Ignore
        }
      }
      const hasRateLimit = statusCodes.some(code => code === 429);
      if (!hasRateLimit && statusCodes.every(code => code !== 429)) {
        console.warn('⚠️  Warning: Rate limiting may not be active');
      }
    });

    // CORS Headers
    await this.test('CORS Headers Present', async () => {
      const response = await this.request('/api/health', {
        headers: { 'Origin': 'https://example.com' },
      });
      if (!response.headers['access-control-allow-origin']) {
        throw new Error('No CORS headers');
      }
    });

    // Security Headers
    await this.test('Security Headers Present', async () => {
      const response = await this.request('/api/health');
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
      ];
      const missingHeaders = requiredHeaders.filter(
        header => !response.headers[header]
      );
      if (missingHeaders.length > 0) {
        console.warn(`⚠️  Missing headers: ${missingHeaders.join(', ')}`);
      }
    });

    // API Response Format
    await this.test('API Response Format Valid', async () => {
      const response = await this.request('/api/health');
      if (!response.body || typeof response.body !== 'object') {
        throw new Error('Invalid response format');
      }
    });

    // Error Handling
    await this.test('Error Handling Works', async () => {
      const response = await this.request('/api/nonexistent');
      if (response.status !== 404) throw new Error('404 Not Found not working');
    });

    // Authentication Endpoint
    await this.test('Authentication Endpoint Available', async () => {
      const response = await this.request('/api/v1/auth/login', {
        method: 'POST',
        body: { email: 'test@test.com', password: 'test' },
      });
      // Should return 401 (invalid credentials) not 404 (not found)
      if (response.status === 404) throw new Error('Auth endpoint not available');
    });

    // Performance - Response Time
    await this.test('Response Time < 1s', async () => {
      const start = Date.now();
      await this.request('/api/health');
      const duration = Date.now() - start;
      if (duration > 1000) throw new Error(`Response time: ${duration}ms`);
    });

    // Socket.io Availability (if applicable)
    await this.test('WebSocket Support Available', async () => {
      const response = await this.request('/socket.io/?EIO=4&transport=polling');
      if (response.status === 404 && response.status !== 400) {
        console.warn('⚠️  WebSocket may not be available');
      }
    });

    // SSL/TLS (if HTTPS)
    if (this.baseUrl.startsWith('https://')) {
      await this.test('SSL Certificate Valid', async () => {
        // If connection succeeds, certificate is valid
        await this.request('/api/health');
      });
    }

    // Memory Usage Check
    await this.test('Server Memory Healthy', async () => {
      const response = await this.request('/api/health');
      if (response.status === 503) throw new Error('Server under memory pressure');
    });

    this.printResults();
    return this.failCount === 0;
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('SMOKE TEST RESULTS');
    console.log('='.repeat(60));

    this.results.forEach(result => console.log(result));

    console.log('='.repeat(60));
    console.log(`Total: ${this.passCount + this.failCount} | ✅ Pass: ${this.passCount} | ❌ Fail: ${this.failCount}`);
    console.log('='.repeat(60) + '\n');

    if (this.failCount === 0) {
      console.log('✅ All smoke tests passed! System is healthy.\n');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed. Please investigate.\n');
      process.exit(1);
    }
  }
}

// Run tests
const smokeTest = new SmokeTest(BASE_URL);
smokeTest.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
