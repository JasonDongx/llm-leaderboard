// 大模型智能排行榜 Top 20 —— 基于 Artificial Analysis 数据
const AA = 'https://artificialanalysis.ai';
const board = document.getElementById('board');
const updatedEl = document.getElementById('updated');
const TOP_N = 20;
const MAX_II = 60;

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

fetch('data.json').then(r => r.json()).then(data => {
  updatedEl.textContent = new Date().toISOString().slice(0, 10);
  const frag = document.createDocumentFragment();
  data.slice(0, TOP_N).forEach((m, i) => {
    const rank = i + 1;
    const li = document.createElement('li');
    li.className = 'row';
    const logo = m.creatorLogo
      ? `<img class="logo" src="${AA}${esc(m.creatorLogo)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;logo-fallback&quot; style=&quot;background:${esc(m.creatorColor)}&quot;></span>'">`
      : `<span class="logo-fallback" style="background:${esc(m.creatorColor)}"></span>`;
    li.innerHTML = `
      <div class="rank ${rank <= 3 ? 'top' : ''}">${rank}</div>
      <div class="main">
        <div class="model-line">${logo}
          <a class="model-name" href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.name)}</a>
          ${m.isOpenWeights ? '<span class="badge-open">开源</span>' : ''}
        </div>
        <div class="creator-line">${esc(m.creator)}</div>
      </div>
      <div class="score">
        <span class="ii-val">${m.ii.toFixed(1)}</span>
        <span class="ii-bar-bg"><span class="ii-bar" style="width:${Math.min(100, m.ii / MAX_II * 100)}%"></span></span>
      </div>`;
    frag.appendChild(li);
  });
  board.replaceChildren(frag);
});
