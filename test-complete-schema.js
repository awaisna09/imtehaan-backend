import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteSchema() {
    console.log('🧪 Testing Complete Users Schema...\n');

    try {
        // Test 1: Check if users table exists and has correct structure
        console.log('1️⃣ Checking users table structure...');
        const { data: tableInfo, error: tableError } = await supabase
            .from('users')
            .select('*')
            .limit(0);
        
        if (tableError) {
            console.log('❌ Table access error:', tableError.message);
        } else {
            console.log('✅ Users table accessible');
        }

        // Test 2: Check if handle_new_user function exists
        console.log('\n2️⃣ Checking handle_new_user function...');
        const { data: functionCheck, error: functionError } = await supabase
            .rpc('handle_new_user', { new_user: { id: 'test', email: 'test@test.com' } });
        
        if (functionError && functionError.message.includes('function "handle_new_user"')) {
            console.log('❌ handle_new_user function not found');
        } else {
            console.log('✅ handle_new_user function exists');
        }

        // Test 3: Check if get_user_profile function exists
        console.log('\n3️⃣ Checking get_user_profile function...');
        const { data: profileCheck, error: profileError } = await supabase
            .rpc('get_user_profile');
        
        if (profileError && profileError.message.includes('function "get_user_profile"')) {
            console.log('❌ get_user_profile function not found');
        } else {
            console.log('✅ get_user_profile function exists');
        }

        // Test 4: Check if user_public_info view exists
        console.log('\n4️⃣ Checking user_public_info view...');
        const { data: viewCheck, error: viewError } = await supabase
            .from('user_public_info')
            .select('*')
            .limit(0);
        
        if (viewError) {
            console.log('❌ user_public_info view error:', viewError.message);
        } else {
            console.log('✅ user_public_info view accessible');
        }

        // Test 5: Check current user count
        console.log('\n5️⃣ Checking current user count...');
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.log('❌ Count error:', countError.message);
        } else {
            console.log(`✅ Current users in table: ${count}`);
        }

        // Test 6: Check if subjects column exists
        console.log('\n6️⃣ Checking subjects column...');
        const { data: sampleUser, error: sampleError } = await supabase
            .from('users')
            .select('id, email, subjects')
            .limit(1);
        
        if (sampleError) {
            console.log('❌ Sample user query error:', sampleError.message);
        } else if (sampleUser && sampleUser.length > 0) {
            console.log('✅ Subjects column accessible');
            console.log('   Sample user subjects:', sampleUser[0].subjects);
        } else {
            console.log('ℹ️  No users found to test subjects column');
        }

        console.log('\n🎯 Schema Test Complete!');
        console.log('\n📋 Next Steps:');
        console.log('1. Try signing up a new user to test the trigger');
        console.log('2. Test login functionality');
        console.log('3. Verify the 406 error is resolved');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testCompleteSchema();
