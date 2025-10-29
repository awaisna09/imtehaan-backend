// Test Dashboard Redirect - Verify authentication flow works correctly
// Run with: node test-dashboard-redirect.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardRedirect() {
    console.log('🎯 Testing Dashboard Redirect Flow...\n');

    try {
        // Test 1: Check if we can sign in
        console.log('1️⃣ Testing signin...');
        const testEmail = 'testuser123@gmail.com';
        const testPassword = 'TestPassword123!';
        
        console.log(`   Attempting signin with: ${testEmail}`);
        
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (signinError) {
            console.log('❌ Signin failed:', signinError.message);
            
            if (signinError.message.includes('Invalid login credentials')) {
                console.log('   🔍 This suggests the user doesn\'t exist or wrong password');
                console.log('   💡 You need to create a user first or check credentials');
            } else if (signinError.message.includes('Email not confirmed')) {
                console.log('   🔍 Email needs confirmation - check Supabase settings');
            }
            
            console.log('\n📋 To test dashboard redirect, you need to:');
            console.log('   1. Create a user account first');
            console.log('   2. Or use existing credentials');
            console.log('   3. Make sure the trigger function is working');
            
            return;
        }
        
        console.log('✅ Signin successful!');
        console.log('   User ID:', signinData.user?.id);
        console.log('   Email:', signinData.user?.email);
        
        // Test 2: Check if profile exists
        console.log('\n2️⃣ Checking user profile...');
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signinData.user.id)
            .single();
        
        if (profileError) {
            console.log('❌ Profile not found:', profileError.message);
            console.log('   🔍 This means the trigger function is not working');
            console.log('   🚨 You MUST run the fix-trigger-final.sql script!');
            
            console.log('\n📋 Current Status:');
            console.log('   ✅ Supabase Auth: Working');
            console.log('   ❌ User Profile: Missing');
            console.log('   ❌ Dashboard Redirect: Will fail');
            
        } else {
            console.log('✅ Profile found!');
            console.log('   Profile data:', {
                id: profileData.id,
                email: profileData.email,
                full_name: profileData.full_name,
                user_type: profileData.user_type
            });
            
            console.log('\n📋 Current Status:');
            console.log('   ✅ Supabase Auth: Working');
            console.log('   ✅ User Profile: Found');
            console.log('   ✅ Dashboard Redirect: Ready to test');
            
            // Test 3: Simulate the user object creation that LoginPage would do
            console.log('\n3️⃣ Simulating user object creation...');
            const user = {
                id: profileData.id,
                name: profileData.full_name || profileData.email?.split('@')[0] || 'User',
                email: profileData.email || '',
                type: profileData.user_type || 'student',
                curriculum: profileData.curriculum || 'igcse',
                grade: profileData.grade || 'Year 10',
                subjects: profileData.subjects || ['Mathematics', 'Physics', 'Chemistry'],
                preferences: {
                    language: 'en',
                    notifications: profileData.preferences?.notifications || true,
                    darkMode: profileData.preferences?.darkMode || false,
                    theme: profileData.preferences?.theme || 'light',
                    autoPlayFlashcards: profileData.preferences?.autoPlayFlashcards || true,
                    showHints: profileData.preferences?.showHints || true,
                    soundEffects: profileData.preferences?.soundEffects || true,
                    studyReminders: profileData.preferences?.studyReminders || true,
                    dailyGoal: profileData.preferences?.dailyGoal || 60
                }
            };
            
            console.log('✅ User object created successfully:');
            console.log('   Name:', user.name);
            console.log('   Type:', user.type);
            console.log('   Curriculum:', user.curriculum);
            console.log('   Grade:', user.grade);
            
            console.log('\n🎉 Dashboard redirect should work!');
            console.log('   The LoginPage will:');
            console.log('   1. ✅ Authenticate with Supabase');
            console.log('   2. ✅ Load user profile');
            console.log('   3. ✅ Create user object');
            console.log('   4. ✅ Set user in app state');
            console.log('   5. ✅ Redirect to dashboard');
        }
        
        // Test 4: Check current session
        console.log('\n4️⃣ Checking current session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            console.log('✅ Active session found');
            console.log('   Session expires:', new Date(session.expires_at * 1000).toLocaleString());
        } else {
            console.log('ℹ️  No active session');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testDashboardRedirect();
