// Test Complete Auth Flow - Verify signup, signin, and dashboard redirect
// Run with: node test-complete-auth-flow.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteAuthFlow() {
    console.log('🚀 Testing Complete Authentication Flow...\n');

    try {
        // Test 1: Create a new user account
        console.log('1️⃣ Testing user signup...');
        const testEmail = `testuser${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        console.log(`   Creating account with: ${testEmail}`);
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User',
                    user_type: 'student',
                    curriculum: 'igcse',
                    grade: 'Year 10',
                    subjects: ['Mathematics', 'Physics', 'Chemistry'],
                    preferences: {
                        language: 'en',
                        notifications: true,
                        darkMode: false,
                        theme: 'light'
                    }
                }
            }
        });
        
        if (signupError) {
            console.log('❌ Signup failed:', signupError.message);
            return;
        }
        
        console.log('✅ Signup successful!');
        console.log('   User ID:', signupData.user?.id);
        console.log('   Email:', signupData.user?.email);
        console.log('   Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');
        
        // Test 2: Check if user profile was created
        console.log('\n2️⃣ Checking if user profile was created...');
        
        // Wait a moment for the trigger to execute
        console.log('   Waiting for trigger function to execute...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signupData.user.id)
            .single();
        
        if (profileError) {
            console.log('❌ Profile not found:', profileError.message);
            console.log('   🔍 This confirms the trigger function is NOT working');
            console.log('   🚨 You MUST run the fix-trigger-final.sql script!');
            
            console.log('\n📋 Current Status:');
            console.log('   ✅ User Account: Created in auth.users');
            console.log('   ❌ User Profile: Missing from public.users');
            console.log('   ❌ Dashboard Redirect: Will fail');
            
            return;
        }
        
        console.log('✅ Profile created successfully!');
        console.log('   Profile data:', {
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name,
            user_type: profileData.user_type,
            curriculum: profileData.curriculum,
            grade: profileData.grade
        });
        
        // Test 3: Sign out
        console.log('\n3️⃣ Testing sign out...');
        const { error: signoutError } = await supabase.auth.signOut();
        
        if (signoutError) {
            console.log('❌ Sign out failed:', signoutError.message);
        } else {
            console.log('✅ Sign out successful');
        }
        
        // Test 4: Sign in with the new account
        console.log('\n4️⃣ Testing sign in with new account...');
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (signinError) {
            console.log('❌ Sign in failed:', signinError.message);
            return;
        }
        
        console.log('✅ Sign in successful!');
        console.log('   User ID:', signinData.user?.id);
        console.log('   Email:', signinData.user?.email);
        
        // Test 5: Verify profile access after signin
        console.log('\n5️⃣ Verifying profile access after signin...');
        const { data: profileAfterSignin, error: profileAfterError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signinData.user.id)
            .single();
        
        if (profileAfterError) {
            console.log('❌ Profile access failed after signin:', profileAfterError.message);
        } else {
            console.log('✅ Profile access successful after signin');
            console.log('   Full name:', profileAfterSignin.full_name);
            console.log('   User type:', profileAfterSignin.user_type);
        }
        
        // Test 6: Simulate dashboard redirect logic
        console.log('\n6️⃣ Simulating dashboard redirect logic...');
        
        // This is what LoginPage would do after successful signin
        const user = {
            id: profileAfterSignin.id,
            name: profileAfterSignin.full_name || profileAfterSignin.email?.split('@')[0] || 'User',
            email: profileAfterSignin.email || '',
            type: profileAfterSignin.user_type || 'student',
            curriculum: profileAfterSignin.curriculum || 'igcse',
            grade: profileAfterSignin.grade || 'Year 10',
            subjects: profileAfterSignin.subjects || ['Mathematics', 'Physics', 'Chemistry'],
            preferences: {
                language: 'en',
                notifications: profileAfterSignin.preferences?.notifications || true,
                darkMode: profileAfterSignin.preferences?.darkMode || false,
                theme: profileAfterSignin.preferences?.theme || 'light',
                autoPlayFlashcards: profileAfterSignin.preferences?.autoPlayFlashcards || true,
                showHints: profileAfterSignin.preferences?.showHints || true,
                soundEffects: profileAfterSignin.preferences?.soundEffects || true,
                studyReminders: profileAfterSignin.preferences?.studyReminders || true,
                dailyGoal: profileAfterSignin.preferences?.dailyGoal || 60
            }
        };
        
        console.log('✅ User object created for dashboard:');
        console.log('   Name:', user.name);
        console.log('   Type:', user.type);
        console.log('   Curriculum:', user.curriculum);
        console.log('   Grade:', user.grade);
        
        console.log('\n🎉 COMPLETE AUTH FLOW SUCCESSFUL!');
        console.log('\n📋 Summary:');
        console.log('   ✅ User Signup: Working');
        console.log('   ✅ Profile Creation: Working (trigger function working)');
        console.log('   ✅ User Signin: Working');
        console.log('   ✅ Profile Access: Working');
        console.log('   ✅ Dashboard Redirect: Ready!');
        
        console.log('\n🚀 Your app will now:');
        console.log('   1. ✅ Allow users to sign up');
        console.log('   2. ✅ Automatically create profiles');
        console.log('   3. ✅ Allow users to sign in');
        console.log('   4. ✅ Load user data');
        console.log('   5. ✅ Redirect to dashboard');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testCompleteAuthFlow();
