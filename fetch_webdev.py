#!/usr/bin/env python3
# 从 HF lmarena-ai/leaderboard-dataset 抓取 WebDev Arena 最新榜单，生成 webdev.json
# 用法: python3 fetch_webdev.py   (默认走 hf-mirror.com，原站可达可加 --hf)
import json, sys, subprocess
import pandas as pd

URL_HF = "https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset/resolve/main/webdev/latest-00000-of-00001.parquet"
URL_MIRROR = "https://hf-mirror.com/datasets/lmarena-ai/leaderboard-dataset/resolve/main/webdev/latest-00000-of-00001.parquet"
PARQUET = "/tmp/webdev/latest.parquet"

TOP_N = 20
ORG_NAMES = {
    'anthropic': 'Anthropic', 'openai': 'OpenAI', 'google': 'Google', 'meta': 'Meta',
    'xai': 'xAI', 'alibaba': 'Alibaba', 'moonshot': 'Moonshot AI', 'tencent': 'Tencent',
    'zai': 'Z.ai', 'deepseek': 'DeepSeek', 'xiaomi': 'Xiaomi', 'bytedance': 'ByteDance',
    'minimax': 'MiniMax', 'mistralai': 'Mistral AI', 'nvidia': 'NVIDIA', 'amazon': 'Amazon',
    'microsoft': 'Microsoft', 'cohere': 'Cohere', 'ai21': 'AI21', 'perplexity': 'Perplexity',
    'reka': 'Reka', '01-ai': '01.AI', 'internlm': 'InternLM', 'spark': 'iFlytek',
}

SPECIAL = {'gpt': 'GPT', 'glm': 'GLM', 'deepseek': 'DeepSeek', 'xhigh': 'xHigh',
           'mimo': 'MiMo', 'hy4': 'Hunyuan4', 'hy3': 'Hunyuan3', 'codex-harness': 'Codex'}

def prettify(name: str) -> str:
    out = []
    for part in name.replace('(', ' (').replace(')', ') ').split():
        if part.startswith('('):
            out.append(part)
        else:
            out.append('-'.join(SPECIAL.get(w, w[:1].upper() + w[1:] if w and not w[0].isdigit() else w)
                                for w in part.split('-')))
    return ' '.join(out)

def main():
    url = URL_HF if '--hf' in sys.argv else URL_MIRROR
    subprocess.run(['curl', '-sL', '-m', '60', url, '-o', PARQUET], check=True)
    df = pd.read_parquet(PARQUET)
    df = df[df.category == 'overall'].sort_values('rank').head(TOP_N)
    out = []
    for _, m in df.iterrows():
        ci = (m.rating_upper - m.rating_lower) / 2
        out.append({
            'name': prettify(m.model_name),
            'model_name': m.model_name,
            'org': ORG_NAMES.get(m.organization, m.organization.capitalize()),
            'rating': round(m.rating),
            'ci': round(ci),
            'votes': int(m.vote_count),
            'isOpen': 'Proprietary' not in str(m.license),
            'publishDate': str(m.leaderboard_publish_date),
        })
    with open('webdev.json', 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print('models:', len(out), '| date:', out[0]['publishDate'] if out else '?',
          '| top3:', ', '.join(f"{m['name']}({m['rating']})" for m in out[:3]))

if __name__ == '__main__':
    main()
