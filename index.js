// Plus ou Moins : deux cartes, la valeur de la première est connue : la seconde est-elle plus haute ou plus basse ?
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Plus ou Moins</span><span class="hint">↑ ou clic sur PLUS, ↓ ou clic sur MOINS</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="pmCanvas" width="192" height="160" role="img" aria-label="Plus ou Moins"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="pmStats"></div></div>
      <div class="row"><button class="btn main" id="pmNew">NOUVELLE PARTIE</button><button class="btn" id="pmFs">PLEIN ÉCRAN</button><button class="btn" id="pmShare">PARTAGER</button></div>
      <div class="hint">La carte de gauche montre son chiffre. Celle de droite est-elle au-dessus ou en dessous ? Une bonne réponse, elle passe à gauche et une nouvelle carte arrive ; une erreur, et la série s'arrête. Choisis une catégorie ci-dessous, ou « Tout mélangé » qui change de sujet toutes les 5 bonnes réponses. Les chiffres sont arrondis ; deux cartes trop proches ne tombent jamais ensemble.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:1 1 360px;min-width:min(100%,320px);position:relative}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 192 / 160))}
.gameBox canvas{width:min(100%,max(280px,calc((100vh - 170px) * 192 / 160)));height:auto;aspect-ratio:192/160;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}


