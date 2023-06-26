---
title: "Chromium Contribution: CSS @supports 에서 빈 () 허용"
date: 2023-06-22 20:30:00
template: post
draft: false
slug: "/chromium-css-supports-allow-empty-parentheses"
category: "chromium"
tags:
  - opensource
  - chromium
  - css
  - w3c
  - wpt
description: 2023년 Chromium 에 반영한 세 번째 패치 내용 정리
---

### 관련 링크

- 제목: Allow empty parentheses in @supports evaluating to false
- 패치: https://chromium-review.googlesource.com/c/chromium/src/+/4629330
- 버그
  - https://bugs.chromium.org/p/chromium/issues/detail?id=1158554
  - https://bugs.chromium.org/p/chromium/issues/detail?id=1269284
- w3c spec change: https://github.com/w3c/csswg-drafts/pull/6799
- mdn web docs: https://developer.mozilla.org/en-US/docs/Web/CSS/@supports

### 개요

CSS 에서 `@supports` 문법을 활용하면 브라우저가 해당 속성 지원 여부에 따라 값을 선언할 수 있다.

빈 () 을 선언한 경우 파싱 실패 코드를 리턴하여 실패로 처리하였다. 대신 unsupports 을 리턴하여 문제없도록 한다.

```css
@supports () {
}

@supports func() {
}
```

### 내용

### 마무리
