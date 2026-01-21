
// Verification of the fix

// Mock Controller Response
const controllerResponse = {
    data: [
        { name: 'User 1', role: 'Admin' },
        { name: 'User 2', role: 'User' }
    ],
    pagination: { total: 2, page: 1, limit: 10 }
};

// Mock API Client Response (api.js wrapper)
const apiResponse = {
    data: controllerResponse,
    status: 200,
    ok: true
};

// Fixed AdminDashboard Logic
function testFixedLogic(res) {
    console.log('--- Fixed Logic ---');
    console.log('Input res:', JSON.stringify(res, null, 2));

    // The fixed logic:
    const responseBody = res.data || {};
    const usersList = Array.isArray(responseBody) ? responseBody : (responseBody.data || []);

    console.log('usersList derived:', JSON.stringify(usersList, null, 2));

    if (usersList.length === 2 && usersList[0].name === 'User 1') {
        console.log('PASS: Users list correctly populated.');
    } else {
        console.log('FAIL: Users list is still empty or incorrect.');
    }
}

testFixedLogic(apiResponse);
