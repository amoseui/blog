---
title: Code Coverage Best Practices
date: 2020-12-09 22:00:00
template: post
draft: false
slug: "/code-coverage"
category: "review"
tags:
  - testing
description: 지난 8월 Google Testing Blog 에 올라왔던 Code Coverage Best Practices 를 보고 간단히 정리해 보았다.
---

지난 8월 [Google Testing Blog](https://testing.googleblog.com/) 에 올라왔던 [Code Coverage Best Practices](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html) 를 보고 간단히 정리해 보았다.

위 블로그 내용을 100% 이해하지는 못 했지만 대부분 동의한다. 구체적인 예시는 없지만 Code Coverage 에 대한 생각을 정리하기 위한 용도로 재해석했다.

### Code Coverage 의 의미

테스트를 통해 Code Coverage 를 측정하는 것은 개발 프로세스에서 도움이 된다. 하지만 이 수치에 집착해서는 안 된다. Code Coverage 는 테스트를 정량화하여 측정할 수 있는 유일한 방법이 아니며 완벽한 방법도 아니다. 높은 수치의 Code Coverage 는 좋은 코드의 퀄리티를 보장하지 않는다. 라인이나 브랜치가 커버되었다고 해서 해당 코드가 제대로 테스트 되었다는 걸 보장하지 않기 때문이다. 단순히 테스트로 실행이 되었다는 것을 전제로 하고 확인을 해야 한다. 반대로 커버되지 않는 부분을 확인하고 개선하는데 힘을 쓰는게 중요하다.

### Code Coverage 기준

모든 프로젝트에 통용되는 이상적인 Code Coverage 수치는 없다. 하지만 팀 내에서 기준을 잡고 목표를 만드는 것이 좋다. 구글에서는 60% acceptable, 75% commendable, 90% exemplary 을 기본적인 가이드 라인으로 정하고 있지만 모든 프로젝트에 필수적인 조건으로 적용하고 있지는 않다. Code Coverage 의 수치와 비용의 관계는 로그 함수 그래프와 같아서 수치가 높아질수록 수치를 그 이상으로 올리기 어렵다. 따라서 90% 에서 95% 로 올리는 것에 집착해서는 안된다. 30% 에서 70% 로 올릴 때는 구체적인 프로세스와 기준을 통해 새 코드가 기준을 만족하는지 확인하면서 프로젝트를 진행하는 것이 좋다. 수치가 낮고 개선하기 어려운 레거시 프로젝트라도 보이 스카웃 규칙(캠프장을 처음 왔을 때보다 더 깨끗하게 해놓고 떠나라.)을 기억하고 점진적으로 개선하면 좋아질 수 있다.

### Code Coverage 의 활용

Code Coverage 를 장기간동안 올리려는 노력은 결함을 줄이는데 도움이 된다. 낮은 Code Coverage 수치는 프로젝트의 많은 부분이 테스트되지 않으면서 진행되고 있다는 걸 알 수 있는 지표가 된다. 코드 리뷰 단계에서 Code Coverage 를 확인하면 리뷰 프로세스를 좀 더 빠르고 쉽게 만들 수 있다. 리뷰어는 수치 뿐만 아니라 어느 라인이 추가로 커버되었는지 확인할 수 있다. 특히 자주 수정되는 코드는 테스트로 커버되도록 해야 한다. 수정할 때마다 수치가 낮아지지 않도록 하면서 코드와 테스트의 품질을 올릴 수 있다. 패치마다 델타를 확인하여 기준에 충족하지 않는 반영과 배포를 차단할 필요가 있다. 통합 테스트에 대해서도 측정을 하는 것이 좋다. 유닛 테스트에서 놓치고 있는 부분을 확인할 수 있다.
