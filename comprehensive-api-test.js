const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test credentials
const SUPER_ADMIN = { email: 'super@admin.com', password: '123456' };
const ADMIN = { email: 'admin@samiti.com', password: '123456' };
const MEMBER = { email: 'ramesh@gmail.com', password: '123456' };

let tokens = {};
let testData = {};

// Color codes for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60) + '\n');
}

function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${icon} ${name}`, color);
    if (details) log(`   ${details}`, 'yellow');
}

async function testBackendAPIs() {
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    function recordTest(name, passed, details = '') {
        results.total++;
        if (passed) results.passed++;
        else results.failed++;
        results.tests.push({ name, passed, details });
        logTest(name, passed, details);
    }

    try {
        logSection('🧪 COMPREHENSIVE BACKEND API TESTING');

        // ==================== AUTHENTICATION TESTS ====================
        logSection('1️⃣ AUTHENTICATION TESTS');

        // Test 1: Super Admin Login
        try {
            const res = await axios.post(`${BASE_URL}/auth/super-admin/login`, SUPER_ADMIN);
            tokens.superAdmin = res.data.token;
            recordTest('Super Admin Login', true, `Token: ${res.data.token.substring(0, 20)}...`);
        } catch (error) {
            recordTest('Super Admin Login', false, error.response?.data?.message || error.message);
        }

        // Test 2: Admin Login
        try {
            const res = await axios.post(`${BASE_URL}/admin/login`, ADMIN);
            tokens.admin = res.data.token;
            testData.adminId = res.data._id;
            testData.communityId = res.data.communityId;
            recordTest('Admin Login', true, `Permissions: ${res.data.permissions?.length || 0}`);
        } catch (error) {
            recordTest('Admin Login', false, error.response?.data?.message || error.message);
        }

        // Test 3: Member Login
        try {
            const res = await axios.post(`${BASE_URL}/members/login`, MEMBER);
            tokens.member = res.data.token;
            testData.memberId = res.data._id;
            recordTest('Member Login', true, `Member: ${res.data.name}`);
        } catch (error) {
            recordTest('Member Login', false, error.response?.data?.message || error.message);
        }

        // ==================== COMMUNITY MANAGEMENT ====================
        logSection('2️⃣ COMMUNITY MANAGEMENT');

        const superAdminConfig = { headers: { Authorization: `Bearer ${tokens.superAdmin}` } };
        const adminConfig = { headers: { Authorization: `Bearer ${tokens.admin}` } };
        const memberConfig = { headers: { Authorization: `Bearer ${tokens.member}` } };

        // Test 4: Get All Communities (Super Admin)
        try {
            const res = await axios.get(`${BASE_URL}/communities`, superAdminConfig);
            recordTest('Get All Communities', true, `Found ${res.data.length} communities`);
        } catch (error) {
            recordTest('Get All Communities', false, error.response?.data?.message || error.message);
        }

        // Test 5: Get Community Details
        try {
            const res = await axios.get(`${BASE_URL}/communities/${testData.communityId}`, adminConfig);
            recordTest('Get Community Details', true, `Name: ${res.data.name}`);
        } catch (error) {
            recordTest('Get Community Details', false, error.response?.data?.message || error.message);
        }

        // ==================== SESSION MANAGEMENT ====================
        logSection('3️⃣ SESSION MANAGEMENT');

        // Test 6: Get Active Session
        try {
            const res = await axios.get(`${BASE_URL}/sessions/active`, adminConfig);
            testData.sessionId = res.data._id;
            recordTest('Get Active Session', true, `Session: ${res.data.name}`);
        } catch (error) {
            recordTest('Get Active Session', false, error.response?.data?.message || error.message);
        }

        // Test 7: Get Session Details
        if (testData.sessionId) {
            try {
                const res = await axios.get(`${BASE_URL}/sessions/${testData.sessionId}`, adminConfig);
                recordTest('Get Session Details', true, `Balance: ₹${res.data.closingBalance}`);
            } catch (error) {
                recordTest('Get Session Details', false, error.response?.data?.message || error.message);
            }
        }

        // ==================== MEMBER MANAGEMENT ====================
        logSection('4️⃣ MEMBER MANAGEMENT');

        // Test 8: Get All Members (Admin)
        try {
            const res = await axios.get(`${BASE_URL}/admin/members`, adminConfig);
            if (res.data.length > 0) testData.testMemberId = res.data[0]._id;
            recordTest('Get All Members', true, `Found ${res.data.length} members`);
        } catch (error) {
            recordTest('Get All Members', false, error.response?.data?.message || error.message);
        }

        // Test 9: Get Member Profile (Member)
        try {
            const res = await axios.get(`${BASE_URL}/members/profile`, memberConfig);
            recordTest('Get Member Profile', true, `Name: ${res.data.name}`);
        } catch (error) {
            recordTest('Get Member Profile', false, error.response?.data?.message || error.message);
        }

        // ==================== CONTRIBUTION MANAGEMENT ====================
        logSection('5️⃣ CONTRIBUTION MANAGEMENT');

        // Test 10: Get All Contributions (Admin)
        try {
            const res = await axios.get(`${BASE_URL}/admin/contributions`, adminConfig);
            recordTest('Get All Contributions (Admin)', true, `Found ${res.data.length} contributions`);
        } catch (error) {
            recordTest('Get All Contributions (Admin)', false, error.response?.data?.message || error.message);
        }

        // Test 11: Get Member Contributions
        try {
            const res = await axios.get(`${BASE_URL}/contributions/my-contributions`, memberConfig);
            recordTest('Get Member Contributions', true, `Found ${res.data.length} contributions`);
        } catch (error) {
            recordTest('Get Member Contributions', false, error.response?.data?.message || error.message);
        }

        // ==================== LOAN MANAGEMENT ====================
        logSection('6️⃣ LOAN MANAGEMENT');

        // Test 12: Get All Loans (Admin)
        try {
            const res = await axios.get(`${BASE_URL}/admin/loans`, adminConfig);
            if (res.data.length > 0) testData.loanId = res.data[0]._id;
            recordTest('Get All Loans (Admin)', true, `Found ${res.data.length} loans`);
        } catch (error) {
            recordTest('Get All Loans (Admin)', false, error.response?.data?.message || error.message);
        }

        // Test 13: Get Member Loans
        try {
            const res = await axios.get(`${BASE_URL}/loans/my-loans`, memberConfig);
            recordTest('Get Member Loans', true, `Found ${res.data.length} loans`);
        } catch (error) {
            recordTest('Get Member Loans', false, error.response?.data?.message || error.message);
        }

        // ==================== EMI MANAGEMENT ====================
        logSection('7️⃣ EMI MANAGEMENT');

        // Test 14: Get EMI Schedule
        if (testData.loanId) {
            try {
                const res = await axios.get(`${BASE_URL}/loans/${testData.loanId}/emis`, memberConfig);
                recordTest('Get EMI Schedule', true, `Found ${res.data.length} EMIs`);
            } catch (error) {
                recordTest('Get EMI Schedule', false, error.response?.data?.message || error.message);
            }
        }

        // ==================== WITHDRAWAL MANAGEMENT ====================
        logSection('8️⃣ WITHDRAWAL MANAGEMENT');

        // Test 15: Get Withdrawal Requests (Admin)
        try {
            const res = await axios.get(`${BASE_URL}/withdrawals`, adminConfig);
            recordTest('Get Withdrawal Requests', true, `Found ${res.data.length} requests`);
        } catch (error) {
            recordTest('Get Withdrawal Requests', false, error.response?.data?.message || error.message);
        }

        // Test 16: Check Withdrawal Eligibility (Member)
        try {
            const res = await axios.get(`${BASE_URL}/withdrawals/eligibility`, memberConfig);
            recordTest('Check Withdrawal Eligibility', true, `Eligible: ${res.data.isEligible}`);
        } catch (error) {
            recordTest('Check Withdrawal Eligibility', false, error.response?.data?.message || error.message);
        }

        // ==================== DASHBOARD & ANALYTICS ====================
        logSection('9️⃣ DASHBOARD & ANALYTICS');

        // Test 17: Get Admin Dashboard
        try {
            const res = await axios.get(`${BASE_URL}/dashboard/admin`, adminConfig);
            recordTest('Get Admin Dashboard', true, `Total Members: ${res.data.totalMembers || 0}`);
        } catch (error) {
            recordTest('Get Admin Dashboard', false, error.response?.data?.message || error.message);
        }

        // Test 18: Get Member Dashboard
        try {
            const res = await axios.get(`${BASE_URL}/dashboard/member`, memberConfig);
            recordTest('Get Member Dashboard', true, `Trust Score: ${res.data.trustScore || 0}`);
        } catch (error) {
            recordTest('Get Member Dashboard', false, error.response?.data?.message || error.message);
        }

        // ==================== PAYMENT INTEGRATION ====================
        logSection('🔟 PAYMENT INTEGRATION');

        // Test 19: Create Payment Order
        try {
            const res = await axios.post(`${BASE_URL}/payments/create-order`, {
                amount: 1000,
                type: 'CONTRIBUTION'
            }, memberConfig);
            recordTest('Create Payment Order', true, `Order ID: ${res.data.orderId || 'Mock'}`);
        } catch (error) {
            recordTest('Create Payment Order', false, error.response?.data?.message || error.message);
        }

        // ==================== REPORTS ====================
        logSection('1️⃣1️⃣ REPORTS & EXPORTS');

        // Test 20: Get Financial Report
        try {
            const res = await axios.get(`${BASE_URL}/export/financial-report`, adminConfig);
            recordTest('Get Financial Report', true, 'Report generated');
        } catch (error) {
            recordTest('Get Financial Report', false, error.response?.data?.message || error.message);
        }

        // ==================== PLATFORM MANAGEMENT ====================
        logSection('1️⃣2️⃣ PLATFORM MANAGEMENT (Super Admin)');

        // Test 21: Get Platform Statistics
        try {
            const res = await axios.get(`${BASE_URL}/platform/stats`, superAdminConfig);
            recordTest('Get Platform Statistics', true, `Total Communities: ${res.data.totalCommunities || 0}`);
        } catch (error) {
            recordTest('Get Platform Statistics', false, error.response?.data?.message || error.message);
        }

        // Test 22: Get All Admins
        try {
            const res = await axios.get(`${BASE_URL}/admin`, superAdminConfig);
            recordTest('Get All Admins', true, `Found ${res.data.length} admins`);
        } catch (error) {
            recordTest('Get All Admins', false, error.response?.data?.message || error.message);
        }

        // ==================== FINAL SUMMARY ====================
        logSection('📊 TEST SUMMARY');

        log(`Total Tests: ${results.total}`, 'cyan');
        log(`Passed: ${results.passed}`, 'green');
        log(`Failed: ${results.failed}`, 'red');
        log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`, 'yellow');

        if (results.failed > 0) {
            log('\n❌ Failed Tests:', 'red');
            results.tests.filter(t => !t.passed).forEach(t => {
                log(`   - ${t.name}: ${t.details}`, 'red');
            });
        }

        return results;

    } catch (error) {
        log(`\n❌ Fatal Error: ${error.message}`, 'red');
        return results;
    }
}

// Run tests
testBackendAPIs().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
});
