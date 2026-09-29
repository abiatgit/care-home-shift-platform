// ==============================================================================
// API INTEGRATION TEST SUITE
// ==============================================================================
// Simple integration tests for Care Home <-> Keris API communication
// Run with: tsx tests/integration.test.ts
// ==============================================================================

import dotenv from 'dotenv';
dotenv.config();

const KERIS_API_URL = process.env.KERIS_API_URL || 'http://localhost:5001/api';
const CARE_HOME_API_URL = 'http://localhost:5002/api';
const SERVICE_API_KEY = process.env.SERVICE_API_KEY || 'keris-carehome-integration-2024-secure-key';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

function log(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    log(`✓ ${name} (${duration}ms)`, 'success');
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMessage, duration });
    log(`✗ ${name} (${duration}ms)`, 'error');
    log(`  Error: ${errorMessage}`, 'error');
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// ==============================================================================
// TEST SUITE 1: KERIS API AUTHENTICATION
// ==============================================================================

async function testKerisAuthenticationSuccess() {
  const response = await fetch(`${KERIS_API_URL}/external/staff?limit=1`, {
    headers: {
      'X-API-Key': SERVICE_API_KEY,
      'X-Service-Name': 'care-home-shift-platform',
    },
  });

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');
  assert(Array.isArray(data.data), 'Expected data to be an array');
}

async function testKerisAuthenticationMissingKey() {
  const response = await fetch(`${KERIS_API_URL}/external/staff?limit=1`);

  assert(response.status === 401, `Expected 401 Unauthorized, got ${response.status}`);

  const data = await response.json();
  assert(data.success === false, 'Expected success: false');
  assert(data.error.includes('Missing API key'), 'Expected "Missing API key" error');
}

async function testKerisAuthenticationInvalidKey() {
  const response = await fetch(`${KERIS_API_URL}/external/staff?limit=1`, {
    headers: {
      'X-API-Key': 'invalid-key-12345',
      'X-Service-Name': 'care-home-shift-platform',
    },
  });

  assert(response.status === 403, `Expected 403 Forbidden, got ${response.status}`);

  const data = await response.json();
  assert(data.success === false, 'Expected success: false');
  assert(data.error.includes('Invalid API key'), 'Expected "Invalid API key" error');
}

// ==============================================================================
// TEST SUITE 2: KERIS STAFF API ENDPOINTS
// ==============================================================================

async function testKerisStaffFetch() {
  const response = await fetch(`${KERIS_API_URL}/external/staff?limit=10`, {
    headers: {
      'X-API-Key': SERVICE_API_KEY,
      'X-Service-Name': 'care-home-shift-platform',
    },
  });

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');
  assert(Array.isArray(data.data), 'Expected data to be an array');
  assert(typeof data.count === 'number', 'Expected count to be a number');
}

async function testKerisStaffFilterByRole() {
  const response = await fetch(
    `${KERIS_API_URL}/external/staff?role=Registered%20Nurse&limit=5`,
    {
      headers: {
        'X-API-Key': SERVICE_API_KEY,
        'X-Service-Name': 'care-home-shift-platform',
      },
    }
  );

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');

  // Verify all returned staff have matching role
  if (data.data.length > 0) {
    data.data.forEach((worker: any) => {
      assert(
        worker.jobTitle.toLowerCase().includes('nurse'),
        `Expected nurse role, got ${worker.jobTitle}`
      );
    });
  }
}

async function testKerisStaffFilterByAvailability() {
  const response = await fetch(
    `${KERIS_API_URL}/external/staff?availability=Available&limit=10`,
    {
      headers: {
        'X-API-Key': SERVICE_API_KEY,
        'X-Service-Name': 'care-home-shift-platform',
      },
    }
  );

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');

  // Verify all returned staff are available
  if (data.data.length > 0) {
    data.data.forEach((worker: any) => {
      assert(
        worker.availability === 'Available',
        `Expected Available, got ${worker.availability}`
      );
    });
  }
}

async function testKerisStaffById() {
  // First fetch a staff member to get an ID
  const listResponse = await fetch(`${KERIS_API_URL}/external/staff?limit=1`, {
    headers: {
      'X-API-Key': SERVICE_API_KEY,
      'X-Service-Name': 'care-home-shift-platform',
    },
  });

  const listData = await listResponse.json();

  if (listData.data.length === 0) {
    log('  Skipping: No staff found in database', 'info');
    return;
  }

  const staffId = listData.data[0].id;

  // Now fetch by ID
  const response = await fetch(`${KERIS_API_URL}/external/staff/${staffId}`, {
    headers: {
      'X-API-Key': SERVICE_API_KEY,
      'X-Service-Name': 'care-home-shift-platform',
    },
  });

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');
  assert(data.data.id === staffId, `Expected ID ${staffId}, got ${data.data.id}`);
  assert(typeof data.data.fullName === 'string', 'Expected fullName to be a string');
  assert(Array.isArray(data.data.skills), 'Expected skills to be an array');
}

// ==============================================================================
// TEST SUITE 3: CARE HOME API ENDPOINTS
// ==============================================================================

async function testCareHomeShiftsFetch() {
  const response = await fetch(`${CARE_HOME_API_URL}/external/shifts?limit=10`, {
    headers: {
      'X-API-Key': SERVICE_API_KEY,
      'X-Service-Name': 'keris-nurses-data-uk',
    },
  });

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');
  assert(Array.isArray(data.data), 'Expected data to be an array');
}

