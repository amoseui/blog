---
title: "Chromium Contribution: CSS KeyframesRule length attribute 추가"
date: 2023-11-30 09:30:00
template: post
draft: false
slug: "/chromium-css-keyframesrule-length-attribute"
category: "chromium"
tags:
  - opensource
  - chromium
  - css
  - w3c
  - wpt
description: 2023년 Chromium 에 반영한 여섯 번째 패치 내용 정리
---

### 관련 링크

- 제목: css: Expose length attribute of CSSKeyframesRule
- 패치: https://chromium-review.googlesource.com/c/chromium/src/+/5069356
- 버그
  - https://bugs.chromium.org/p/chromium/issues/detail?id=1502758
- w3c spec
  - https://drafts.csswg.org/css-animations/#interface-csskeyframesrule-id
  - https://webidl.spec.whatwg.org/#idl-indexed-properties
- w3c spec change:
  - https://github.com/w3c/csswg-drafts/pull/7887
- chrome platform status feature
  - https://chromestatus.com/feature/6289894144212992

### 개요

`CSSKeyframesRule` 은 CSS 에서 키 프레임 애니메이션을 정의하는데 사용된다. `@keyframes` 으로 애니메이션 과정의 스타일을 변경할 수 있다.

```webidl
[Exposed=Window]
interface CSSKeyframesRule : CSSRule {
           attribute CSSOMString name;
  readonly attribute CSSRuleList cssRules;
  readonly attribute unsigned long length;

  getter CSSKeyframeRule (unsigned long index);
  undefined        appendRule(CSSOMString rule);
  undefined        deleteRule(CSSOMString select);
  CSSKeyframeRule? findRule(CSSOMString select);
};
```

여기서 `getter` 함수는 `indexed property getter`로 `index` 값으로 접근이 가능한 `getter` 를 나타낸다. `keyframes[0]`, `keyframes[1]` 과 같이 index 값으로 keyframe property 에 접근이 가능하다. Web IDL 에서 indexed properties 를 속성으로 포함하고 `index` 를 사용해서 그 값에 접근하려는 경우, `length` 도 함께 define 되어야 한다. `length`는 indexed properties 의 길이를 나타낸다.

### 내용

blink 가 WebKit 이던 시절부터 비표준 함수로 `getter` 가 존재했다. 현재는 표준 API 로 변경되었기에 `// Non-standard APIs` 주석을 제거하고 스펙과 동일한 위치로 옮겼다. `length` attribute 를 추가하였고, 구현 내용은 구현부에 이미 존재해서 별도로 구현할 필요는 없었다.

### 테스트

`CSSKeyramesRule` 타입에 `length` 가 없어서 실패한 테스트가 모두 성공으로 바뀌었다.

- third_party/blink/web_tests/external/wpt/css/cssom/CSSKeyframesRule.html

```js
test(function () {
  const keyframes = document.styleSheets[0].cssRules[2];
  assert_equals(
    keyframes[0].cssText,
    "0% { top: 0px; }",
    "CSSKeyframesRule indexed getter [0]",
  );
  assert_equals(
    keyframes[1].cssText,
    "100% { top: 200px; }",
    "CSSKeyframesRule indexed getter [1]",
  );
  assert_equals(keyframes.length, 2, "CSSKeyframesRule.length");
}, "indexed getter, length");
```

### 후기

간단한 수정이기 때문에 코드 리뷰는 문제없이 진행되었으나 API 가 추가된 것이기 때문에 리뷰어로부터 feature 등록을 요청 받았다. 이 패치의 경우 버그 수정에 가까워 형식적인 절차나 다름없는 것이었다. 하지만 feature 등록과 feature 리뷰 진행은 처음 진행해봐서 좋은 경험이 되었다.