export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "PLUS OU MOINS", T: {"k": "#0c0a12", "k2": "#16121e", "fill": "#221c2c", "fillOn": "#2e263a", "hl": "#3a3046", "line": "#62566e", "acc": "#ffd84a", "accL": "#fff6b0", "accS": "#c89a1a", "accD": "#4a3a08", "rivet": "#f0f0f8", "btn": "#3a3046", "btnHi": "#62566e", "btnLo": "#16121e", "btnHov": "#443852", "btnHovHi": "#82768e", "text": "#f4f0f8", "muted": "#c0b8cc", "acc2": "#7ee07a", "gold": "#ffd84a", "orange": "#ff8a3a", "red": "#ff4a3a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#100c16", "bgDot": "#221c2c", "bgDot2": "#16121e", "spark": "#3a3a10", "spark2": "#ffd84a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["kkkkk..kkkkk", "kwwwk..kgggk", "kwnwk..kgggk", "knnnk..kgggk", "kwnwk..kgrgk", "kwwwk..kgggk", "kkkkk..kkkkk", "............", "..n......r..", ".nnn....rrr.", "nnnnn..rrrrr"],
  icons: [[/^NOUVELLE/, 'play'], [/^RECORDS/, 'crown']] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (v > (b ?? 0)) {  // un score nul n'est jamais un record
    games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
  // les trophées de NeoDex (3.4.8 et plus) : succès et records déclarés dans plugin.json ; sur un NeoDex plus ancien, rien ne se passe
  const trophy = id => { ctx.games?.unlock(id).catch(() => {}); };
  const trophyRecord = (id, v) => { if (v != null && Number.isFinite(+v)) ctx.games?.record(id, +v).catch(() => {}); };
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

/* ---------- Plus ou Moins : deux cartes ; la valeur de la première est connue, devine si la seconde est plus haute ou plus basse.
   Une bonne réponse, la seconde passe à gauche et une nouvelle arrive ; une erreur, c'est fini. 14 catégories de vrais chiffres (arrondis) ---------- */
const PM = {W: 192, H: 160, HUD: 12};
// [nom, valeur] ; unit : ce qui s'affiche sous le nombre ; gap : écart minimum pour qu'une paire soit jouable (rapport, ou années d'écart)
const PM_CATS = {
  pays: {name: 'Pays', ask: 'habitants', unit: 'habitants', ratio: 1.1, icon: 'globe', items: [['Chine', 1410], ['Inde', 1430], ['États-Unis', 335], ['Indonésie', 277], ['Pakistan', 240], ['Nigeria', 224], ['Brésil', 216], ['Bangladesh', 173], ['Russie', 144], ['Mexique', 128], ['Japon', 124], ['Éthiopie', 126], ['Philippines', 117], ['Égypte', 112], ['Viêt Nam', 99], ['Iran', 89], ['Turquie', 85], ['Allemagne', 84], ['France', 68], ['Royaume-Uni', 68], ['Italie', 59], ['Espagne', 48], ['Algérie', 46], ['Canada', 40], ['Maroc', 38], ['Australie', 26], ['Belgique', 11.7], ['Portugal', 10.4], ['Suisse', 8.8], ['Islande', .38]].map(([n, v]) => [n, v * 1e6])},
  montagnes: {name: 'Montagnes', ask: 'altitude', unit: 'm d’altitude', ratio: 1.06, icon: 'mount', items: [['Everest', 8849], ['K2', 8611], ['Aconcagua', 6961], ['Denali', 6190], ['Kilimandjaro', 5895], ['Elbrouz', 5642], ['Mont Blanc', 4806], ['Cervin', 4478], ['Mauna Kea', 4207], ['Mont Fuji', 3776], ['Teide', 3715], ['Etna', 3357], ['Vignemale', 3298], ['Mont Olympe', 2917], ['Pic du Midi', 2877], ['Mont Ventoux', 1910], ['Puy de Dôme', 1465], ['Ben Nevis', 1345], ['Mont Sinaï', 2285], ['Montserrat', 1236]]},
  fleuves: {name: 'Fleuves', ask: 'longueur', unit: 'km de long', ratio: 1.08, icon: 'river', items: [['Nil', 6650], ['Amazone', 6400], ['Ienisseï', 5539], ['Fleuve Jaune', 5464], ['Congo', 4700], ['Mékong', 4350], ['Niger', 4180], ['Volga', 3530], ['Danube', 2850], ['Gange', 2525], ['Rhin', 1233], ['Elbe', 1094], ['Loire', 1006], ['Rhône', 812], ['Seine', 777], ['Garonne', 529], ['Tibre', 406], ['Tamise', 346], ['Somme', 245], ['Lys', 202]]},
  animaux: {name: 'Animaux', ask: 'poids', unit: 'kg (adulte)', ratio: 1.25, icon: 'paw', items: [['Baleine bleue', 140000], ['Éléphant d\'Afrique', 6000], ['Rhinocéros blanc', 2300], ['Hippopotame', 1500], ['Girafe', 1000], ['Vache', 700], ['Cheval', 500], ['Ours polaire', 450], ['Tigre', 220], ['Lion', 190], ['Gorille', 160], ['Autruche', 120], ['Panda géant', 100], ['Kangourou roux', 66], ['Chimpanzé', 50], ['Loup', 40], ['Manchot empereur', 30], ['Renard', 6], ['Chat', 4.5], ['Lapin', 2], ['Hérisson', .8], ['Souris', .02]]},
  monuments: {name: 'Monuments', ask: 'hauteur', unit: 'm de haut', ratio: 1.08, icon: 'tower', items: [['Burj Khalifa', 828], ['Tokyo Skytree', 634], ['Tour CN', 553], ['Tours Petronas', 452], ['Empire State Building', 443], ['Tour Eiffel', 330], ['Tour Montparnasse', 210], ['Sagrada Família', 172], ['Pyramide de Khéops', 139], ['Atomium', 102], ['Big Ben', 96], ['Statue de la Liberté', 93], ['Taj Mahal', 73], ['Notre-Dame de Paris', 69], ['Tour de Pise', 56], ['Arc de Triomphe', 50], ['Colisée', 48], ['Christ Rédempteur', 38], ['Manneken-Pis', .6], ['Beffroi de Lille', 104]]},
  astres: {name: 'Astres', ask: 'diamètre', unit: 'km de diamètre', ratio: 1.08, icon: 'planet', items: [['Soleil', 1392700], ['Jupiter', 139820], ['Saturne', 116460], ['Uranus', 50724], ['Terre', 12742], ['Mars', 6779], ['Ganymède', 5268], ['Mercure', 4879], ['Lune', 3474], ['Europe (lune)', 3122], ['Triton', 2707], ['Pluton', 2377], ['Cérès', 939], ['Vénus', 12104], ['Titan', 5150], ['Neptune', 49244], ['Io', 3643], ['Callisto', 4821]]},
  inventions: {name: 'Inventions', ask: 'année', unit: 'année d\'invention', years: 8, icon: 'bulb', items: [['Imprimerie (Gutenberg)', 1450], ['Machine à vapeur (Watt)', 1769], ['Montgolfière', 1783], ['Vaccin (Jenner)', 1796], ['Locomotive', 1804], ['Photographie', 1826], ['Téléphone', 1876], ['Ampoule (Edison)', 1879], ['Automobile (Benz)', 1886], ['Cinéma (Lumière)', 1895], ['Avion (Wright)', 1903], ['Télévision', 1926], ['Pénicilline', 1928], ['Stylo à bille', 1938], ['Ordinateur ENIAC', 1945], ['Premier jeu vidéo Pong', 1972], ['Internet (ARPANET)', 1969], ['Web', 1991], ['Wi-Fi', 1997], ['Smartphone (iPhone)', 2007]]},
  villes: {name: 'Villes de France', ask: 'habitants', unit: 'habitants', ratio: 1.08, icon: 'house', items: [['Paris', 2133000], ['Marseille', 873000], ['Lyon', 522000], ['Toulouse', 504000], ['Nice', 342000], ['Nantes', 320000], ['Montpellier', 299000], ['Strasbourg', 291000], ['Bordeaux', 261000], ['Lille', 236000], ['Rennes', 222000], ['Reims', 180000], ['Le Havre', 166000], ['Grenoble', 157000], ['Brest', 139000], ['Amiens', 134000], ['Metz', 120000], ['Ajaccio', 73000], ['Calais', 67000], ['Arras', 41000], ['Lens', 32000]]},
  superficie: {name: 'Superficie', ask: 'superficie', unit: 'km²', ratio: 1.1, icon: 'flag', items: [['Russie', 17098000], ['Canada', 9985000], ['Chine', 9597000], ['États-Unis', 9834000], ['Brésil', 8516000], ['Australie', 7692000], ['Inde', 3287000], ['Argentine', 2780000], ['Kazakhstan', 2725000], ['Algérie', 2382000], ['Arabie saoudite', 2150000], ['Mexique', 1964000], ['Indonésie', 1905000], ['Iran', 1648000], ['Mongolie', 1564000], ['Pérou', 1285000], ['Égypte', 1002000], ['Nigeria', 924000], ['Turquie', 784000], ['Chili', 756000], ['France', 552000], ['Espagne', 506000], ['Suède', 450000], ['Japon', 378000], ['Allemagne', 357000], ['Italie', 301000], ['Royaume-Uni', 243000], ['Grèce', 132000], ['Portugal', 92000], ['Suisse', 41000], ['Belgique', 31000], ['Luxembourg', 2600], ['Monaco', 2]]},
  vitesse: {name: 'Vitesse', ask: 'vitesse', unit: 'km/h (au maximum)', ratio: 1.15, icon: 'bolt', items: [['Faucon pèlerin (en piqué)', 390], ['Guépard', 110], ['Antilope d\'Amérique', 88], ['Lion', 80], ['Lièvre', 72], ['Cheval au galop', 70], ['Zèbre', 64], ['Grizzly', 56], ['Girafe', 52], ['Chat', 48], ['Usain Bolt', 44], ['Éléphant', 40], ['Hippopotame', 30], ['Écureuil', 20], ['Poule', 14], ['Souris', 13], ['Tortue terrestre', 0.3], ['Paresseux', 0.25], ['Escargot', 0.05]]},
  longevite: {name: 'Longévité', ask: 'longévité', unit: 'ans en moyenne', ratio: 1.2, icon: 'sand', items: [['Requin du Groenland', 400], ['Baleine boréale', 200], ['Tortue des Galápagos', 150], ['Éléphant', 65], ['Ara', 60], ['Hippopotame', 45], ['Chimpanzé', 40], ['Cheval', 28], ['Ours brun', 25], ['Vache', 20], ['Chat', 15], ['Chien', 12], ['Lapin', 9], ['Hamster', 2.5], ['Souris', 1.5], ['Abeille ouvrière', 0.1]]},
  calories: {name: 'Calories', ask: 'calories', unit: 'kcal pour 100 g', ratio: 1.2, icon: 'apple', items: [['Huile d\'olive', 900], ['Beurre', 740], ['Noix', 650], ['Chocolat noir', 550], ['Croissant', 410], ['Sucre', 400], ['Pâtes (crues)', 360], ['Frites', 310], ['Pain', 270], ['Avocat', 160], ['Œuf', 145], ['Riz (cuit)', 130], ['Banane', 90], ['Pomme de terre', 80], ['Lait', 65], ['Pomme', 52], ['Carotte', 41], ['Tomate', 18], ['Laitue', 15]]},
  naissances: {name: 'Célébrités', ask: 'année', unit: 'année de naissance', years: 15, icon: 'star', items: [['Cléopâtre', -69], ['Charlemagne', 748], ['Jeanne d\'Arc', 1412], ['Christophe Colomb', 1451], ['Shakespeare', 1564], ['Molière', 1622], ['Louis XIV', 1638], ['Isaac Newton', 1643], ['Mozart', 1756], ['Napoléon', 1769], ['Victor Hugo', 1802], ['Marie Curie', 1867], ['Gandhi', 1869], ['Albert Einstein', 1879], ['Pablo Picasso', 1881], ['Charles de Gaulle', 1890], ['Édith Piaf', 1915], ['Nelson Mandela', 1918], ['Elvis Presley', 1935], ['Michael Jackson', 1958], ['Zinédine Zidane', 1972]]},
  jeux: {name: 'Jeux vidéo', ask: 'année', unit: 'année de sortie', years: 2, icon: 'pad', items: [['Pong', 1972], ['Space Invaders', 1978], ['Pac-Man', 1980], ['Tetris', 1984], ['Super Mario Bros.', 1985], ['The Legend of Zelda', 1986], ['Street Fighter II', 1991], ['Doom', 1993], ['Pokémon Rouge et Bleu', 1996], ['Les Sims', 2000], ['GTA III', 2001], ['World of Warcraft', 2004], ['Wii Sports', 2006], ['League of Legends', 2009], ['Minecraft', 2011], ['GTA V', 2013], ['Fortnite', 2017], ['Animal Crossing : New Horizons', 2020], ['Elden Ring', 2022]]},
  constructions: {name: 'Constructions', ask: 'année', unit: 'année de construction', years: 15, icon: 'tower', items: [['Pyramide de Khéops', -2560], ['Stonehenge', -2500], ['Parthénon', -447], ['Colisée', 80], ['Pont du Gard', 50], ['Mont-Saint-Michel (abbaye)', 966], ['Notre-Dame de Paris (début)', 1163], ['Tour de Pise (début)', 1173], ['Machu Picchu', 1450], ['Château de Chambord', 1519], ['Taj Mahal', 1632], ['Château de Versailles', 1661], ['Arc de Triomphe', 1836], ['Big Ben', 1859], ['Statue de la Liberté', 1886], ['Tour Eiffel', 1889], ['Empire State Building', 1931], ['Golden Gate Bridge', 1937], ['Atomium', 1958], ['Opéra de Sydney', 1973], ['Pyramide du Louvre', 1989], ['Viaduc de Millau', 2004], ['Burj Khalifa', 2010]]},
  histoire: {name: 'Histoire', ask: 'année', unit: 'année', years: 10, icon: 'sand', items: [['Chute de Rome', 476], ['Couronnement de Charlemagne', 800], ['Bataille de Hastings', 1066], ['Première croisade', 1096], ['Peste noire en Europe', 1347], ['Fin de la guerre de Cent Ans', 1453], ['Christophe Colomb en Amérique', 1492], ['Édit de Nantes', 1598], ['Prise de la Bastille', 1789], ['Sacre de Napoléon', 1804], ['Bataille de Waterloo', 1815], ['Abolition de l\'esclavage en France', 1848], ['Début de la Première Guerre mondiale', 1914], ['Révolution russe', 1917], ['Début de la Seconde Guerre mondiale', 1939], ['Premier pas sur la Lune', 1969], ['Chute du mur de Berlin', 1989], ['Pièces et billets en euros', 2002]]},
  langues: {name: 'Langues', ask: 'locuteurs natifs', unit: 'locuteurs', ratio: 1.2, icon: 'globe', items: [['Mandarin', 940], ['Espagnol', 485], ['Anglais', 380], ['Hindi', 345], ['Bengali', 234], ['Portugais', 236], ['Russe', 147], ['Japonais', 123], ['Vietnamien', 85], ['Turc', 82], ['Allemand', 76], ['Coréen', 81], ['Français', 74], ['Italien', 64], ['Polonais', 40], ['Néerlandais', 24], ['Grec', 13], ['Suédois', 10], ['Breton', .2], ['Islandais', .35]].map(([n, v]) => [n, v * 1e6])},
  lacs: {name: 'Lacs', ask: 'profondeur', unit: 'm de profondeur', ratio: 1.15, icon: 'river', items: [['Lac Baïkal', 1642], ['Lac Tanganyika', 1470], ['Mer Caspienne', 1025], ['Lac Malawi', 706], ['Lac Issyk-Koul', 668], ['Lac Supérieur', 406], ['Lac de Garde', 346], ['Léman', 310], ['Lac Titicaca', 281], ['Loch Ness', 230], ['Lac Victoria', 84], ['Lac d\'Annecy', 65], ['Lac du Bourget', 145], ['Lac Balaton', 12], ['Lac Tchad', 11], ['Lac Érié', 64]]},
  chutes: {name: 'Chutes d’eau', ask: 'hauteur', unit: 'm de chute', ratio: 1.15, icon: 'mount', items: [['Salto Angel', 979], ['Chutes de la Tugela', 948], ['Chutes de Yosemite', 739], ['Chutes Sutherland', 580], ['Cirque de Gavarnie', 422], ['Chutes de Kaieteur', 226], ['Chutes Victoria', 108], ['Chutes d\'Iguaçu', 82], ['Chutes du Niagara', 51], ['Chutes du Rhin', 23], ['Chutes de Gullfoss', 32], ['Cascade du Hérisson', 65], ['Chutes de Dettifoss', 44], ['Cascade de Seerenbach', 305], ['Chutes de Krimml', 380]]},
  departements: {name: 'Départements', ask: 'habitants', unit: 'habitants', ratio: 1.12, icon: 'house', items: [['Nord', 2610000], ['Paris', 2130000], ['Bouches-du-Rhône', 2060000], ['Rhône', 1900000], ['Seine-Saint-Denis', 1660000], ['Gironde', 1650000], ['Hauts-de-Seine', 1630000], ['Pas-de-Calais', 1460000], ['Haute-Garonne', 1430000], ['Loire-Atlantique', 1450000], ['Val-de-Marne', 1410000], ['Isère', 1270000], ['Essonne', 1310000], ['Alpes-Maritimes', 1100000], ['Hérault', 1200000], ['Bas-Rhin', 1150000], ['Finistère', 920000], ['Vendée', 690000], ['Savoie', 440000], ['Ariège', 153000], ['Corse-du-Sud', 160000], ['Hautes-Alpes', 141000], ['Cantal', 144000], ['Creuse', 115000], ['Lozère', 77000], ['Gers', 191000], ['Meuse', 182000]]},
};
const PM_ICONS = {  // 12 x 12, palette de la carte
  globe: ['...kkkkkk...', '..kbbggbbk..', '.kbggggbbbk.', 'kbbgggbbbbbk', 'kbbbggbbggbk', 'kbbbbbbggggk', 'kbgbbbbbgggk', 'kbggbbbbbgbk', 'kbbggbbbbbbk', '.kbbgbbbbbk.', '..kbbbbbbk..', '...kkkkkk...'],
  mount: ['............', '.....k......', '....kwk.....', '...kwwwk....', '...kwmwk.k..', '..kmmmmkkwk.', '..kmmmmmkmk.', '.kmmmmmmmmk.', '.kmmmmmmmmmk', 'kmmmmmmmmmmk', 'kggggggggggk', 'kkkkkkkkkkkk'],
  river: ['gggggggggggg', 'ggggbbbbgggg', 'gggbbwbbbggg', 'ggbbbbbbbggg', 'gggbbbbbbbgg', 'ggggbbbwbbgg', 'gggggbbbbbgg', 'ggggbbbbbggg', 'gggbbbwbbggg', 'ggbbbbbbgggg', 'ggbbbbbggggg', 'gggggggggggg'],
  paw: ['..kk....kk..', '.kmmk..kmmk.', '.kmmk..kmmk.', '..kk....kk..', 'kk..kkkk..kk', 'mmk.kmmk.kmm', 'kk.kmmmmk.kk', '..kmmmmmmk..', '.kmmmmmmmmk.', '.kmmmmmmmmk.', '..kmmkkmmk..', '...kk..kk...'],
  tower: ['.....kk.....', '.....kk.....', '....kmmk....', '....kmmk....', '....kmmk....', '...kmmmmk...', '...kmkkmk...', '..kmmmmmmk..', '..kmk..kmk..', '.kmmk..kmmk.', '.kmk....kmk.', 'kkkk....kkkk'],
  planet: ['....kkkk....', '..kkooookk..', '.kowwooooOk.', '.kowoooooOk.', 'kooooooooOOk', 'yyyyyyyyyyyy', 'kyoooooooOyk', '.kooooooOOk.', '..kkoooOkk..', '....kkkk....', '............', '............'],
  bulb: ['....kkkk....', '...kyyyyk...', '..kyywyyyk..', '..kywyyyyk..', '..kyyyyyyk..', '...kyyyyk...', '....kyyk....', '....kmmk....', '....kkkk....', '....kmmk....', '.....kk.....', '............'],
  house: ['.....kk.....', '....krrk....', '...krrrrk...', '..krrrrrrk..', '.krrrrrrrrk.', 'kkkkkkkkkkkk', '.kwwwwwwwwk.', '.kwbwwwwbwk.', '.kwwwwwwwwk.', '.kwwwkkwwwk.', '.kwwwkkwwwk.', '.kkkkkkkkkk.'],
  flag: ['.k..........', '.krrrrrrrr..', '.krrrrrrrr..', '.kwwwwwwww..', '.kwwwwwwww..', '.kbbbbbbbb..', '.kbbbbbbbb..', '.k..........', '.k..........', '.k..........', 'kkk.........', 'kkk.........'],
  bolt: ['......kkkk..', '.....kyyk...', '....kyyk....', '...kyyk.....', '..kyyyykkk..', '.kyyyyyyyk..', '.kkkkyyyk...', '....kyyk....', '...kyyk.....', '..kyyk......', '..kyk.......', '..kk........'],
  sand: ['kkkkkkkkkkkk', '.kOOOOOOOOk.', '..kwyyyywk..', '...kwyywk...', '....kyyk....', '.....kk.....', '.....kk.....', '....kwyk....', '...kwyywk...', '..kyyyyyyk..', '.kOOOOOOOOk.', 'kkkkkkkkkkkk'],
  apple: ['......kk....', '.....kgk....', '...kkkkkk...', '..krrrrrrk..', '.krwrrrrrrk.', '.krwrrrrrrk.', '.krrrrrrrrk.', '.krrrrrrrrk.', '.krrrrrrrrk.', '..krrrrrrk..', '...kkrrkk...', '.....kk.....'],
  star: ['.....kk.....', '....kyyk....', '....kyyk....', 'kkkkyyyykkkk', 'kyyyyyyyyyyk', '.kyyyywyyyk.', '..kyyyyyyk..', '..kyyyyyyk..', '.kyyykkyyyk.', '.kyyk..kyyk.', 'kyyk....kyyk', 'kkk......kkk'],
  pad: ['............', '............', '.kkkkkkkkkk.', 'kmmmmmmmmmmk', 'kmkmmmmmmrmk', 'kkkkmmmmrmrk', 'kmkmmmmmmrmk', 'kmmmmmmmmmmk', 'kmmmkkkkmmmk', '.kkk....kkk.', '............', '............'],
};
const PM_ICON = Object.fromEntries(Object.entries(PM_ICONS).map(([k, rows]) => { const c = el('canvas'); c.width = c.height = 12; sprite(c.getContext('2d'), rows, 0, 0, {k: '#1a1018', b: '#3a7ad8', g: '#4aa84a', w: '#ffffff', m: '#8a7a6a', o: '#e8a84a', O: '#a86a2a', y: '#ffd84a', r: '#c83a3a'}); return [k, c]; }));
// les petites images des cartes, 28 x 18 pixels : drapeaux, montagnes, fleuves, animaux, monuments, astres ; l'icône de la catégorie pour les autres
// (aucune image ne dépend de la valeur : elle ne donne jamais la réponse)
const PM_FLAGS = {  // [sens des bandes, couleurs, poids des bandes], puis un détail dessiné par-dessus
  'Chine': ['h', ['#de2910'], 0, 'star5'], 'Inde': ['h', ['#ff9933', '#ffffff', '#138808'], 0, 'chakra'], 'États-Unis': ['us'], 'Indonésie': ['h', ['#ce1126', '#ffffff']],
  'Pakistan': ['v', ['#ffffff', '#01411c'], [1, 3], 'crescentW'], 'Nigeria': ['v', ['#008751', '#ffffff', '#008751']], 'Brésil': ['h', ['#009c3b'], 0, 'brazil'], 'Bangladesh': ['h', ['#006a4e'], 0, 'redDisc'],
  'Russie': ['h', ['#ffffff', '#0039a6', '#d52b1e']], 'Mexique': ['v', ['#006847', '#ffffff', '#ce1126'], 0, 'eagle'], 'Japon': ['h', ['#ffffff'], 0, 'sun'], 'Éthiopie': ['h', ['#078930', '#fcdd09', '#da121a'], 0, 'blueDisc'],
  'Philippines': ['h', ['#0038a8', '#ce1126'], 0, 'triangle'], 'Égypte': ['h', ['#ce1126', '#ffffff', '#000000'], 0, 'gold'], 'Viêt Nam': ['h', ['#da251d'], 0, 'star5'], 'Iran': ['h', ['#239f40', '#ffffff', '#da0000']],
  'Turquie': ['h', ['#e30a17'], 0, 'crescentT'], 'Allemagne': ['h', ['#000000', '#dd0000', '#ffce00']], 'France': ['v', ['#002395', '#ffffff', '#ed2939']], 'Royaume-Uni': ['uk'],
  'Italie': ['v', ['#009246', '#ffffff', '#ce2b37']], 'Espagne': ['h', ['#aa151b', '#f1bf00', '#aa151b'], [1, 2, 1]], 'Algérie': ['v', ['#006233', '#ffffff'], 0, 'crescentR'], 'Canada': ['v', ['#ff0000', '#ffffff', '#ff0000'], [1, 2, 1], 'leaf'],
  'Maroc': ['h', ['#c1272d'], 0, 'starG'], 'Australie': ['au'], 'Belgique': ['v', ['#000000', '#fae042', '#ed2939']], 'Portugal': ['v', ['#006600', '#ff0000'], [2, 3], 'sphere'], 'Suisse': ['h', ['#d52b1e'], 0, 'cross'],
  'Islande': ['nordic', ['#02529c', '#ffffff', '#dc1e35']], 'Suède': ['nordic', ['#006aa7', '#fecc00', '#fecc00']], 'Grèce': ['gr'], 'Argentine': ['h', ['#74acdf', '#ffffff', '#74acdf'], 0, 'sunY'],
  'Kazakhstan': ['h', ['#00afca'], 0, 'sunY'], 'Arabie saoudite': ['h', ['#006c35'], 0, 'script'], 'Mongolie': ['v', ['#c4272f', '#015197', '#c4272f'], 0, 'soyombo'], 'Pérou': ['v', ['#d91023', '#ffffff', '#d91023']],
  'Chili': ['cl'], 'Luxembourg': ['h', ['#ed2939', '#ffffff', '#00a1de']], 'Monaco': ['h', ['#ce1126', '#ffffff']],
};
function pmFlag(g, name) {
  const W = 26, H = 16, x0 = 1, y0 = 1, F = PM_FLAGS[name] || ['h', ['#8a7a6a']], [kind, cols, wts] = F, deco = F[3];
  const band = (cols, wts, vert) => { const t = (wts || cols.map(() => 1)), sum = t.reduce((a, b) => a + b, 0); let o = 0; cols.forEach((c, i) => { const n = Math.round((o + t[i]) / sum * (vert ? W : H)) - Math.round(o / sum * (vert ? W : H)); if (vert) px(g, c, x0 + Math.round(o / sum * W), y0, n, H); else px(g, c, x0, y0 + Math.round(o / sum * H), W, n); o += t[i]; }); };
  if (kind === 'h' || kind === 'v') band(cols, wts, kind === 'v');
  else if (kind === 'nordic') { px(g, cols[0], x0, y0, W, H); px(g, cols[1], x0 + 7, y0, 4, H); px(g, cols[1], x0, y0 + 6, W, 4); px(g, cols[2], x0 + 8, y0, 2, H); px(g, cols[2], x0, y0 + 7, W, 2); }
  else if (kind === 'us') { for (let i = 0; i < 8; i++) px(g, i % 2 ? '#ffffff' : '#b22234', x0, y0 + i * 2, W, 2); px(g, '#3c3b6e', x0, y0, 11, 8); for (let y = 1; y < 8; y += 2) for (let x = 1; x < 11; x += 2) px(g, '#ffffff', x0 + x, y0 + y); }
  else if (kind === 'uk' || kind === 'au') {
    const ux = x0, uy = y0, uw = kind === 'uk' ? W : 13, uh = kind === 'uk' ? H : 8;
    if (kind === 'au') { px(g, '#012169', x0, y0, W, H); for (const [x, y] of [[19, 3], [22, 7], [18, 10], [20, 13], [6, 12]]) { px(g, '#ffffff', x0 + x, y0 + y - 1, 1, 3); px(g, '#ffffff', x0 + x - 1, y0 + y, 3, 1); } }
    px(g, '#012169', ux, uy, uw, uh);
    for (let i = 0; i < uw; i++) { const y = Math.round(i * (uh - 1) / (uw - 1)); px(g, '#ffffff', ux + i, uy + y - 1, 1, 3); px(g, '#ffffff', ux + i, uy + uh - 1 - y - 1, 1, 3); px(g, '#c8102e', ux + i, uy + y, 1, 1); px(g, '#c8102e', ux + i, uy + uh - 1 - y, 1, 1); }
    px(g, '#012169', ux, uy - 1, uw, 1); px(g, '#012169', ux, uy + uh, uw, 1);
    px(g, '#ffffff', ux + Math.floor(uw / 2) - 2, uy, 5, uh); px(g, '#ffffff', ux, uy + Math.floor(uh / 2) - 2, uw, 5); px(g, '#c8102e', ux + Math.floor(uw / 2) - 1, uy, 3, uh); px(g, '#c8102e', ux, uy + Math.floor(uh / 2) - 1, uw, 3);
  }
  else if (kind === 'gr') { for (let i = 0; i < 9; i++) px(g, i % 2 ? '#ffffff' : '#0d5eaf', x0, y0 + Math.round(i * H / 9), W, Math.round((i + 1) * H / 9) - Math.round(i * H / 9)); px(g, '#0d5eaf', x0, y0, 10, 9); px(g, '#ffffff', x0 + 4, y0, 2, 9); px(g, '#ffffff', x0, y0 + 4, 10, 2); }
  else if (kind === 'cl') { px(g, '#ffffff', x0, y0, W, 8); px(g, '#d52b1e', x0, y0 + 8, W, 8); px(g, '#0039a6', x0, y0, 9, 8); px(g, '#ffffff', x0 + 4, y0 + 2, 1, 4); px(g, '#ffffff', x0 + 2, y0 + 3, 5, 2); }
  const cx = x0 + W / 2, cy = y0 + H / 2, disc = (x, y, r, c) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * .6) px(g, c, x + i, y + j); };
  const star = (x, y, c) => { px(g, c, x, y - 2, 1, 5); px(g, c, x - 2, y, 5, 1); px(g, c, x - 1, y - 1, 3, 3); px(g, c, x - 2, y + 2); px(g, c, x + 2, y + 2); };
  ({
    star5: () => { star(x0 + 5, y0 + 4, '#ffde00'); if (name === 'Chine') for (const [x, y] of [[9, 2], [10, 4], [10, 6], [9, 8]]) px(g, '#ffde00', x0 + x, y0 + y); if (name === 'Viêt Nam') { star(cx, cy, '#ffff00'); px(g, '#da251d', x0 + 3, y0 + 2, 5, 6); } },
    chakra: () => { disc(cx, cy, 2, '#000080'); px(g, '#ffffff', cx, cy); },
    crescentW: () => { disc(x0 + 16, cy, 4, '#ffffff'); disc(x0 + 17, cy - 1, 4, '#01411c'); star(x0 + 18, y0 + 6, '#ffffff'); },
    crescentT: () => { disc(x0 + 9, cy, 5, '#ffffff'); disc(x0 + 11, cy, 4, '#e30a17'); star(x0 + 16, cy, '#ffffff'); },
    crescentR: () => { disc(cx, cy, 5, '#d21034'); for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) if (i * i + j * j <= 18) px(g, cx + 2 + i < x0 + 13 ? '#006233' : '#ffffff', cx + 2 + i, cy + j); star(cx + 3, cy, '#d21034'); },
    brazil: () => { for (let j = 0; j < 12; j++) { const w = 22 - Math.abs(j - 5.5) * 3.6; px(g, '#ffdf00', cx - w / 2, y0 + 2 + j, w, 1); } disc(cx, cy, 4, '#002776'); px(g, '#ffffff', cx - 4, cy, 9, 1); },
    redDisc: () => disc(cx - 2, cy, 5, '#f42a41'), sun: () => disc(cx, cy, 5, '#bc002d'), blueDisc: () => { disc(cx, cy, 4, '#0f47af'); star(cx, cy, '#fcdd09'); },
    eagle: () => { disc(cx, cy, 2, '#8a5a2a'); px(g, '#2a7a3a', cx - 2, cy + 3, 5, 1); },
    triangle: () => { for (let j = 0; j < H; j++) px(g, '#ffffff', x0, y0 + j, Math.round(13 - Math.abs(j - 7.5) * 1.7), 1); disc(x0 + 4, cy, 1, '#fcd116'); },
    gold: () => { px(g, '#c09300', cx - 1, cy - 2, 3, 4); },
    leaf: () => { px(g, '#ff0000', cx - 1, cy - 5, 2, 10); px(g, '#ff0000', cx - 4, cy - 2, 8, 4); px(g, '#ff0000', cx - 3, cy - 4, 6, 2); px(g, '#ff0000', cx - 5, cy - 1, 10, 2); },
    starG: () => { for (const [a, b] of [[0, -4], [3, 3], [-4, -1], [4, -1], [-3, 3], [0, -4]].reduce((acc, p, i, arr) => i ? [...acc, [arr[i - 1], p]] : acc, [])) for (let k = 0; k <= 8; k++) px(g, '#006233', cx + a[0] + (b[0] - a[0]) * k / 8, cy + a[1] + (b[1] - a[1]) * k / 8); },
    sphere: () => { disc(x0 + 10, cy, 3, '#ffcc00'); px(g, '#ffffff', x0 + 9, cy - 1, 3, 3); px(g, '#003399', x0 + 10, cy, 1, 1); },
    cross: () => { px(g, '#ffffff', cx - 1, cy - 5, 3, 10); px(g, '#ffffff', cx - 5, cy - 1, 10, 3); },
    sunY: () => { disc(cx, cy, 2, name === 'Argentine' ? '#f6b40e' : '#fec50c'); for (const [i, j] of [[0, -4], [0, 4], [-4, 0], [4, 0], [-3, -3], [3, 3], [-3, 3], [3, -3]]) px(g, name === 'Argentine' ? '#f6b40e' : '#fec50c', cx + i, cy + j); if (name === 'Kazakhstan') for (let j = 0; j < H; j += 2) px(g, '#fec50c', x0 + 2, y0 + j, 1, 1); },
    script: () => { for (let x = 6; x < 21; x += 2) px(g, '#ffffff', x0 + x, y0 + 5 + (x % 4 ? 1 : 0), 1, 2); px(g, '#ffffff', x0 + 6, y0 + 11, 15, 1); },
    soyombo: () => { px(g, '#f9cf02', x0 + 3, y0 + 3, 3, 1); disc(x0 + 4, y0 + 6, 1, '#f9cf02'); px(g, '#f9cf02', x0 + 3, y0 + 9, 3, 5); },
  })[deco]?.();
}
const pmShade = (c, k) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(c.substr(i, 2), 16) * k)))).map(v => v.toString(16).padStart(2, '0')).join('');
const pmHash = s => { let h = 7; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
const PM_VOLC = ['Kilimandjaro', 'Mauna Kea', 'Mont Fuji', 'Teide', 'Etna', 'Puy de Dôme', 'Elbrouz'];
function pmMountain(g, name) {  // ciel, une montagne au profil tiré du nom, neige au sommet (cratère pour les volcans)
  const r = seeded(pmHash(name)), volc = PM_VOLC.includes(name), sky = r() < .5 ? '#7ec8f0' : '#a8d8f8';
  px(g, sky, 1, 1, 26, 16);
  const peak = 3 + Math.floor(r() * 3), px0 = 8 + Math.floor(r() * 12), slopeL = .8 + r() * .7, slopeR = .8 + r() * .7;
  px(g, '#6a8a5a', 1, 13, 26, 4); if (r() < .6) { const h2 = peak + 4; for (let x = 1; x < 27; x++) { const top = h2 + Math.abs(x - (px0 > 14 ? 5 : 22)) * 1.1; if (top < 16) px(g, '#5a6a8a', x, top, 1, 16 - top); } }
  for (let x = 1; x < 27; x++) {
    let top = peak + (x < px0 ? (px0 - x) * slopeL : (x - px0) * slopeR) + (r() < .3 ? 1 : 0); if (volc && Math.abs(x - px0) <= 1) top = peak + 1;
    if (top >= 17) continue; top = Math.round(top);
    px(g, x < px0 ? '#8a7a6a' : '#6a5a4a', x, top, 1, 17 - top);
    if (top < peak + 4) px(g, '#ffffff', x, top, 1, Math.min(3, peak + 4 - top));
  }
  if (volc && name !== 'Puy de Dôme') { px(g, '#4a3a2a', px0 - 1, peak + 1, 3, 1); if (name === 'Etna') { px(g, '#c8c8d0', px0, peak - 2, 2, 2); px(g, '#e0e0e8', px0 + 1, peak - 4, 2, 2); } }
}
function pmRiver(g, name) {  // une vallée vue d'en haut, le fleuve qui serpente selon son nom
  const r = seeded(pmHash(name)), land = ['#5aa84a', '#c8a85a', '#7ab85a'][Math.floor(r() * 3)], a = 2 + r() * 3, f = .25 + r() * .25, ph = r() * 6;
  px(g, land, 1, 1, 26, 16); for (let i = 0; i < 10; i++) px(g, pmShade(land, .8), 1 + Math.floor(r() * 26), 1 + Math.floor(r() * 16), 2, 1);
  for (let x = 1; x < 27; x++) { const y = 9 + Math.sin(x * f + ph) * a; px(g, '#2a6ad8', x, Math.round(y) - 1, 1, 3); px(g, '#7ab8ff', x, Math.round(y) - 1, 1, 1); }
  if (r() < .5) { const x = 4 + Math.floor(r() * 18); px(g, '#8a8a8a', x, 1, 2, 16); }  // un pont
}
const PM_ASTRES = {Soleil: ['#ffd84a', '#ff9a2a', 'rays'], Jupiter: ['#d8b088', '#a86a4a', 'bands'], Saturne: ['#e8d098', '#b8985a', 'ring'], Uranus: ['#9ae8f0', '#6ac0d0', 'ring'], Terre: ['#3a7ad8', '#4aa84a', 'earth'], Mars: ['#d8603a', '#a8402a'],
  Ganymède: ['#a89888', '#786858'], Mercure: ['#9a9a9a', '#6a6a6a'], Lune: ['#d8d8d8', '#a8a8a8'], 'Europe (lune)': ['#e8dcc0', '#a8805a', 'lines'], Triton: ['#e0d0d8', '#a898a8'], Pluton: ['#d8b898', '#f0e8e0'],
  Cérès: ['#8a8a8a', '#5a5a5a'], Vénus: ['#f0d898', '#d8b068'], Titan: ['#e8a84a', '#c8882a'], Neptune: ['#3a5ad8', '#2a3aa8'], Io: ['#f0e05a', '#d8a02a'], Callisto: ['#6a5a4a', '#a8988a']};
function pmAstre(g, name) {
  const [c1, c2, kind] = PM_ASTRES[name] || ['#9a9a9a', '#6a6a6a'], cx = 14, cy = 9, R = 6;
  px(g, '#0b0820', 1, 1, 26, 16); const r = seeded(pmHash(name)); for (let i = 0; i < 12; i++) px(g, '#5a4a8a', 1 + Math.floor(r() * 26), 1 + Math.floor(r() * 16));
  if (kind === 'rays') for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; px(g, '#ffd84a', cx + Math.round(Math.cos(a) * 8), cy + Math.round(Math.sin(a) * 8), 1, 1); }
  if (kind === 'ring') px(g, pmShade(c2, .8), cx - 11, cy, 23, 1);
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i * i + j * j <= R * R + 2) {
    let c = i + j > 3 ? c2 : c1;
    if (kind === 'bands' && (j + 7) % 3 === 0) c = c2; if (kind === 'earth' && (r() < .35)) c = '#4aa84a'; if (kind === 'lines' && (i - j) % 4 === 0) c = c2; if (!kind && r() < .12) c = pmShade(c1, .75);
    px(g, c, cx + i, cy + j);
  }
  if (kind === 'ring') { px(g, c2, cx - 11, cy - 1, 5, 1); px(g, c2, cx + 7, cy - 1, 5, 1); }
}
// animaux : 9 silhouettes de 14 x 9 (agrandies par 2), colorées par animal ; « m » : marque (rayures, taches), « e » : œil
const PM_BEAST = {
  quad: ['..............', '..........bb..', '.........bbbb.', '.bbbbbbbbbbbeb', 'bbbbmbbmbbbbb.', 'b.bbbbmbbbbb..', '..bbbbbbbbb...', '..b.b...b.b...', '..b.b...b.b...'],
  big: ['..............', '...bbbbbbbb...', '..bbbbbbbbbbb.', '.bbbbbbbbbbbeb', '.bbbbbbbbbbbbb', '.bbbbbbbbbbbb.', '.bbbbbbbbbbb..', '.bbb.bbb.bbb..', '.bbb.bbb.bbb..'],
  trunk: ['...bbbbbb.....', '..bbbbbbbbb...', '.bbbbbbbbbbbb.', '.bbbbbbbbbbeb.', '.bbbbbbbbbbbbb', '.bbbbbbbbbb.bb', '.bbbbbbbbbb..b', '.bb.bb.bb.b..b', '.bb.bb.bb.b...'],
  neck: ['...........bb.', '..........bbeb', '..........bb..', '.........bb...', '...bbbbbbbb...', '..bbmbbmbbb...', '..bbbbbmbbb...', '..b.b...b.b...', '..b.b...b.b...'],
  whale: ['..............', '..............', '.....bbbbbbbb.', 'b...bbbbbbbbbb', 'bb.bbbbbbbbbeb', 'bbbbbbbbbbbbbb', 'bb.mmmmmmmmmm.', 'b....mmmmmm...', '..............'],
  bird: ['........bb....', '.......bbeb...', '.......bbbmm..', '..bbbbbbbb....', '.bbbbbbbbb....', '..bbbbbbb.....', '....m..m......', '....m..m......', '...mm.mm......'],
  ape: ['.....bbbb.....', '....bbbbbb....', '....bmemmb....', '....bmmmmb....', '..bbbbbbbbbb..', '.bb.bbbbbb.bb.', '.b..bbbbbb..b.', '....bb..bb....', '...bbb..bbb...'],
  small: ['..............', '..............', '..........bb..', '.........bbbb.', '...bbbbbbbbeb.', '..bbbbbbbbbbbm', '.bbbbbbbbbbb..', '..b.b...b.b...', '..............'],
  shell: ['..............', '......bbbb....', '....bbmbbmbb..', '...bmbbbbbbmb.', '...bbbbmbbbbb.', '..mbbbbbbbbbmm', '.mmmmmmmmmmmmme', '..m.m....m.m..', '..............'],
  snail: ['..............', '.....bbbb.....', '....bmmmmb....', '...bmbbbbmb..m', '...bmbmmbmb.m.', '...bmbbbbmbm..', '...bbbbbbbbm..', 'mmmmmmmmmmmmme', '..............'],
  bee: ['..............', '....ww..ww....', '....www.www...', '....wwwwww....', '..bmbmbmbbb...', '.bbmbmbmbbbe..', '..bmbmbmbbb...', '...m.m..m.....', '..............'],
  fish: ['..............', '......bbbb....', '.b..bbbbbbbb..', '.bbbbbbbbbbbb.', '.bbbbbbbbbbbeb', '.bbbmmmmmmmmm.', '.b...mmmmmm...', '..............', '..............'],
  human: ['......bbb.....', '......beb.....', '......bbb.....', '....mmmmm.....', '...m.mmm.m....', '..m..mmm..m...', '.....m..m.....', '....m....m....', '...m......m...'],
};
const PM_ANIMALS = {  // [silhouette, corps, marque]
  'Baleine bleue': ['whale', '#3a6ab8', '#a8c8e8'], 'Baleine boréale': ['whale', '#3a4a6a', '#e8e8f0'], "Éléphant d'Afrique": ['trunk', '#8a8a92', '#6a6a72'], 'Éléphant': ['trunk', '#8a8a92', '#6a6a72'],
  'Rhinocéros blanc': ['big', '#a8a8a0', '#8a8a82'], 'Hippopotame': ['big', '#8a6a7a', '#6a5060'], 'Girafe': ['neck', '#e8b04a', '#8a5a2a'], 'Vache': ['quad', '#ffffff', '#2a2a2a'], 'Cheval': ['quad', '#8a5a2a', '#8a5a2a'],
  'Cheval au galop': ['quad', '#6a3a1a', '#6a3a1a'], 'Ours polaire': ['big', '#f0f0f0', '#d8d8d8'], 'Ours brun': ['big', '#7a4a2a', '#6a3a1a'], 'Grizzly': ['big', '#8a5a3a', '#7a4a2a'], 'Tigre': ['quad', '#ff8a2a', '#2a1a0a'],
  'Lion': ['quad', '#d8a04a', '#a86a2a'], 'Gorille': ['ape', '#3a3a3a', '#5a5a5a'], 'Chimpanzé': ['ape', '#4a3a2a', '#c8a07a'], 'Autruche': ['bird', '#2a2a2a', '#e8b8a0'], 'Panda géant': ['big', '#ffffff', '#1a1a1a'],
  'Kangourou roux': ['quad', '#c86a3a', '#c86a3a'], 'Loup': ['quad', '#8a8a92', '#6a6a72'], 'Manchot empereur': ['bird', '#1a1a2a', '#ffcf3a'], 'Renard': ['quad', '#e8742a', '#ffffff'], 'Chat': ['small', '#d8a060', '#a86a2a'],
  'Chien': ['quad', '#c89060', '#8a5a2a'], 'Lapin': ['small', '#d8c8b8', '#ffb0b0'], 'Hérisson': ['small', '#7a5a3a', '#4a3a2a'], 'Souris': ['small', '#9a9aa2', '#ffb0b0'], 'Hamster': ['small', '#e8b070', '#ffffff'],
  'Écureuil': ['small', '#c8642a', '#e8a060'], 'Faucon pèlerin (en piqué)': ['bird', '#5a6a8a', '#ffcf3a'], 'Guépard': ['quad', '#e8c060', '#2a1a0a'], "Antilope d'Amérique": ['quad', '#c8945a', '#ffffff'],
  'Lièvre': ['small', '#a8885a', '#ffffff'], 'Zèbre': ['quad', '#ffffff', '#1a1a1a'], 'Usain Bolt': ['human', '#6a4028', '#ffcf3a'], 'Poule': ['bird', '#ffffff', '#ffb02a'], 'Tortue terrestre': ['shell', '#6a8a3a', '#8a6a3a'],
  'Tortue des Galápagos': ['shell', '#5a6a3a', '#7a6a4a'], 'Paresseux': ['ape', '#a8886a', '#5a4a3a'], 'Escargot': ['snail', '#c8945a', '#a8a090'], 'Requin du Groenland': ['fish', '#5a6a7a', '#c8d0d8'], 'Ara': ['bird', '#ff3a2a', '#3a7ad8'],
  'Abeille ouvrière': ['bee', '#ffcf3a', '#1a1a1a'],
};
function pmBeast(g, name) {
  const [kind, body, mark] = PM_ANIMALS[name] || ['quad', '#8a7a6a', '#6a5a4a'], rows = PM_BEAST[kind], r = seeded(pmHash(name));
  px(g, ['#a8d8a0', '#c8e0f0', '#e8d8b0'][kind === 'whale' || kind === 'fish' ? 1 : r() < .5 ? 0 : 2], 1, 1, 26, 16); if (kind === 'whale' || kind === 'fish') px(g, '#5a9ad8', 1, 1, 26, 16); else px(g, '#6aa85a', 1, 15, 26, 2);
  rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = {b: body, m: mark, e: '#1a1018', w: '#e8f8ff'}[row[i]]; if (c) px(g, c, i * 2, j * 2 - 1, 2, 2); } });
}
// monuments : silhouettes de 14 x 9 (agrandies par 2) devant le ciel
const PM_MONU = {
  eiffel: ['......b.......', '......b.......', '.....bbb......', '.....b.b......', '....bbbbb.....', '....b...b.....', '...bb...bb....', '..bbbbbbbbb...', '.bb.......bb..'],
  sky: ['......b.......', '......b.......', '.....bbb......', '.....bwb......', '.....bbb......', '.....bwb......', '....bbbbb.....', '....bwbwb.....', '....bbbbb.....'],
  twin: ['...b....b.....', '...b....b.....', '..bbb..bbb....', '..bwb..bwb....', '..bbbbbbbb....', '..bwb..bwb....', '..bbb..bbb....', '..bwb..bwb....', '..bbb..bbb....'],
  pyr: ['..............', '..............', '......bb......', '.....bbbb.....', '....bbbbbb....', '...bbbbbbbb...', '..bbbbbbbbbb..', '.bbbbbbbbbbbb.', 'bbbbbbbbbbbbbb'],
  arch: ['..............', '..bbbbbbbbbb..', '..bwbwbwbwbb..', '..bbbbbbbbbb..', '..bbb....bbb..', '..bb......bb..', '..bb......bb..', '..bb......bb..', '..bb......bb..'],
  dome: ['......b.......', '.....bbb......', '....bbbbb.....', '...bbbbbbb....', 'b..bbbbbbb..b.', 'b.bbbbbbbbb.b.', 'b.bbwbbbwbb.b.', 'bbbbwbbbwbbbb.', 'bbbbbbbbbbbbb.'],
  statue: ['....w.........', '....b.........', '....bb........', '.....bb.......', '.....bbb......', '.....bbb......', '.....bbb......', '....bbbbb.....', '...bbbbbbb....'],
  christ: ['......b.......', '.bbbbbbbbbbb..', '......b.......', '.....bbb......', '.....bbb......', '.....bbb......', '.....bbb......', '....bbbbb.....', '..bbbbbbbbb...'],
  church: ['..bb....bb....', '..bb....bb....', '..bwb..bwb....', '..bbbbbbbb....', '..bbbbwbbb....', '..bbbwwwbb....', '..bbbwwwbb....', '..bbbwwwbb....', '..bbbbbbbb....'],
  lean: ['.......bbb....', '......bwbw....', '......bbbb....', '.....bwbw.....', '.....bbbb.....', '....bwbw......', '....bbbb......', '...bwbw.......', '...bbbb.......'],
  ring: ['..............', '..............', '..bbbbbbbbbb..', '.bwbwbwbwbwbb.', '.bbbbbbbbbbbb.', '.bwbwbwbwbwbb.', '.bbbbbbbbbbbb.', '.bwbwbwbwbwbb.', '.bbbbbbbbbbbb.'],
  atom: ['......bb......', '......bb......', '..bb..b...bb..', '..bb.b.b..bb..', '.....bbbb.....', '..bb.b.b..bb..', '..bb..b...bb..', '......bb......', '.....bbbb.....'],
  clock: ['......b.......', '.....bbb......', '.....bbb......', '.....bwb......', '.....bbb......', '.....bbb......', '.....bbb......', '.....bbb......', '....bbbbb.....'],
  boy: ['..............', '..............', '..............', '......bb......', '......bb......', '.....bbbb.....', '......bb......', '.....bwwb.....', '....bbbbbb....'],
};
const PM_MONUS = {'Burj Khalifa': ['sky', '#a8b8c8'], 'Tokyo Skytree': ['sky', '#d8e0e8'], 'Tour CN': ['clock', '#c8c0b8'], 'Tours Petronas': ['twin', '#b8c0c8'], 'Empire State Building': ['sky', '#c8b898'], 'Tour Eiffel': ['eiffel', '#8a5a3a'],
  'Tour Montparnasse': ['sky', '#3a3a4a'], 'Sagrada Família': ['church', '#c8a878'], 'Pyramide de Khéops': ['pyr', '#e0c080'], 'Atomium': ['atom', '#c8d0d8'], 'Big Ben': ['clock', '#c8a868'], 'Statue de la Liberté': ['statue', '#6ab8a0'],
  'Taj Mahal': ['dome', '#f0f0f0'], 'Notre-Dame de Paris': ['church', '#c8c0a8'], 'Tour de Pise': ['lean', '#f0e8d8'], 'Arc de Triomphe': ['arch', '#e0d8c0'], 'Colisée': ['ring', '#d8a878'], 'Christ Rédempteur': ['christ', '#e8e8e0'],
  'Manneken-Pis': ['boy', '#8a6a4a'], 'Beffroi de Lille': ['clock', '#b85a3a']};
