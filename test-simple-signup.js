// Test simplified signup without complex metadata
// Run with: node test-simple-signup.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleSignup() {
    console.log('🔐 Testing Simple Signup...\n');

    try {
        // Test with a more standard email format
        console.log('1️⃣ Testing signup with standard email...');
        
        const testEmail = 'testuser123@gmail.com';
        const testPassword = 'TestPassword123!';
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User',
                    user_type: 'student',
                    curriculum: 'igcse',
                    grade: 'Year 10'
                }
            }
        });

        if (signupError) {
            console.log('❌ Signup error:', signupError.message);
            
            // Check for specific error types
            if (signupError.message.includes('already registered')) {
                console.log('✅ Signup system working - email already exists');
                
                // Try to sign in with existing account
                console.log('\n2️⃣ Trying to sign in with existing account...');
                const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword
                });
                
                if (signinError) {
                    console.log('❌ Signin error:', signinError.message);
                } else {
                    console.log('✅ Signin successful!');
                    console.log('   User ID:', signinData.user?.id);
                    
                    // Test if we can access the user profile
                    console.log('\n3️⃣ Testing user profile access...');
                    const { data: profileData, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', signinData.user.id)
                        .single();
                    
                    if (profileError) {
                        console.log('❌ Profile access error:', signinError.message);
                    } else {
                        console.log('✅ Profile access successful!');
                        console.log('   Profile data:', profileData);
                    }
                }
            } else if (signupError.message.includes('invalid')) {
                console.log('⚠️  Email validation issue - checking Supabase settings');
                console.log('   This might be due to strict email validation in Supabase');
            }
        } else {
            console.log('✅ Signup successful!');
            console.log('   User ID:', signupData.user?.id);
            console.log('   Email:', signupData.user?.email);
            
            // Wait for trigger to execute
            console.log('\n2️⃣ Waiting for trigger to create user profile...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if user profile was created
            console.log('\n3️⃣ Checking if user profile was created...');
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', signupData.user.id)
                .single();
            
            if (profileError) {
                console.log('❌ Profile not found:', profileError.message);
                console.log('   This suggests the trigger function is not working');
            } else {
                console.log('✅ User profile created successfully!');
                console.log('   Profile data:', profileData);
            }
        }

        console.log('\n🎯 Simple Signup Test Complete!');
        console.log('\n📋 Analysis:');
        console.log('- If signup succeeds: Trigger function is working');
        console.log('- If "already registered": System is working, try signin');
        console.log('- If "invalid email": Check Supabase email validation settings');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testSimpleSignup(); 