// 从 AA 解密数据生成精简 data.json
// 规则：同一 release 只保留一个变体——优先 max，其次无 effort 标记的默认版，最后取分最高者
import fs from 'fs';

const raw = JSON.parse(fs.readFileSync(new URL('./aa_data.json', import.meta.url), 'utf8'));

const EFFORT = /\b(max|xhigh|high|medium|low|minimal)\b/i;
const hasMax = n => /\bmax\b/i.test(n);

const byRelease = new Map();
for (const m of raw.models) {
  if (m.intelligenceIndex == null) continue;
  if (m.deprecated) continue; // 有直接继任者的旧版不进榜
  const key = m.release?.slug || m.slug;
  if (!byRelease.has(key)) byRelease.set(key, []);
  byRelease.get(key).push(m);
}

const pick = list => {
  if (list.length === 1) return list[0];
  const maxes = list.filter(m => hasMax(m.name));
  if (maxes.length) return maxes.sort((a, b) => b.intelligenceIndex - a.intelligenceIndex)[0];
  const defaults = list.filter(m => !EFFORT.test(m.name));
  if (defaults.length) return defaults.sort((a, b) => b.intelligenceIndex - a.intelligenceIndex)[0];
  return list.sort((a, b) => b.intelligenceIndex - a.intelligenceIndex)[0];
};

const out = [...byRelease.values()].map(pick).map(m => ({
  name: m.name.replace(/\(Adaptive Reasoning, /, '(').replace(/, Default Fallback\)/, ')').replace(/, Opus [0-9.]+ Fallback\)/, ')'),
  slug: m.slug,
  creator: m.creator?.name || '',
  creatorLogo: m.creator?.logo || '',
  creatorColor: m.creator?.color || '#888',
  ii: Math.round(m.intelligenceIndex * 10) / 10,
  isOpenWeights: !!m.isOpenWeights,
  params: m.parameters ?? null,
  contextWindow: m.contextWindowTokens ?? null,
  outputSpeed: m.timescaleData?.medianOutputSpeed != null ? Math.round(m.timescaleData.medianOutputSpeed) : null,
  latency: m.timescaleData?.medianTimeToFirstChunk != null ? +m.timescaleData.medianTimeToFirstChunk.toFixed(1) : null,
  price: m.price1mBlended7To2To1 ?? null, // $/M tokens (7:2:1 混合)
  releaseDate: m.releaseDate || null,
  url: 'https://artificialanalysis.ai/models/' + m.slug,
})).sort((a, b) => b.ii - a.ii);

fs.writeFileSync(new URL('./site/data.json', import.meta.url), JSON.stringify(out, null, 1));
console.log('models:', out.length, '| top5:', out.slice(0, 5).map(m => `${m.name}(${m.ii})`).join(', '));
