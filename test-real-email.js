// Test with Real Email Format
// Run with: node test-real-email.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealEmail() {
    console.log('🔍 Testing with Real Email Format...\n');

    try {
        // Test 1: Create user with real email format
        console.log('1️⃣ Creating user with real email format...');
        
        const testEmail = 'testuser123@gmail.com';
        const testPassword = 'TestPassword123!';
        
        console.log(`   Email: ${testEmail}`);
        console.log(`   Password: ${testPassword}`);
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User 123',
                    user_type: 'student',
                    curriculum: 'igcse',
                    grade: 'Year 10'
                }
            }
        });
        
        if (signupError) {
            console.log('❌ Signup error:', signupError.message);
            
            if (signupError.message.includes('already registered')) {
                console.log('✅ User already exists - this is good!');
                console.log('   Now trying to sign in...');
                
                // Try to sign in
                const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword
                });
                
                if (signinError) {
                    console.log('❌ Signin error:', signinError.message);
                    
                    if (signinError.message.includes('Email not confirmed')) {
                        console.log('\n🔍 ISSUE IDENTIFIED: Email confirmation required!');
                        console.log('   This means users must confirm their email before signing in.');
                        console.log('   Check your Supabase Authentication settings.');
                    }
                } else {
                    console.log('✅ Signin successful!');
                    console.log('   User ID:', signinData.user?.id);
                    console.log('   Email confirmed:', signinData.user?.email_confirmed_at ? 'Yes' : 'No');
                }
            }
        } else {
            console.log('✅ Signup successful!');
            console.log('   User ID:', signupData.user?.id);
            console.log('   Email:', signupData.user?.email);
            console.log('   Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');
            
            if (!signupData.user?.email_confirmed_at) {
                console.log('\n⚠️  IMPORTANT: Email not confirmed!');
                console.log('   User must confirm email before they can sign in.');
                console.log('   Check your email for confirmation link.');
            }
            
            // Wait for trigger to execute
            console.log('\n2️⃣ Waiting for trigger to create profile...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if profile was created
            console.log('\n3️⃣ Checking if user profile was created...');
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', signupData.user.id)
                .single();
            
            if (profileError) {
                console.log('❌ Profile not found:', profileError.message);
                console.log('   This suggests the trigger function is still not working');
            } else {
                console.log('✅ Profile created successfully!');
                console.log('   Profile data:', profileData);
                console.log('   This confirms the trigger function is working!');
            }
        }

        console.log('\n🎯 Real Email Test Complete!');
        console.log('\n📋 Summary:');
        console.log('- If signup succeeds: Email format is valid');
        console.log('- If "already registered": User exists, try signin');
        console.log('- If "email not confirmed": Check Supabase email settings');
        console.log('- If profile is created: Trigger function is working');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testRealEmail();
