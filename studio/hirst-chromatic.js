/* Original DAVYLAB art-direction previews; no copyrighted artwork assets are embedded. */
const FALLBACK_VARIANT = 'spots';

export function getHirstVariant(profile, id) {
  const variants = profile?.artPalette?.variants || [];
  return variants.find(v => v.id === id) || variants.find(v => v.id === profile?.artPalette?.default) || null;
}

export function renderHirstVariantButtons(project, profile, safe) {
  const variants = profile?.artPalette?.variants || [];
  return '<div class="hirst-inspector"><span class="control-label">艺术色系 · 4 个方向</span><div class="hirst-variant-select">' +
    variants.map(v => '<button type="button" data-action="hirst-variant" data-variant="' + safe(v.id) + '" class="hirst-variant-button ' +
      ((project.chromaticVariant || FALLBACK_VARIANT) === v.id ? 'is-active' : '') + '" aria-pressed="' +
      ((project.chromaticVariant || FALLBACK_VARIANT) === v.id) + '">' +
      '<span class="hirst-small-dots" aria-hidden="true">' +
      v.colors.slice(0, 4).map(c => '<i style="background:' + c + '"></i>').join('') +
      '</span><span>' + safe(v.name) + '</span></button>').join('') +
    '</div><p class="inspector-note">受艺术作品启发的原创界面配色，非原作精确取色；切换立即更新画布与导出色板。</p></div>';
}

export function renderHirstCanvas(project, profile, safe) {
  const v = getHirstVariant(profile, project.chromaticVariant);
  if (!v) return '<p>色板数据不可用</p>';
  const c = v.colors;
  const vars = [
    '--sample-accent:' + project.accent,
    '--sample-paper:' + project.canvas,
    '--sample-ink:' + project.ink,
    '--sample-radius:' + Number(project.radius) + 'px',
    '--sample-gap:' + Number(project.density) + 'px',
    ...c.map((hex, i) => '--hirst-c' + (i + 1) + ':' + hex)
  ].join(';');
  const dots = Array.from({length: 42}, (_, i) =>
    '<i style="background:' + c[(i * 7 + Math.floor(i / 6) * 3) % c.length] + '"></i>').join('');
  const splashes = Array.from({length: 48}, (_, i) => {
    const x = 7 + (i * 43 + i * i * 3) % 85;
    const y = 8 + (i * 23 + i * i * 7) % 80;
    const size = 5 + (i * 7) % 16;
    return '<i style="--x:' + x + '%;--y:' + y + '%;--s:' + size + 'px;background:' + c[i % c.length] + '"></i>';
  }).join('');
  const art = v.id === 'spin'
    ? '<div class="hirst-artwork hirst-art-spin" aria-label="原创离心彩色抽象图"><div class="hirst-spin-disc"></div><div class="hirst-spin-center"></div></div>'
    : v.id === 'blossom'
      ? '<div class="hirst-artwork hirst-art-blossom" aria-label="原创粉蓝叠彩抽象图"><svg viewBox="0 0 400 340" fill="none" aria-hidden="true"><path d="M-25 320C80 270 143 227 191 48M132 249C192 208 255 168 395 190M189 143C244 127 305 96 354 -20M64 290C120 286 160 301 201 329" stroke="#233C58" stroke-width="10" stroke-linecap="round"/></svg>' + splashes + '</div>'
      : v.id === 'butterfly'
        ? '<div class="hirst-artwork hirst-art-butterfly" aria-label="原创镜面对称几何彩图"><div class="hirst-butterfly-wing left"><i></i><i></i><i></i></div><div class="hirst-butterfly-wing right"><i></i><i></i><i></i></div><div class="hirst-butterfly-axis"></div></div>'
        : '<div class="hirst-artwork hirst-art-spots" aria-label="原创精确色点网格">' + dots + '</div>';
  return '<div id="mockApp" class="mock-app mock-hirst hirst-theme-' + safe(v.id) + '" style="' + safe(vars) + '">' +
    '<div class="hirst-header"><strong>chroma<span>.</span></strong><nav aria-label="样例导航"><span>Explore</span><span>Collections</span><span>Studio</span></nav><span class="hirst-header-signature">BY DAVYLAB</span></div>' +
    '<div class="hirst-content"><div class="hirst-copy"><span class="hirst-eyebrow">ART DIRECTION / ' + safe(v.nameEn).toUpperCase() + '</span>' +
    '<h2>Color is<br><em>a language.</em></h2><p>为「' + safe(project.name) + '」探索的 ' + safe(v.name) + ' 色彩方向。以艺术语言启发原创的数字产品，而非临摹作品。</p>' +
    '<div class="hirst-tags"><span>秩序</span><span>对比</span><span>流动</span></div>' +
    '<div class="hirst-palette-strip" role="group" aria-label="当前配色">' +
    c.map((hex,i) => '<span title="' + hex + '" aria-label="色板' + (i + 1) + ' ' + hex + '" style="background:' + hex + '"></span>').join('') + '</div>' +
    '<span class="hirst-work-ref">灵感作品：' + safe(v.work) + '</span></div><div class="hirst-art-frame">' + art +
    '<div class="hirst-frame-label"><b>' + safe(v.nameEn) + '</b><small>ORIGINAL STUDY · ' + safe(v.id.toUpperCase()) + '</small></div></div></div>' +
    '<div class="hirst-bottom"><span>COLOUR STUDIES / 2026</span><span>Inspired by art, designed for products.</span></div></div>';
}
