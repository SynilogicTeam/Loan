const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function finalVerification() {
    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    function test(name, passed, details = '') {
        results.total++;
        if (passed) results.passed++;
        else results.failed++;
        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${name}${details ? ': ' + details : ''}`);
    }

    try {
        console.log('🎯 FINAL VERIFICATION TEST\n');
        console.log('='.repeat(60) + '\n');

        // Test 1: Super Admin Login
        console.log('1️⃣ Testing Super Admin Login...');
        try {
            const res = await axios.post(`${BASE_URL}/auth/super-admin/login`, {
                email: 'super@admin.com',
                password: '123456'
            });
            test('Super Admin Login', true, `Token received`);
            var superAdminToken = res.data.token;
        } catch (error) {
            test('Super Admin Login', false, error.response?.data?.message || error.message);
        }

        // Test 2: Admin Login
        console.log('\n2️⃣ Testing Admin Login...');
        try {
            const res = await axios.post(`${BASE_URL}/admin/login`, {
                email: 'admin@samiti.com',
                password: '123456'
            });
            test('Admin Login', true, `Permissions: ${res.data.permissions?.length || 0}`);
            var adminToken = res.data.token;
            var communityId = res.data.communityId;
        } catch (error) {
            test('Admin Login', false, error.response?.data?.message || error.message);
        }

        // Test 3: Member Login
        console.log('\n3️⃣ Testing Member Login...');
        try {
            const res = await axios.post(`${BASE_URL}/members/login`, {
                email: 'ramesh@gmail.com',
                password: '123456'
            });
            test('Member Login', true, `Member: ${res.data.name}`);
            var memberToken = res.data.token;
        } catch (error) {
            test('Member Login', false, error.response?.data?.message || error.message);
        }

        const adminConfig = { headers: { Authorization: `Bearer ${adminToken}` } };
        const memberConfig = { headers: { Authorization: `Bearer ${memberToken}` } };
        const superAdminConfig = { headers: { Authorization: `Bearer ${superAdminToken}` } };

        // Test 4: Admin Dashboard
        console.log('\n4️⃣ Testing Admin Features...');
        try {
            const res = await axios.get(`${BASE_URL}/admin/members`, adminConfig);
            test('Get Members', true, `Found ${res.data.length} members`);
        } catch (error) {
            test('Get Members', false, error.response?.data?.message || error.message);
        }

        try {
            const res = await axios.get(`${BASE_URL}/sessions/active`, adminConfig);
            test('Get Active Session', true, `Session: ${res.data.name}`);
        } catch (error) {
            test('Get Active Session', false, error.response?.data?.message || error.message);
        }

        try {
            const res = await axios.get(`${BASE_URL}/admin/contributions`, adminConfig);
            test('Get Contributions', true, `Found ${res.data.length} contributions`);
        } catch (error) {
            test('Get Contributions', false, error.response?.data?.message || error.message);
        }

        try {
            const res = await axios.get(`${BASE_URL}/admin/loans`, adminConfig);
            test('Get Loans', true, `Found ${res.data.length} loans`);
        } catch (error) {
            test('Get Loans', false, error.response?.data?.message || error.message);
        }

        // Test 5: Member Features
        console.log('\n5️⃣ Testing Member Features...');
        try {
            const res = await axios.get(`${BASE_URL}/members/profile`, memberConfig);
            test('Get Member Profile', true, `Name: ${res.data.name}`);
        } catch (error) {
            test('Get Member Profile', false, error.response?.data?.message || error.message);
        }

        try {
            const res = await axios.post(`${BASE_URL}/payments/create-order`, {
                amount: 1000,
                type: 'CONTRIBUTION'
            }, memberConfig);
            test('Create Payment Order', true, `Order created`);
        } catch (error) {
            test('Create Payment Order', false, error.response?.data?.message || error.message);
        }

        // Test 6: Super Admin Features
        if (superAdminToken) {
            console.log('\n6️⃣ Testing Super Admin Features...');
            try {
                const res = await axios.get(`${BASE_URL}/communities`, superAdminConfig);
                test('Get All Communities', true, `Found ${res.data.length} communities`);
            } catch (error) {
                test('Get All Communities', false, error.response?.data?.message || error.message);
            }

            try {
                const res = await axios.get(`${BASE_URL}/admin`, superAdminConfig);
                test('Get All Admins', true, `Found ${res.data.length} admins`);
            } catch (error) {
                test('Get All Admins', false, error.response?.data?.message || error.message);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.total}`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);

        if (results.passed === results.total) {
            console.log('\n🎉 ALL TESTS PASSED! PRODUCTION READY! 🎉');
        } else {
            console.log(`\n⚠️ ${results.failed} tests failed. Review needed.`);
        }

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
    }
}

finalVerification();
