// lancé par le test « local » de NeoDex : lit les deux cartes, répond juste grâce aux données du test, et vérifie que la série monte
// (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème)
module.exports = async ({ pj, sleep }) => {
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('pmCanvas').getAttribute('aria-label')`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('pmCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'plusmoins-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  const src = require('fs').readFileSync(require('path').join(process.env.NEO_LOCAL || __dirname, 'index.js'), 'utf8');
  const vals = Object.fromEntries([...src.matchAll(/\['([^']+(?:\'[^']*)?)', ([\d.]+)\]/g)].map(m => [m[1].replace(/\'/g, "'"), +m[2]]));
  await sleep(400); await shot('0-depart');
  for (let i = 0; i < 3; i++) {
    const l = await label(), m = /\. (.+?) : [\d ,\u202f\u00a0.]+(?: millions?)? .*?\. (.+?) : plus ou moins/.exec(l);
    if (!m) throw new Error('cartes illisibles : « ' + l + ' »');
    await key(vals[m[2]] > vals[m[1]] ? 'ArrowUp' : 'ArrowDown');
    await sleep(500); if (!i) await shot('1-revele');
    await sleep(1100);
  }
  const first = await label();
  if (process.env.NEO_SHOTS) { await shot('2-suite'); const l = await label(), m = /\. (.+?) : [\d ,\u202f\u00a0.]+(?: millions?)? .*?\. (.+?) : plus ou moins/.exec(l); await key(vals[m[2]] > vals[m[1]] ? 'ArrowDown' : 'ArrowUp'); await sleep(2200); await shot('3-perdu'); }
  if (!/série de 3/.test(first)) throw new Error('série attendue à 3 : « ' + first + ' »');
  return first;
};
