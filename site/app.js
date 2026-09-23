// 大模型智能排行榜 —— 基于 Artificial Analysis 数据
const AA = 'https://artificialanalysis.ai';
const tbody = document.getElementById('tbody');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');
const tabsEl = document.getElementById('tabs');
const updatedEl = document.getElementById('updated');

let MODELS = [];
let filter = 'all';
let query = '';
let sortKey = 'rank';
let sortDir = 1; // 1 asc, -1 desc
const MAX_II = 60;

const fmtM = v => v == null ? '—' : (v / 1e6 >= 1 ? (v / 1e6).toFixed(v % 1e6 ? 1 : 0) + 'M' : (v / 1e3).toFixed(0) + 'K');
const fmtPrice = v => v == null ? '—' : '$' + (v < 1 ? v.toFixed(2) : v.toFixed(1));
const fmtDate = s => s || '—';

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function visible() {
  let list = MODELS.filter(m =>
    (filter === 'all' || (filter === 'open') === m.isOpenWeights) &&
    (!query || (m.name + ' ' + m.creator).toLowerCase().includes(query))
  );
  if (sortKey === 'rank') return list;
  const dir = sortDir;
  return [...list].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') return va.localeCompare(vb) * dir;
    return (va - vb) * dir;
  });
}

function render() {
  const list = visible();
  const frag = document.createDocumentFragment();
  list.forEach((m, i) => {
    const rank = i + 1;
    const tr = document.createElement('tr');
    const logo = m.creatorLogo
      ? `<img class="logo" src="${AA}${esc(m.creatorLogo)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;logo-fallback&quot; style=&quot;background:${esc(m.creatorColor)}&quot;></span>'">`
      : `<span class="logo-fallback" style="background:${esc(m.creatorColor)}"></span>`;
    tr.innerHTML = `
      <td class="num rank ${rank <= 3 ? 'top' : ''}">${rank}</td>
      <td><div class="model-cell">${logo}
        <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.name)}</a>
        ${m.isOpenWeights ? '<span class="badge-open">开源</span>' : ''}
      </div></td>
      <td class="muted">${esc(m.creator)}</td>
      <td class="num col-ii"><div class="ii-cell">
        <span class="ii-bar-bg"><span class="ii-bar" style="width:${Math.min(100, m.ii / MAX_II * 100)}%"></span></span>
        <span class="ii-val">${m.ii.toFixed(1)}</span>
      </div></td>
      <td class="num">${m.outputSpeed ?? '—'}</td>
      <td class="num">${m.latency != null ? m.latency : '—'}</td>
      <td class="num">${fmtPrice(m.price)}</td>
      <td class="num">${fmtM(m.contextWindow)}</td>
      <td class="num muted">${fmtDate(m.releaseDate)}</td>`;
    frag.appendChild(tr);
  });
  tbody.replaceChildren(frag);
  countEl.textContent = `共 ${list.length} 个模型 · 智能指数为 Artificial Analysis Intelligence Index（10 项评测综合分，越高越好）· 速度/延迟/价格为推理平台中位数 · 混合价格按 7:2:1 输入输出比计算`;
}

// 事件
searchEl.addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); render(); });
tabsEl.addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  tabsEl.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === btn));
  filter = btn.dataset.filter;
  render();
});
document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.key;
    if (sortKey === key) { sortDir *= -1; } else { sortKey = key; sortDir = (key === 'rank' || key === 'name' || key === 'creator' || key === 'releaseDate') ? 1 : -1; }
    document.querySelectorAll('th.sortable').forEach(t => t.classList.remove('sorted-asc', 'sorted-desc'));
    th.classList.add(sortDir === 1 ? 'sorted-asc' : 'sorted-desc');
    render();
  });
});

fetch('data.json').then(r => r.json()).then(data => {
  MODELS = data;
  const dates = MODELS.map(m => m.releaseDate).filter(Boolean).sort();
  updatedEl.textContent = new Date().toISOString().slice(0, 10);
  render();
});
