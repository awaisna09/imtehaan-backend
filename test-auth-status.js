const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthStatus() {
  console.log('Checking Supabase authentication status...\n');

  try {
    // 1. Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found');
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);
      console.log('Session expires:', session.expires_at);
    } else {
      console.log('❌ No active session found');
    }

    // 2. Check current user
    console.log('\n2. Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User error:', userError.message);
    } else if (user) {
      console.log('✅ User found');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
    } else {
      console.log('❌ No user found');
    }

    // 3. Check if we can access the study_plans table
    console.log('\n3. Testing table access...');
    const { data: tableData, error: tableError } = await supabase
      .from('study_plans')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table access error:', tableError.message);
      console.log('Error code:', tableError.code);
    } else {
      console.log('✅ Table access successful');
      console.log('Found', tableData.length, 'rows');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
checkAuthStatus();
