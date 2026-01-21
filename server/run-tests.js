#!/usr/bin/env node

/**
 * Test Runner - Comprehensive Testing Suite
 * Usage: npm run test (or node run-tests.js)
 */

import { runAllTests } from './test/unit.test.js';
import { runAllIntegrationTests } from './test/integration.test.js';

console.log(`\n${  '='.repeat(60)}`);
console.log('USER PROFILE MANAGER - COMPREHENSIVE TEST SUITE');
console.log(`${'='.repeat(60)  }\n`);

async function runAllTestSuites() {
  let allTestsPassed = true;

  // Run unit tests
  try {
    const unitTestsPassed = await runAllTests();
    if (!unitTestsPassed) {
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('Error running unit tests:', error);
    allTestsPassed = false;
  }

  // Run integration tests
  try {
    const integrationTestsPassed = await runAllIntegrationTests();
    if (!integrationTestsPassed) {
      allTestsPassed = false;
    }
  } catch (error) {
    console.error('Error running integration tests:', error);
    allTestsPassed = false;
  }

  // Summary
  console.log(`\n${  '='.repeat(60)}`);
  if (allTestsPassed) {
    console.log('✅ ALL TEST SUITES PASSED');
    console.log(`${'='.repeat(60)  }\n`);
    process.exit(0);
  } else {
    console.log('❌ SOME TEST SUITES FAILED');
    console.log(`${'='.repeat(60)  }\n`);
    process.exit(1);
  }
}

runAllTestSuites().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
