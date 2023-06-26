---
title: "Chromium Contribution: 불필요한 register-property-syntax-parsing.html.ini 파일 삭제"
date: 2023-06-21 21:10:00
template: post
draft: false
slug: "/chromium-remove-css-wpt-ini-file"
category: "chromium"
tags:
  - opensource
  - chromium
  - css
  - w3c
  - wpt
description: 2023년 Chromium 에 반영한 두 번째 패치 내용 정리
---

### 관련 링크

- 제목: Remove register-property-syntax-parsing.html.ini
- 패치: https://chromium-review.googlesource.com/c/chromium/src/+/4626603
- 버그
  - https://bugs.chromium.org/p/chromium/issues/detail?id=1344170
  - https://bugs.chromium.org/p/chromium/issues/detail?id=1408675
- mdn web docs: https://developer.mozilla.org/en-US/docs/Web/API/CSS/registerProperty_static

### 개요

JS 에서 CSS 의 `@property` 를 직접 선언할 수 있는 `registerProperty` 함수에 대한 WPT(Web Platform Tests) 실패 이슈에 대하여 확인을 해보았다. 코드를 찾아보니 이미 [반영](https://chromium-review.googlesource.com/c/chromium/src/+/4507079)이 된 상태였다. WPT 테스트 파일이 GitHub repository 에서 Chromium 으로 merge 될 때 실패 케이스에 대하여 생성된 초기 파일 `register-property-syntax-parsing.html.ini` 이 아직 남아있어 해당 파일을 삭제하는 패치를 만들어 반영하고 관련된 이슈 2개를 정리했다.

### 내용

```css
@property --my-color {
  syntax: "<color>";
  inherits: false;
  initial-value: #c0ffee;
}
```

CSS 에서는 위와 같이 `@property` 로 custom property 를 직접 선언해서 사용할 수 있다.

```js
window.CSS.registerProperty({
  name: "--my-color",
  syntax: "<color>",
  inherits: false,
  initialValue: "#c0ffee",
});
```

JS 에서 registerProperty 함수를 사용하여 선언하는 방법도 있다.

```js
function assert_valid(syntax, initialValue) {
  // No actual assertions, this just shouldn't throw
  test(function () {
    var name = "--syntax-test-" + test_count++;
    CSS.registerProperty({
      name: name,
      syntax: syntax,
      initialValue: initialValue,
      inherits: false,
    });
  }, "syntax:'" + syntax + "', initialValue:'" + initialValue + "' is valid");
}

assert_valid("*", "default");
```

WPT 에서는 `assert_valid` 함수로 테스트 케이스를 만들어 확인하고 있다. universal syntax `*` 에 대하여 `default` 초기값으로 선언이 가능해야 하는데 Chromium 에서는 불가능한 것이 이슈였다. CSS 에서 `default` 는 `initial`, `inherit` 등과 달리 예약어가 아니므로 초기값으로 사용할 수 있다.

### 마무리

Chromium 의 WPT 에 있는 ini 파일은 TestExpectation 파일이나 실패 결과에 따라 생성된 \*-expected 파일과는 달리 실제 테스트 결과와 관련이 없다. GitHub 에서 Chromium 으로 merge 될 때 당시의 결과만 보여주는 것이므로 큰 의미가 없다. 그래도 이번 시도를 통해서 이슈와 코드를 트래킹해보고 ini 파일의 역할을 알게 된 것은 의미가 있었다.
