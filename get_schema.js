import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  await supabase.auth.signInWithPassword({email: 'admin@demo.com', password: '123456'});
  const { data: cat } = await supabase.from('categories').select('*').limit(1);
  const { data: prod } = await supabase.from('products').select('*').limit(1);
  console.log('Categories:', cat && cat.length ? Object.keys(cat[0]) : 'None found');
  console.log('Products:', prod && prod.length ? Object.keys(prod[0]) : 'None found');
}
run();
