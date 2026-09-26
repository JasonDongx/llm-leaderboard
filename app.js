// 大模型排行榜 Top 20 —— AA 智能榜 + LMArena WebDev Arena
const board = document.getElementById('board');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const footnoteEl = document.getElementById('footnote');
const tabsEl = document.getElementById('tabs');
const TOP_N = 20;

// 本地厂商 logo（缺失时用厂商色块兜底）
const LOGOS = {
  'anthropic': 'logos/anthropic.svg',
  'openai': 'logos/openai.svg',
  'spacexai': 'logos/spacexai.svg',
  'xai': 'logos/spacexai.svg',
  'google': 'logos/google.svg',
  'meta': 'logos/meta.svg',
  'alibaba': 'logos/alibaba.svg',
  'deepseek': 'logos/deepseek.svg',
  'z ai': 'logos/zai.svg',
  'z.ai': 'logos/zai.svg',
  'zai': 'logos/zai.svg',
  'kimi': 'logos/kimi.jpg',
  'moonshot ai': 'logos/kimi.jpg',
  'moonshot': 'logos/kimi.jpg',
  'xiaomi': 'logos/xiaomi.svg',
  'tencent': 'logos/tencent.svg',
  'stepfun': 'logos/stepfun.svg',
};

const TABS = {
  ii: {
    title: '大模型智能排行榜',
    desc: () => `基于 <a href="https://artificialanalysis.ai" target="_blank" rel="noopener">Artificial Analysis</a> 智能指数（10 项评测综合分，衡量模型综合智能水平）· 同一型号仅保留 Max · 更新于 <span>${new Date().toISOString().slice(0, 10)}</span>`,
    note: '智能指数越高越好 · 点击模型名查看 AA 详情',
  },
  webdev: {
    title: 'WebDev Arena 排行榜',
    desc: d => `基于 <a href="https://lmarena.ai/leaderboard/webdev" target="_blank" rel="noopener">LMArena</a> 网页开发对战：模型两两对战按真实需求生成网页，人类盲测投票决出 Elo 评分 · 数据更新于 <span>${d}</span>`,
    note: 'Elo 越高越好 · ± 为 95% 置信区间 · 票数为有效对战数',
  },
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function logoHtml(m) {
  const key = (m.creator || m.org || '').toLowerCase().trim();
  const color = m.creatorColor || m.color || '#888';
  const file = LOGOS[key];
  if (file) return `<img class="logo" src="${file}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;logo-fallback&quot; style=&quot;background:${esc(color)}&quot;></span>'">`;
  return `<span class="logo-fallback" style="background:${esc(color)}"></span>`;
}

function row(m, i, tab) {
  const rank = i + 1;
  const li = document.createElement('li');
  li.className = 'row';
  const openBadge = m.isOpenWeights || m.isOpen ? '<span class="badge-open">开源</span>' : '';
  const nameHtml = m.url
    ? `<a class="model-name" href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.name)}</a>${openBadge}`
    : `<span class="model-name">${esc(m.name)}</span>${openBadge}`;
  const meta = tab === 'ii'
    ? `<span class="creator">${logoHtml(m)}${esc(m.creator)}</span>`
    : `<span class="creator">${logoHtml(m)}${esc(m.org)}</span><span class="dot">·</span><span>±${m.ci}</span><span class="dot">·</span><span>${m.votes.toLocaleString()} 票</span>`;
  const val = tab === 'ii' ? m.ii.toFixed(1) : m.rating;
  li.innerHTML = `
    <div class="rank ${rank <= 3 ? 'top' : ''}">${rank}</div>
    <div class="body">
      <div class="model-line">${nameHtml}</div>
      <div class="meta">${meta}</div>
    </div>
    <span class="ii-val">${val}</span>`;
  return li;
}

const cache = {};
let current = null;

function render(tab, data) {
  const conf = TABS[tab];
  document.title = conf.title + ' · 大模型排行榜 Top 20';
  titleEl.textContent = conf.title;
  subtitleEl.innerHTML = conf.desc(tab === 'webdev' ? data[0].publishDate : null);
  footnoteEl.textContent = conf.note;
  const frag = document.createDocumentFragment();
  data.slice(0, TOP_N).forEach((m, i) => frag.appendChild(row(m, i, tab)));
  board.replaceChildren(frag);
}

function setTab(tab) {
  if (tab === current) return;
  current = tab;
  tabsEl.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  render(tab, cache[tab]);
}

tabsEl.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

Promise.all([
  fetch('data.json').then(r => r.json()),
  fetch('webdev.json').then(r => r.json()),
]).then(([ii, webdev]) => {
  cache.ii = ii;
  cache.webdev = webdev;
  render('ii', ii);
});
