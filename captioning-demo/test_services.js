#!/usr/bin/env node

/**
 * Test script to verify all services are working
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5050';
const TRANSLITERATION_URL = 'http://localhost:8000';

async function testBackend() {
    console.log('🔍 Testing Backend Service...');
    try {
        const response = await fetch(`${BACKEND_URL}/`);
        const data = await response.json();
        console.log('✅ Backend:', data.status);
        return true;
    } catch (error) {
        console.log('❌ Backend failed:', error.message);
        return false;
    }
}

async function testTransliteration() {
    console.log('🔍 Testing Transliteration Service...');
    try {
        const response = await fetch(`${TRANSLITERATION_URL}/`);
        const data = await response.json();
        console.log('✅ Transliteration:', data.status);
        
        // Test actual transliteration
        const testResponse = await fetch(`${TRANSLITERATION_URL}/test`);
        const testData = await testResponse.json();
        console.log('✅ Transliteration Test:', testData.status);
        if (testData.test_input && testData.test_output) {
            console.log(`   Input: "${testData.test_input}"`);
            console.log(`   Output: "${testData.test_output}"`);
        }
        return true;
    } catch (error) {
        console.log('❌ Transliteration failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Testing Hinglish Captioning Services...\n');
    
    const backendOk = await testBackend();
    const transliterationOk = await testTransliteration();
    
    console.log('\n📊 Test Results:');
    console.log(`Backend Service: ${backendOk ? '✅ Working' : '❌ Failed'}`);
    console.log(`Transliteration Service: ${transliterationOk ? '✅ Working' : '❌ Failed'}`);
    
    if (backendOk && transliterationOk) {
        console.log('\n🎉 All services are working! You can now use the application.');
        console.log('🌐 Open http://localhost:3000 in your browser');
    } else {
        console.log('\n⚠️ Some services are not working. Please check the setup.');
        console.log('📖 See README.md for troubleshooting guide');
    }
}

runTests().catch(console.error);
