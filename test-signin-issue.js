// Test Signin Issue - Diagnose why signin is failing
// Run with: node test-signin-issue.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSigninIssue() {
    console.log('🔍 Testing Signin Issue...\n');

    try {
        // Test 1: Check if we can see users in the table
        console.log('1️⃣ Checking users table...');
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

        // Test 2: Try to sign in with a known user
        console.log('\n2️⃣ Testing signin with existing user...');
        
        // Use the email from the first user we found, or a test email
        const testEmail = usersData && usersData.length > 0 ? usersData[0].email : 'testuser123@gmail.com';
        const testPassword = 'TestPassword123!';
        
        console.log(`   Trying to sign in with: ${testEmail}`);
        
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (signinError) {
            console.log('❌ Signin error:', signinError.message);
            
            // Check what type of error this is
            if (signinError.message.includes('Invalid login credentials')) {
                console.log('   🔍 This suggests the password is wrong or user doesn\'t exist');
            } else if (signinError.message.includes('Email not confirmed')) {
                console.log('   🔍 This suggests the email needs confirmation');
            } else if (signinError.message.includes('User not found')) {
                console.log('   🔍 This suggests the user doesn\'t exist in auth.users');
            }
        } else {
            console.log('✅ Signin successful!');
            console.log('   User ID:', signinData.user?.id);
            console.log('   Email:', signinData.user?.email);
        }

        // Test 3: Check if the user exists in auth.users
        console.log('\n3️⃣ Checking auth status...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log('❌ Auth error:', authError.message);
        } else if (user) {
            console.log('✅ User authenticated:', user.email);
            console.log('   User ID:', user.id);
            console.log('   Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
        } else {
            console.log('ℹ️  No user currently authenticated');
        }

        // Test 4: Try to create a completely new user to see the full flow
        console.log('\n4️⃣ Testing complete signup flow...');
        const newTestEmail = `test${Date.now()}@example.com`;
        const newTestPassword = 'TestPassword123!';
        
        console.log(`   Creating new user: ${newTestEmail}`);
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: newTestEmail,
            password: newTestPassword,
            options: {
                data: {
                    full_name: 'New Test User',
                    user_type: 'student',
                    curriculum: 'igcse',
                    grade: 'Year 10'
                }
            }
        });
        
        if (signupError) {
            console.log('❌ Signup error:', signupError.message);
        } else {
            console.log('✅ Signup successful!');
            console.log('   User ID:', signupData.user?.id);
            console.log('   Email:', signupData.user?.email);
            console.log('   Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');
            
            // Wait a moment for the trigger to execute
            console.log('\n   Waiting for trigger to create profile...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if profile was created
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', signupData.user.id)
                .single();
            
            if (profileError) {
                console.log('❌ Profile not found:', profileError.message);
            } else {
                console.log('✅ Profile created successfully!');
                console.log('   Profile data:', profileData);
            }
        }

        console.log('\n🎯 Signin Issue Test Complete!');
        console.log('\n📋 Analysis:');
        console.log('- If signup works but signin fails: Password or email confirmation issue');
        console.log('- If profile is created: Trigger function is working');
        console.log('- Check if email confirmation is required in Supabase settings');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testSigninIssue();
