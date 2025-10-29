import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW52d2llYWJ0eHd6YXBnZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjUzOTUsImV4cCI6MjA2OTI0MTM5NX0.jAkplpFSAAKqEMtFSZBFgluF_Obe6_upZA9W8uPtUIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTriggerDebug() {
    console.log('🔍 Debugging Trigger Function...\n');

    try {
        // Test 1: Check if the trigger function can be called directly
        console.log('1️⃣ Testing handle_new_user function directly...');
        
        // Create a mock user object similar to what auth.users would have
        const mockUser = {
            id: '12345678-1234-1234-1234-123456789012',
            email: 'test@example.com',
            raw_user_meta_data: {
                full_name: 'Test User',
                user_type: 'student',
                curriculum: 'igcse',
                grade: 'Year 10'
            },
            email_confirmed_at: new Date().toISOString()
        };

        const { data: functionData, error: functionError } = await supabase
            .rpc('handle_new_user', { NEW: mockUser });

        if (functionError) {
            console.log('❌ Function call error:', functionError.message);
            console.log('   This suggests the function has a syntax or logic error');
        } else {
            console.log('✅ Function called successfully');
        }

        // Test 2: Check if we can manually insert into users table
        console.log('\n2️⃣ Testing manual insert into users table...');
        
        const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert({
                id: '87654321-4321-4321-4321-210987654321',
                email: 'manual@example.com',
                full_name: 'Manual Test User',
                user_type: 'student',
                curriculum: 'igcse',
                grade: 'Year 10',
                subjects: ['Mathematics', 'Science', 'English'],
                is_active: true,
                is_verified: false
            })
            .select();

        if (insertError) {
            console.log('❌ Manual insert error:', insertError.message);
            console.log('   This suggests an RLS policy or table constraint issue');
        } else {
            console.log('✅ Manual insert successful');
            console.log('   Inserted user:', insertData);
        }

        // Test 3: Check table structure
        console.log('\n3️⃣ Checking table structure...');
        
        const { data: structureData, error: structureError } = await supabase
            .rpc('get_user_profile', { user_id: '87654321-4321-4321-4321-210987654321' });

        if (structureError) {
            console.log('❌ Structure check error:', structureError.message);
        } else {
            console.log('✅ Table structure is correct');
            console.log('   Sample data:', structureData);
        }

        console.log('\n🎯 Trigger Debug Complete!');
        console.log('\n📋 Analysis:');
        console.log('- The "Database error saving new user" suggests the trigger function is failing');
        console.log('- This could be due to:');
        console.log('  1. Function syntax error');
        console.log('  2. Table constraint violation');
        console.log('  3. Permission issues in the trigger function');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testTriggerDebug();