function pmMonument(g, name) {
  const [kind, col] = PM_MONUS[name] || ['clock', '#a8a8a8'], rows = PM_MONU[kind], r = seeded(pmHash(name)), dusk = r() < .4;
  px(g, dusk ? '#f0a87a' : '#8ac8f0', 1, 1, 26, 16); px(g, dusk ? '#d8786a' : '#b8e0f8', 1, 1, 26, 4); px(g, '#7a9a6a', 1, 16, 26, 1);
  rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = {b: col, w: dusk ? '#ffe08a' : '#3a4a6a'}[row[i]]; if (c) px(g, row[i] === 'b' && i * 2 > 13 ? pmShade(col, .8) : c, i * 2, j * 2 - 1, 2, 2); } });
}
const pmPics = new Map();
function pmPic(card) {
  const k = card.cat + '|' + card.it[0]; let c = pmPics.get(k); if (c) return c;
  c = el('canvas'); c.width = 28; c.height = 18; const g = c.getContext('2d');
  px(g, '#1a1018', 0, 0, 28, 18);
  const name = card.it[0], cat = card.cat, draw = {pays: pmFlag, superficie: pmFlag, montagnes: pmMountain, fleuves: pmRiver, astres: pmAstre, animaux: pmBeast, vitesse: pmBeast, longevite: pmBeast, monuments: pmMonument}[cat];
  if (draw) { g.save(); g.beginPath(); g.rect(1, 1, 26, 16); g.clip(); draw(g, name); g.restore(); } else { px(g, '#2a2236', 1, 1, 26, 16); g.drawImage(PM_ICON[PM_CATS[cat].icon], 8, 3); }
  pmPics.set(k, c); return c;
}
const pms = gstore('plusmoins', {games: 0, right: 0, cat: 'tout'});
let pm = null, pmac = null;
const pmFmt = v => v >= 1e6 ? (v / 1e6).toLocaleString('fr-FR', {maximumFractionDigits: 1}) + ' million' + (v >= 2e6 ? 's' : '') : v.toLocaleString('fr-FR', {maximumFractionDigits: v < 1 ? 2 : 1});
const pmPlayable = (cat, a, b) => { const c = PM_CATS[cat]; return c.years ? Math.abs(a[1] - b[1]) >= c.years : Math.max(a[1], b[1]) / Math.min(a[1], b[1]) >= c.ratio; };
function pmBeep(f, d, type = 'square', slide = 0, vol = .04) { try { pmac ??= new AudioContext(); const o = pmac.createOscillator(), g = pmac.createGain(), t = pmac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(pmac.destination); o.start(t); o.stop(t + d); } catch {} }
// la carte suivante : même catégorie que la gauche (ou une au hasard en « tout mélangé »), jamais une déjà vue, toujours assez différente pour qu'il y ait une vraie réponse
function pmDraw1(left, again = 0) {
  const r = pm.rnd, cats = pm.cat === 'tout' ? Object.keys(PM_CATS) : [pm.cat], cat = left ? left.cat : cats[Math.floor(r() * cats.length)];
  const pool = PM_CATS[cat].items.filter(it => !pm.seen.has(cat + it[0]) && (!left || pmPlayable(cat, left.it, it)));
  if (!pool.length) { if (!left || again) return null; pm.seen = new Set([left.cat + left.it[0]]); return pmDraw1(left, 1); }
  const it = pool[Math.floor(r() * pool.length)]; pm.seen.add(cat + it[0]); return {cat, it};
}
// une nouvelle partie garde le même objet : la boucle du jeu (gameLoop) continue de tourner dessus
const renew = (old, o) => { if (!old) return o; for (const k of Object.keys(old)) if (k !== 'raf') delete old[k]; return Object.assign(old, o); };
function pmNew(cat = pms.cat) {
  const g = pm?.g;
  pm = renew(pm, {g, mode: 'ready', tick: 0, seenT: 0, seen: new Set(), cat, streak: 0, dead: 0, record: false, hist: [], rnd: seeded(Date.now() % 1e9), reveal: 0, slide: 0, guess: 0, ok: null, pops: []});
  pm.left = pmDraw1(null); pm.right = pmDraw1(pm.left); pmInfo();
}
function pmGuess(dir) {  // dir : 1 plus, -1 moins
  if (pm.mode === 'ready') pm.mode = 'play';
  if (pm.mode !== 'play' || pm.reveal) return;
  pm.guess = dir; pm.ok = Math.sign(pm.right.it[1] - pm.left.it[1]) === dir; pm.reveal = 1; pm.mode = 'reveal'; pm.hist.push(pm.ok ? (dir > 0 ? '▲' : '▼') : '✗');
  pmBeep(330, .05, 'square', 0, .03);
}
function pmUpdate() {
  for (const p of pm.pops) { p.t--; p.y -= .4; } pm.pops = pm.pops.filter(p => p.t > 0);
  if (pm.mode === 'over') { pm.dead++; return; }
  if (pm.mode === 'reveal') {
    if (pm.reveal < 50) { pm.reveal++; if (pm.reveal === 50) { if (pm.ok) { pm.streak++; pm.pops.push({text: '+1', x: 146, y: 40, t: 30}); pmBeep(660, .08); setTimeout(() => pmBeep(990, .14), 80); } else { pm.mode = 'over'; pm.dead = 0; pms.games++; pms.right += pm.streak; pm.record = best('plusmoins-' + pm.cat, pm.streak); best('plusmoins', pm.streak); saveGames(); pmInfo(); pmBeep(200, .5, 'sawtooth', 70, .06); } } return; }
    if (++pm.slide >= 24) {
      pm.left = pm.right;
      // en « tout mélangé », on change de catégorie toutes les 5 bonnes réponses
      if (pm.cat === 'tout' && pm.streak % 5 === 0) { const was = pm.left.cat; let n; do n = pmDraw1(null); while (n.cat === was); pm.left = n; }
      pm.right = pmDraw1(pm.left); pm.slide = 0; pm.reveal = 0; pm.mode = 'play';
    }
  }
}
// une carte : cadre en pixels, icône de la catégorie, nom sur deux lignes au plus, puis la valeur (cachée par « ? » tant qu'on n'a pas répondu)
function pmCard(g, card, x, y, shown, count, frame) {
  const w = 84, h = 104, cat = PM_CATS[card.cat];
  px(g, '#1a1018', x - 1, y - 1, w + 2, h + 2); px(g, frame || '#f0e8d8', x, y, w, h); px(g, '#2a2236', x + 2, y + 2, w - 4, h - 4); px(g, '#3a3046', x + 2, y + 2, w - 4, 1);
  g.drawImage(pmPic(card), x + w / 2 - 14, y + 4);
  pxFont(g, cat.name.toUpperCase(), x + w / 2, y + 32, '#a898b8', 8, 'center');
  const words = card.it[0].split(' '), lines = [''];
  for (const wd of words) { const t = (lines[lines.length - 1] + ' ' + wd).trim(); if (t.length > 13 && lines[lines.length - 1]) lines.push(wd); else lines[lines.length - 1] = t; }
  lines.slice(0, 3).forEach((l, i) => pxFont(g, l, x + w / 2, y + 45 + i * 10, '#ffffff', 8, 'center'));
  const vy = y + 80;
  if (shown) { const v = cat.years ? String(Math.round(card.it[1] * count)) : pmFmt(count >= 1 ? card.it[1] : +(card.it[1] * count).toPrecision(3)); pxFont(g, v, x + w / 2, vy, '#ffd84a', v.length > 9 ? 8 : 12, 'center'); pxFont(g, cat.years ? '' : cat.unit.replace(/^millions? /, ''), x + w / 2, vy + 12, '#a898b8', 8, 'center'); }
  else pxFont(g, '?', x + w / 2, vy + 2, '#5a4e6a', 16, 'center');
}
function pmDraw() {
  const g = pm.g, {W, H, HUD} = PM;
  for (; pm.seenT < pm.tick; pm.seenT++) if (pm.mode !== 'play') pmUpdate();
  g.imageSmoothingEnabled = false;
  px(g, '#140e1a', 0, 0, W, H); for (let y = HUD; y < H; y += 8) for (let x = (y >> 3) % 2 * 8; x < W; x += 16) px(g, '#1a1422', x, y, 8, 8);
  const sl = pm.slide / 24, ease = sl * sl * (3 - 2 * sl);
  if (pm.left && pm.right) {
    pmCard(g, pm.left, Math.round(8 - ease * 100), HUD + 10, true, 1);
    const cnt = Math.min(1, pm.reveal / 40), fr = pm.reveal >= 50 || pm.mode === 'over' ? (pm.ok ? '#7ee07a' : '#ff4a3a') : null;
    pmCard(g, pm.right, Math.round(100 - ease * 92), HUD + 10, pm.reveal > 0 || pm.mode === 'over', pm.mode === 'over' ? 1 : 1 - (1 - cnt) ** 3, fr);
    if (pm.mode === 'play' || pm.mode === 'ready') {  // les deux boutons, dessinés sous la carte de droite
      for (const [dir, label, by] of [[1, '↑ PLUS', HUD + 118], [-1, '↓ MOINS', HUD + 132]]) { const hot = pm.hover === dir; px(g, '#1a1018', 99, by - 1, 86, 13); px(g, hot ? '#ffd84a' : '#3a3046', 100, by, 84, 11); pxFont(g, label, 142, by + 9, hot ? '#1a1018' : '#ffffff', 8, 'center'); }
      pxFont(g, PM_CATS[pm.left.cat].ask + ' ?', 50, HUD + 128, '#a898b8', 8, 'center');
    }
    if (pm.slide === 0 && pm.reveal && !(pm.mode === 'over' && pm.dead > 70)) pxFont(g, pm.ok ? (pm.right.it[1] > pm.left.it[1] ? 'PLUS !' : 'MOINS !') : 'RATÉ !', 142, HUD + 128, pm.ok ? '#7ee07a' : '#ff4a3a', 12, 'center');
  }
  for (const p of pm.pops) pxFont(g, p.text, p.x, p.y, '#7ee07a', 12, 'center');
  px(g, '#0e0a12', 0, 0, W, HUD);
  pxFont(g, 'Série ' + pm.streak, 4, 9, '#ffffff', 8); pxFont(g, pm.cat === 'tout' ? 'Tout mélangé' : PM_CATS[pm.cat].name, W - 4, 9, '#a898b8', 8, 'right');
  if (pm.mode === 'over' && pm.dead > 70) {
    const y = PM.HUD + 116; px(g, '#1a1018', 3, y, W - 6, H - y - 2); px(g, '#ff4a3a', 4, y + 1, W - 8, 1); px(g, '#241a2e', 4, y + 2, W - 8, H - y - 5);
    pxFont(g, 'PERDU ! Série de ' + pm.streak, W / 2, y + 13, '#ff6a5a', 8, 'center');
    pxFont(g, (pm.record ? 'NOUVEAU RECORD !' : 'Record ' + (games.best['plusmoins-' + pm.cat] || 0)) + (pm.dead > 90 ? ' · Espace : rejouer' : ''), W / 2, y + 25, pm.record ? '#ffd84a' : '#b8b0c8', 8, 'center');
  }
  if (pm.tick % 20 === 0 && pm.left) g.canvas.setAttribute('aria-label', 'Plus ou Moins : ' + (pm.mode === 'over' ? 'perdu, série de ' + pm.streak : 'série de ' + pm.streak + '. ' + pm.left.it[0] + ' : ' + pmFmt(pm.left.it[1]) + ' ' + PM_CATS[pm.left.cat].unit + '. ' + pm.right.it[0] + ' : plus ou moins ?'));
}
function pmInfo() {
  setTimeout(pmTrophies);
  $('pmStats').replaceChildren(...[['Meilleure série', games.best.plusmoins || 0], ['Dans cette catégorie', games.best['plusmoins-' + (pm?.cat || pms.cat)] || 0], ['Parties', pms.games], ['Bonnes réponses', pms.right]].flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));
  pmCatRow?.querySelectorAll('button').forEach(b => b.classList.toggle('main', b.dataset.cat === (pm?.cat || pms.cat)));
}
// le choix de la catégorie, sous le bouton « nouvelle partie »
const pmCatRow = el('div', 'row'); pmCatRow.style.flexWrap = 'wrap';
for (const [k, name] of [['tout', 'Tout mélangé'], ...Object.entries(PM_CATS).map(([k, c]) => [k, c.name])]) { const b = el('button', 'btn', name); b.dataset.cat = k; b.onclick = () => { pms.cat = k; saveGames(); pmNew(k); b.blur(); }; pmCatRow.append(b); }
$('pmNew').closest('.row').after(pmCatRow);
document.addEventListener('keydown', e => {
  if (!view.classList.contains('on') || !pm || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key;
  if (['ArrowUp', 'ArrowRight', '+', 'z', 'w'].includes(k)) { e.preventDefault(); pmGuess(1); }
  else if (['ArrowDown', 'ArrowLeft', '-', 's'].includes(k)) { e.preventDefault(); pmGuess(-1); }
  else if ((k === ' ' || k === 'Enter') && pm.mode === 'over' && pm.dead > 90) { e.preventDefault(); pmNew(pm.cat); }
});
{ const cv = $('pmCanvas'), at = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * PM.W, y: (e.clientY - r.top) / r.height * PM.H}; };
  const btn = p => p.x >= 100 && p.x < 184 ? (p.y >= PM.HUD + 118 && p.y < PM.HUD + 129 ? 1 : p.y >= PM.HUD + 132 && p.y < PM.HUD + 143 ? -1 : 0) : 0;
  cv.onpointermove = e => { if (pm) pm.hover = btn(at(e)); };
  cv.onpointerleave = () => { if (pm) pm.hover = 0; };
  cv.onpointerdown = e => { e.preventDefault(); if (!pm) return; if (pm.mode === 'over') { if (pm.dead > 90) pmNew(pm.cat); return; } const d = btn(at(e)); if (d) pmGuess(d); }; }
