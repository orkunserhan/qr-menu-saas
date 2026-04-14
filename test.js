require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function getRests() {
  const { data, error } = await supabase.from('restaurants').select('name, slug');
  console.log(data);
}
getRests();
