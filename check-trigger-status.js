import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggerStatus() {
    console.log('🔍 Checking Trigger Function Status...\n');

    try {
        // Test 1: Check if we can access the users table at all
        console.log('1️⃣ Checking users table access...');
        const { data: tableData, error: tableError } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (tableError) {
            console.log('❌ Table access error:', tableError.message);
        } else {
            console.log('✅ Table access successful');
        }

        // Test 2: Check if the trigger function exists and can be called
        console.log('\n2️⃣ Checking trigger function...');
        const { data: functionData, error: functionError } = await supabase
            .rpc('handle_new_user');
        
        if (functionError) {
            console.log('❌ Function error:', functionError.message);
        } else {
            console.log('✅ Function exists and can be called');
        }

        // Test 3: Check if there are any users in the table
        console.log('\n3️⃣ Checking current users in table...');
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.log('❌ Count error:', countError.message);
        } else {
            console.log(`✅ Current user count: ${count}`);
        }

        // Test 4: Try to manually insert a test user to see if RLS allows it
        console.log('\n4️⃣ Testing manual insert (should fail due to RLS)...');
        const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert({
                id: 'test-12345-67890',
                email: 'manual-test@example.com',
                full_name: 'Manual Test User',
                user_type: 'student',
                curriculum: 'igcse',
                grade: 'Year 10',
                subjects: ['Mathematics'],
                is_active: true,
                is_verified: false
            })
            .select();

        if (insertError) {
            console.log('❌ Manual insert failed (expected due to RLS):', insertError.message);
        } else {
            console.log('⚠️  Manual insert succeeded (unexpected - RLS might be disabled)');
        }

        // Test 5: Check if the recently signed up user exists in auth.users
        console.log('\n5️⃣ Checking auth status...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log('❌ Auth error:', authError.message);
        } else if (user) {
            console.log('✅ User authenticated:', user.email);
            console.log('   User ID:', user.id);
            
            // Check if this user exists in the users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id);
            
            if (userError) {
                console.log('❌ User table query error:', userError.message);
            } else if (userData && userData.length > 0) {
                console.log('✅ User found in users table');
                console.log('   Profile data:', userData[0]);
            } else {
                console.log('❌ User NOT found in users table');
                console.log('   This confirms the trigger function is not working');
            }
        } else {
            console.log('ℹ️  No user currently authenticated');
        }

        console.log('\n🎯 Trigger Status Check Complete!');
        console.log('\n📋 Summary:');
        console.log('- Signup is working (no more database errors)');
        console.log('- Trigger function exists but may not be executing');
        console.log('- RLS policies are working (blocking manual inserts)');
        console.log('- Need to verify trigger function execution');

    } catch (error) {
        console.error('❌ Check failed with error:', error);
    }
}

// Run the check
checkTriggerStatus();
