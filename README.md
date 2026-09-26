# llm-leaderboard · 大模型排行榜

两个榜单，页签切换：

- **智能榜**：基于 [Artificial Analysis](https://artificialanalysis.ai/models) Intelligence Index 的排行榜
- **WebDev Arena**：基于 [LMArena WebDev Arena](https://lmarena.ai/leaderboard/webdev) 网页生成对战的 Elo 评分排行榜

## 规则

- **同一型号只展示 max 版本**：有 max 档位的（如 GPT-6 Astra (max)）只保留 max，不再展示 xhigh/high/medium 等低档位
- 没有 max 档位的型号（如 Grok 4.7 xhigh），保留其最高档变体
- 已被官方标记为 deprecated（有直接继任者）的旧版本不进榜
- 按智能指数降序排列，支持按速度 / 延迟 / 价格 / 上下文等列排序
- 支持开源权重 / 闭源筛选与模型、厂商搜索
- WebDev 榜取 overall 分类 Top 20，显示 Elo ±95%CI 与票数

## 列说明

| 列 | 含义 |
|---|---|
| 智能指数 | Artificial Analysis Intelligence Index（10 项评测综合分，越高越好） |
| 输出速度 | 中位输出 tok/s |
| 延迟 | 首字中位延迟（秒） |
| 混合价格 | $/M tokens，按 7:2:1 输入输出比 |
| 上下文 | 上下文窗口大小 |

## 数据更新

```bash
# 智能榜：
# 1. 从 AA 页面取最新的 manifest（path + key）
#    https://artificialanalysis.ai/models 页面源码中搜索 "/data/xxx.txt"
# 2. 更新 decrypt.mjs 中的文件名与 key，然后：
node decrypt.mjs    # 解密 aa_raw.txt -> aa_data.json
node process.mjs    # 生成 data.json

# WebDev 榜（数据来自 HF lmarena-ai/leaderboard-dataset，走 hf-mirror 直连）：
python3 fetch_webdev.py    # 生成 webdev.json（需 pyarrow）
```

## 部署

纯静态站点（），直接在 Vercel 导入本仓库即可，无需构建。
