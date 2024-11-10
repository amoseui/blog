---
title: Chromium Faster Build 테스트
date: 2024-10-07 05:00:00
template: post
draft: false
slug: "/build-test"
category: "chromium"
tags:
  - chromium
description: faster build
---

Chromium 빌드는 굉장히 오래 걸린다.
2018년 데스크톱을 새로 맞췄다. 구매한지 벌써 6년.

- AMD 라이젠 7 피나클릿지 2700X
- 32GB RAM

지금은 당시보다 풀빌드 기준 몇시간 더 걸린다.

동일한 32GB RAM 와 조금 더 좋은 사양의 인텔 CPU 사양의 회사 PC 에서는 조금 낫지만 큰 차이가 없다고 봐도 무방하다.

구글 개발자는 별도의 가이드가 있다. 내부 문서와 서버 사용으로 굉장히 빠르게 빌드를 할 수 있는 것 같은데 볼 방법이 없으니 실제로 어느 정도인지는 알기 어렵다.

Faster builds 가이드를 제공한다.
리모트 캐시 빌드를 사용한 빌드가 따로 있다. tryjob access 가 있는 개발자라면 별도의 신청으로 권한을 얻을 수 있다.
내가 보냈을 때는 committer 인지 확인을 했다. 구글에서 비용을 사용하는 것이다보니 아무나 해주는 것 같진 않다.

나도 committer 가 된 후에 신청을 했다.

Reclient 를 사용한다.
구글 클라우드 계정이 필요하다.

https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#Faster-builds

https://github.com/bazelbuild/remote-apis
https://github.com/bazelbuild/reclient

### 셋업