async function testCareHomeShiftsFilterByStatus() {
  const response = await fetch(
    `${CARE_HOME_API_URL}/external/shifts?status=OPEN&limit=5`,
    {
      headers: {
        'X-API-Key': SERVICE_API_KEY,
        'X-Service-Name': 'keris-nurses-data-uk',
      },
    }
  );

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');

  // Verify all returned shifts are OPEN
  if (data.data.length > 0) {
    data.data.forEach((shift: any) => {
      assert(shift.status === 'OPEN', `Expected OPEN, got ${shift.status}`);
    });
  }
}

async function testCareHomeCareHomesFetch() {
  const response = await fetch(`${CARE_HOME_API_URL}/external/care-homes`, {
    headers: {
      'X-API-Key': SERVICE_API_KEY,
      'X-Service-Name': 'keris-nurses-data-uk',
    },
  });

  assert(response.ok, `Expected 200, got ${response.status}`);

  const data = await response.json();
  assert(data.success === true, 'Expected success: true');
  assert(Array.isArray(data.data), 'Expected data to be an array');
}

// ==============================================================================
// TEST SUITE 4: INTEGRATION SCENARIOS
// ==============================================================================

async function testStaffMatchingIntegration() {
  // Simulate the staff matching flow:
  // 1. Fetch open shifts from Care Home API
  // 2. For a shift, query Keris API for matching staff

  const shiftsResponse = await fetch(
    `${CARE_HOME_API_URL}/external/shifts?status=OPEN&limit=1`,
    {
      headers: {
        'X-API-Key': SERVICE_API_KEY,
        'X-Service-Name': 'test-integration',
      },
    }
  );

  assert(shiftsResponse.ok, `Failed to fetch shifts: ${shiftsResponse.status}`);

  const shiftsData = await shiftsResponse.json();

  if (shiftsData.data.length === 0) {
    log('  Skipping: No open shifts found', 'info');
    return;
  }

  const shift = shiftsData.data[0];

  // Now query Keris for staff matching this shift
  const params = new URLSearchParams({
    role: shift.jobTitle,
    location: shift.location,
    availability: 'Available',
    limit: '5',
  });

  const staffResponse = await fetch(
    `${KERIS_API_URL}/external/staff?${params.toString()}`,
    {
      headers: {
        'X-API-Key': SERVICE_API_KEY,
        'X-Service-Name': 'care-home-shift-platform',
      },
    }
  );

  assert(staffResponse.ok, `Failed to fetch staff: ${staffResponse.status}`);

  const staffData = await staffResponse.json();
  assert(staffData.success === true, 'Expected successful staff fetch');
  assert(Array.isArray(staffData.data), 'Expected staff data array');

  log(`  Found ${staffData.count} matching staff for shift "${shift.jobTitle}"`, 'info');
}

// ==============================================================================
// TEST RUNNER
// ==============================================================================

async function runAllTests() {
  console.log('\n========================================');
  console.log('API INTEGRATION TEST SUITE');
  console.log('========================================\n');

  log('Testing Keris API URL: ' + KERIS_API_URL, 'info');
  log('Testing Care Home API URL: ' + CARE_HOME_API_URL, 'info');
  log('Using API Key: ' + SERVICE_API_KEY.substring(0, 20) + '...', 'info');
  console.log('');

  // Suite 1: Authentication
  log('Suite 1: Keris API Authentication', 'info');
  await runTest('Keris: Valid API key authentication', testKerisAuthenticationSuccess);
  await runTest('Keris: Missing API key (401)', testKerisAuthenticationMissingKey);
  await runTest('Keris: Invalid API key (403)', testKerisAuthenticationInvalidKey);
  console.log('');

  // Suite 2: Keris Staff Endpoints
  log('Suite 2: Keris Staff API Endpoints', 'info');
  await runTest('Keris: Fetch staff list', testKerisStaffFetch);
  await runTest('Keris: Filter staff by role', testKerisStaffFilterByRole);
  await runTest('Keris: Filter staff by availability', testKerisStaffFilterByAvailability);
  await runTest('Keris: Fetch staff by ID', testKerisStaffById);
  console.log('');

  // Suite 3: Care Home Endpoints
  log('Suite 3: Care Home API Endpoints', 'info');
  await runTest('Care Home: Fetch shifts list', testCareHomeShiftsFetch);
  await runTest('Care Home: Filter shifts by status', testCareHomeShiftsFilterByStatus);
  await runTest('Care Home: Fetch care homes list', testCareHomeCareHomesFetch);
  console.log('');

  // Suite 4: Integration Scenarios
  log('Suite 4: Integration Scenarios', 'info');
  await runTest('Integration: Staff matching flow', testStaffMatchingIntegration);
  console.log('');

  // Print summary
  console.log('========================================');
  console.log('TEST SUMMARY');
  console.log('========================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  log(`Total: ${total}`, 'info');
  log(`Passed: ${passed}`, 'success');
  if (failed > 0) {
    log(`Failed: ${failed}`, 'error');
  }

  const avgDuration = Math.round(
    results.reduce((sum, r) => sum + r.duration, 0) / results.length
  );
  log(`Average duration: ${avgDuration}ms`, 'info');

  console.log('');

  if (failed > 0) {
    log('FAILED TESTS:', 'error');
    results.filter(r => !r.passed).forEach(r => {
      log(`  - ${r.name}: ${r.error}`, 'error');
    });
    console.log('');
    process.exit(1);
  } else {
    log('ALL TESTS PASSED!', 'success');
    console.log('');
    process.exit(0);
  }
}

// Run the test suite
runAllTests().catch((error) => {
  log('Fatal error running tests:', 'error');
  console.error(error);
  process.exit(1);
});
