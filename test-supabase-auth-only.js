// Test Supabase Auth Only - Verify the simplified AuthService works
// Run with: node test-supabase-auth-only.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseAuthOnly() {
    console.log('🔍 Testing Supabase Auth Only...\n');

    try {
        // Test 1: Check current auth status
        console.log('1️⃣ Checking current auth status...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log('❌ Auth error:', authError.message);
        } else if (user) {
            console.log('✅ User already authenticated:', user.email);
            console.log('   User ID:', user.id);
            console.log('   Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
        } else {
            console.log('ℹ️  No user currently authenticated');
        }

        // Test 2: Try to sign in with existing user
        console.log('\n2️⃣ Testing signin with existing user...');
        const testEmail = 'testuser123@gmail.com';
        const testPassword = 'TestPassword123!';
        
        console.log(`   Trying to sign in with: ${testEmail}`);
        
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (signinError) {
            console.log('❌ Signin error:', signinError.message);
            
            if (signinError.message.includes('Invalid login credentials')) {
                console.log('   🔍 This suggests wrong password or user doesn\'t exist');
            } else if (signinError.message.includes('Email not confirmed')) {
                console.log('   🔍 This suggests email needs confirmation');
            } else if (signinError.message.includes('User not found')) {
                console.log('   🔍 This suggests user doesn\'t exist in auth.users');
            }
        } else {
            console.log('✅ Signin successful!');
            console.log('   User ID:', signinData.user?.id);
            console.log('   Email:', signinData.user?.email);
            console.log('   Email confirmed:', signinData.user?.email_confirmed_at ? 'Yes' : 'No');
            
            // Test 3: Check if profile exists
            console.log('\n3️⃣ Checking if user profile exists...');
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', signinData.user.id)
                .single();
            
            if (profileError) {
                console.log('❌ Profile not found:', profileError.message);
                console.log('   This confirms the trigger function is not working');
                console.log('   You MUST run the fix-trigger-final.sql script!');
            } else {
                console.log('✅ Profile found!');
                console.log('   Profile data:', profileData);
            }
        }

        // Test 4: Check users table
        console.log('\n4️⃣ Checking users table...');
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);
        
        if (usersError) {
            console.log('❌ Users table error:', usersError.message);
        } else {
            console.log(`✅ Found ${usersData.length} users in table`);
            if (usersData.length > 0) {
                console.log('   First user:', {
                    id: usersData[0].id,
                    email: usersData[0].email,
                    full_name: usersData[0].full_name
                });
            }
        }

        console.log('\n🎯 Supabase Auth Only Test Complete!');
        console.log('\n📋 Summary:');
        console.log('- If signin succeeds: Supabase Auth is working');
        console.log('- If profile not found: Trigger function is broken (run SQL script)');
        console.log('- If "email not confirmed": Check Supabase email settings');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testSupabaseAuthOnly();
