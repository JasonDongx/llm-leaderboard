// 大模型排行榜 Top 20 —— AA 智能榜 + LMArena WebDev Arena
const AA = 'https://artificialanalysis.ai';
const LMARENA = 'https://lmarena.ai/leaderboard/webdev';
const board = document.getElementById('board');
const updatedEl = document.getElementById('updated');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const footnoteEl = document.getElementById('footnote');
const TOP_N = 20;

const TABS = {
  ii: {
    h1: '<a href="https://artificialanalysis.ai" target="_blank" rel="noopener">Artificial Analysis</a> 大模型智能排行榜',
    sub: n => `同一型号仅保留 Max · 更新于 <span>${n}</span>`,
    note: '智能指数为 Artificial Analysis Intelligence Index（10 项评测综合分，越高越好）· 点击模型名可查看 AA 详情',
  },
  webdev: {
    h1: '<a href="https://lmarena.ai/leaderboard/webdev" target="_blank" rel="noopener">LMArena</a> WebDev Arena 排行榜',
    sub: d => `网页生成对战 Elo 评分 · 数据更新于 <span>${d}</span>`,
    note: 'Elo 为 LMArena WebDev Arena 网页对战评分（含 95% 置信区间 ±CI 与票数）· 点击模型名可查看官方榜单',
  },
};

let current = 'ii';
const cache = {};

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function row(m, i, mode) {
  const rank = i + 1;
  const li = document.createElement('li');
  li.className = 'row';
  let nameHtml, metaHtml, val;
  if (mode === 'webdev') {
    nameHtml = `<a class="model-name" href="${LMARENA}" target="_blank" rel="noopener">${esc(m.name)}</a>`;
    metaHtml = `<span class="creator">${esc(m.org)}</span><span class="dot">·</span><span>±${m.ci}</span><span class="dot">·</span><span>${m.votes.toLocaleString()} 票</span>`;
    val = m.rating;
  } else {
    const logo = m.creatorLogo
      ? `<img class="logo" src="${AA}${esc(m.creatorLogo)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;logo-fallback&quot; style=&quot;background:${esc(m.creatorColor)}&quot;></span>'">`
      : `<span class="logo-fallback" style="background:${esc(m.creatorColor)}"></span>`;
    nameHtml = `<a class="model-name" href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.name)}</a>`;
    metaHtml = `<span class="creator">${logo}${esc(m.creator)}</span>`;
    val = m.ii.toFixed(1);
  }
  li.innerHTML = `
    <div class="rank ${rank <= 3 ? 'top' : ''}">${rank}</div>
    <div class="body">
      <div class="model-line">
        ${nameHtml}
        ${m.isOpen ? '<span class="badge-open">开源</span>' : ''}
      </div>
      <div class="meta">${metaHtml}</div>
    </div>
    <span class="ii-val">${val}</span>`;
  return li;
}

function render(tab, data) {
  const conf = TABS[tab];
  titleEl.innerHTML = conf.h1;
  const frag = document.createDocumentFragment();
  data.slice(0, TOP_N).forEach((m, i) => frag.appendChild(row(m, i, tab)));
  board.replaceChildren(frag);
  const date = tab === 'webdev' ? data[0].publishDate : new Date().toISOString().slice(0, 10);
  subtitleEl.innerHTML = conf.sub(date);
  updatedEl.textContent = date;
  footnoteEl.textContent = conf.note;
}

function setTab(tab) {
  if (tab === current) return;
  current = tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  render(tab, cache[tab]);
}

document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

Promise.all([
  fetch('data.json').then(r => r.json()),
  fetch('webdev.json').then(r => r.json()),
]).then(([ii, webdev]) => {
  cache.ii = ii;
  cache.webdev = webdev;
  render('ii', ii);
});
