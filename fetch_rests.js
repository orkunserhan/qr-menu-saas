const fs = require('fs');
const http = require('https');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
const url = urlMatch[1].trim() + '/rest/v1/restaurants?select=name,slug';
const key = keyMatch[1].trim();

const req = http.request(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } }, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => JSON.parse(data).forEach(r => console.log(r.slug)));
});
req.end();
