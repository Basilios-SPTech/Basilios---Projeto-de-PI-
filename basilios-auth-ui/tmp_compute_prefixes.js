const fs = require('fs');
const https = require('https');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'utils', 'deliveryCepPrefixes.js');
const source = fs.readFileSync(filePath, 'utf8');
const match = source.match(/export const CEP_PREFIXES_VALIDOS = \[([\s\S]*?)\];/);
if (!match) {
  console.error('prefix list not found');
  process.exit(1);
}
const prefixes = match[1]
  .split(/\n/)
  .map((line) => {
    const m = line.match(/"(\d{5})"/);
    return m ? m[1] : null;
  })
  .filter(Boolean);
const storeLat = -23.5769666;
const storeLon = -46.6264667;
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function geocode(prefix) {
  return new Promise((resolve, reject) => {
    const cep = prefix + '-000';
    const url =
      'https://nominatim.openstreetmap.org/search?' +
      new URLSearchParams({
        q: `${cep}, São Paulo, SP, Brasil`,
        format: 'json',
        limit: '1',
        addressdetails: '0',
      }).toString();
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Copilot/1.0; +https://github.com)',
      },
    };
    https
      .get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error('status ' + res.statusCode));
          }
          try {
            const json = JSON.parse(data);
            if (!json.length) return reject(new Error('no result'));
            const item = json[0];
            resolve({ prefix, lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}
(async () => {
  const allowed = [];
  for (let i = 0; i < prefixes.length; i++) {
    const prefix = prefixes[i];
    try {
      const { lat, lon } = await geocode(prefix);
      const d = haversine(storeLat, storeLon, lat, lon);
      console.error(prefix, d.toFixed(2), lat, lon);
      if (d <= 7) allowed.push(prefix);
    } catch (err) {
      console.error('ERR', prefix, err.message);
    }
    await new Promise((r) => setTimeout(r, 1100));
  }
  console.log('ALLOWED_COUNT', allowed.length);
  console.log(allowed.join(', '));
})();
