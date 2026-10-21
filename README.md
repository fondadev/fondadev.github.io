# fondadev.github.io

fondadev のポートフォリオ「MATCH DAY」。スクロールすると試合が進みます。

公開先: https://fondadev.github.io/

## 作品を追加する

`src/content/works/` に Markdown を1つ足すだけです。`order` の小さい順に並びます。

```md
---
order: 5
kind: APP
title: 作品の名前
tags: [Vue, AWS]
url: https://example.com   # 任意。あるとカードがリンクになります
repo: https://github.com/fondadev/xxx   # 任意
---

作品のひとこと説明。
```

## 文言を変える

作品以外の文言（技術、経歴、資格、アカウントなど）は `src/data/profile.ts` にまとまっています。

## 手元で動かす

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に書き出し
```

`main` に push すると GitHub Actions がビルドして GitHub Pages に公開します（リポジトリの Settings → Pages → Source を「GitHub Actions」にしておく必要があります）。

## 使っているもの

Astro / GSAP ScrollTrigger / Lenis / Canvas 2D