$('pmNew').onclick = () => { pmNew(pm?.cat || pms.cat); $('pmNew').blur(); };
// le score à coller ailleurs : la catégorie, la série, et les réponses en flèches (sans les noms, pour ne rien dévoiler)
const pmShareText = () => { const cat = pm.cat === 'tout' ? 'Tout mélangé' : PM_CATS[pm.cat].name, b = games.best['plusmoins-' + pm.cat] || 0, h = pm.hist.join('');
  return 'Plus ou Moins (NeoDex) · ' + cat + ' : ' + (pm.mode === 'over' ? 'série de ' + pm.streak : 'record ' + b) + (pm.mode === 'over' && pm.record ? ' (nouveau record)' : '') + (h && pm.mode === 'over' ? '\n' + (h.length > 40 ? '…' + h.slice(-40) : h) : ''); };
$('pmShare').onclick = () => { $('pmShare').blur(); navigator.clipboard.writeText(pmShareText()).then(() => toast('Score copié'), () => toast('Impossible de copier', true)); };
$('pmFs').onclick = () => { $('pmFs').blur(); try { document.fullscreenElement ? document.exitFullscreen() : $('pmCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
$('pmCanvas').__pm = {st: () => pm, pic: c => pmPic(c), cats: PM_CATS, share: () => pmShareText()};
{  // vérification : chaque catégorie a assez de cartes, pas de doublon, et une partie de 200 cartes ne propose que des paires jouables (jamais d'égalité)
  let ok = true; const bad = [];
  for (const [k, c] of Object.entries(PM_CATS)) { if (c.items.length < 15 || new Set(c.items.map(i => i[0])).size !== c.items.length) { ok = false; bad.push(k); } }
  const keep = pm; pm = null;
  for (const cat of ['tout', ...Object.keys(PM_CATS)]) { pmNew(cat); for (let i = 0; i < 200; i++) { if (!pm.right || !pmPlayable(pm.left.cat, pm.left.it, pm.right.it) || pm.left.it[1] === pm.right.it[1]) { ok = false; bad.push(cat + ' ' + i); break; } pm.left = pm.right; pm.right = pmDraw1(pm.left); } }
  // chaque pays a son drapeau, chaque animal sa silhouette, chaque monument et chaque astre son dessin
  for (const [cat, table] of [['pays', PM_FLAGS], ['superficie', PM_FLAGS], ['animaux', PM_ANIMALS], ['vitesse', PM_ANIMALS], ['longevite', PM_ANIMALS], ['monuments', PM_MONUS], ['astres', PM_ASTRES]])
    for (const [name] of PM_CATS[cat].items) if (!table[name]) { ok = false; bad.push('image : ' + name); }
  console.assert(ok, 'plusmoins', bad);
  pm = keep;
}
// les trophées, tirés des statistiques et des records gardés (aussi à l'ouverture : ce qui a été fait avant compte)
function pmTrophies() {
  const b = games.best.plusmoins || 0, cats = Object.keys(PM_CATS).filter(k => games.best['plusmoins-' + k] >= 5).length, sig = [b, pms.games, pms.right, cats].join(); if (sig === pmTrophies.sig) return; pmTrophies.sig = sig;
  trophyRecord('serie', b || null); trophyRecord('bonnes', pms.right || null);
  if (pms.games >= 1) trophy('premier'); if (b >= 10) trophy('serie10'); if (b >= 25) trophy('serie25'); if (b >= 50) trophy('serie50');
  if (pms.right >= 500) trophy('cinq-cents'); if (cats >= 5) trophy('categories');
}
ctx.onOpen(() => {
  if (!pm || !pm.g) { pmNew(); pm.g = $('pmCanvas').getContext('2d'); }
  gameLoop(pm, 'plusmoins', pmUpdate, pmDraw); pmInfo();
});
}
