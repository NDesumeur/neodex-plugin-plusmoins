// lancé par le test « local » de NeoDex : lit les deux cartes, répond juste grâce aux données du test, et vérifie que la série monte
// (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème)
module.exports = async ({ pj, sleep }) => {
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('pmCanvas').getAttribute('aria-label')`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('pmCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'plusmoins-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  const src = require('fs').readFileSync(require('path').join((process.env.NEO_LOCAL || '').split(';').find(d => d.endsWith('-plusmoins')) || __dirname, 'index.js'), 'utf8');
  // une seule catégorie : les mêmes noms reviennent d'une catégorie à l'autre (Chine : habitants, superficie)
  const line = src.split('\n').find(l => l.startsWith('  montagnes: '));
  const cat = c => pj(`document.querySelector('button[data-cat="${c}"]').click(), 0`);
  const vals = Object.fromEntries([...line.matchAll(/\['([^']+(?:\'[^']*)?)', ([\d.]+)\]/g)].map(m => [m[1].replace(/\'/g, "'"), +m[2]]));
  // les deux cartes en jeu, lues dans la description du canevas (mise à jour toutes les 20 images : on attend qu'elle montre bien les cartes en cours)
  const pair = async () => { for (let t = 0; t < 30; t++) { const l = await label(), m = /\. (.+?) : [\d ,  .]+(?: millions?)? .*?\. (.+?) : plus ou moins/.exec(l || '');
    const cur = await pj(`(() => { const pm = document.getElementById('pmCanvas').__pm.st(); return pm.mode === 'play' || pm.mode === 'ready' ? [pm.left.it[0], pm.right.it[0]] : null; })()`);
    if (m && cur && m[1] === cur[0] && m[2] === cur[1]) return m; await sleep(100); } throw new Error('cartes illisibles : « ' + await label() + ' »'); };
  await sleep(400); await shot('0-depart'); await cat('montagnes'); await sleep(300);
  for (let i = 0; i < 3; i++) {
    const m = await pair();
    await key(vals[m[2]] > vals[m[1]] ? 'ArrowUp' : 'ArrowDown');
    await sleep(500); if (!i) await shot('1-revele');
    await sleep(1100);
  }
  await pair(); const first = await label();
  if (process.env.NEO_SHOTS) { await shot('2-suite'); const m = await pair(); await key(vals[m[2]] > vals[m[1]] ? 'ArrowDown' : 'ArrowUp'); await sleep(2200); await shot('3-perdu'); }
  if (!/série de 3/.test(first)) throw new Error('série attendue à 3 : « ' + first + ' »');
  await cat('tout');
  // la planche de toutes les petites images (une ligne par catégorie), le plein écran et la place prise
  if (process.env.NEO_SHOTS) {
    const d = await pj(`(() => { const T = document.getElementById('pmCanvas').__pm, cats = Object.entries(T.cats), c = document.createElement('canvas'); c.width = 30 * 33; c.height = 20 * cats.length; const g = c.getContext('2d');
      cats.forEach(([k, C], j) => C.items.forEach((it, i) => g.drawImage(T.pic({cat: k, it}), i * 30, j * 20))); return c.toDataURL(); })()`);
    require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'plusmoins-4-images.png'), Buffer.from(d.split(',')[1], 'base64'));
  }
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  await pj(`document.getElementById('pmFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('pmCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('pmCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('pmCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('le jeu dépasse la fenêtre ou reste petit : ' + JSON.stringify(L));
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  return first + ' · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
