const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStudyPlansAuth() {
  console.log('Testing study_plans authentication and RLS...\n');

  try {
    // 1. Check if user is authenticated
    console.log('1. Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Authentication error:', authError.message);
      console.log('User needs to be authenticated first');
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('User needs to be authenticated first');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    console.log('Email:', user.email);

    // 2. Test reading study plans
    console.log('\n2. Testing SELECT with RLS...');
    const { data: readData, error: readError } = await supabase
      .from('study_plans')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.log('❌ SELECT error:', readError.message);
    } else {
      console.log('✅ SELECT successful, found', readData.length, 'study plans');
    }

    // 3. Test inserting a study plan
    console.log('\n3. Testing INSERT with RLS...');
    const testStudyPlan = {
      user_id: user.id,
      study_date: new Date().toISOString().split('T')[0],
      study_time_minutes: 60,
      total_topics: 5,
      topics_done: 0,
      exam_date: '2024-12-31'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('study_plans')
      .insert(testStudyPlan)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ INSERT error:', insertError.message);
      console.log('Error code:', insertError.code);
      console.log('Error details:', insertError.details);
      console.log('Error hint:', insertError.hint);
    } else {
      console.log('✅ INSERT successful, created study plan with ID:', insertData.plan_id);
      
      // 4. Test updating the study plan
      console.log('\n4. Testing UPDATE with RLS...');
      const { data: updateData, error: updateError } = await supabase
        .from('study_plans')
        .update({ study_time_minutes: 90 })
        .eq('plan_id', insertData.plan_id)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ UPDATE error:', updateError.message);
      } else {
        console.log('✅ UPDATE successful, study time updated to:', updateData.study_time_minutes, 'minutes');
      }
      
      // 5. Test deleting the study plan
      console.log('\n5. Testing DELETE with RLS...');
      const { error: deleteError } = await supabase
        .from('study_plans')
        .delete()
        .eq('plan_id', insertData.plan_id);
      
      if (deleteError) {
        console.log('❌ DELETE error:', deleteError.message);
      } else {
        console.log('✅ DELETE successful, test study plan removed');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testStudyPlansAuth();
