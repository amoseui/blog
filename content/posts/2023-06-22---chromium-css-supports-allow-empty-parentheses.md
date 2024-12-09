---
title: "Chromium Contribution: CSS @supports <general-enclosed> rule 에서 비어있는 () 허용"
date: 2023-06-22 20:30:00
template: post
draft: false
slug: /chromium-css-supports-allow-empty-parentheses
category: chromium
tags:
  - opensource
  - chromium
  - css
  - w3c
  - wpt
description: 2023년 Chromium 에 반영한 세 번째 패치 내용 정리
aliases:
  - "Chromium Contribution: CSS @supports <general-enclosed> rule 에서 비어있는 () 허용"
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

CSS 에서 `@supports` 문법을 활용하면 브라우저가 해당 속성을 지원하는지 여부에 따라 속성 값을 선언할 수 있다. `@supports` 뒤에는 조건이 올 수도 있고, `selector` 와 같은 함수가 올 수도 있다. `and`, `or`, `not` 등의 연산자도 사용 가능하다.

```css
@supports () {
}

@supports unknown() {
}
```

위와 같은 경우 `@supports` 최후의 파싱 규칙인 `<general-enclosed>` 을 따르게 되는데 이 때 값이 없는 인자를 가진 임의의 함수나 빈 괄호가 선언되어 있는 경우 unsupported 를 리턴하도록 스펙에 명시되어 있다. 하지만 현재 Chromium 에서는 이 경우에 parsing failure error 를 리턴하고 있다.

### 내용

```css
<general-enclosed> = [ <function-token> <any-value>? ) ]
                 | ( <any-value>? )
```

`<any-value>?` 에서 `?` 는 optional 을 뜻한다. 값이 있어도 되고, 없어도 된다는 뜻이다. 기존 Chromium 에서는 `<any-value>` 에 `?` 가 없는 규칙에 맞춰 구현되어 있었다. `<general-enclosed>` 은 1) `<function-token>` (`(` 포함) 으로 시작하여 `<any-value>` 또는 빈 값 후 `)` 으로 닫히거나, 2) `()` 안에 `<any-value>` 가 있거나 빈 값인 경우 2가지에 대하여 unsupported 를 리턴한다.

```cpp
auto block = stream.ConsumeUntilPeekedTypeIs<kRightParenthesisToken>();

// 추가한 코드
block.ConsumeWhitespace();
if (block.AtEnd()) {
    return Result::kUnsupported;
}
```

위에서 `ConsumeUntilPeekedTypeIs` 함수는 `kRightParenthesisToken`(`)`) 토큰이 나올 떄까지 `stream` 을 consume 하여 `CSSParserTokenRange` 타입의 `block` 을 리턴한다. 이렇게 하면 `(` 다음부터 가장 마지막 `)` 전까지의 `CSSParserTokenRange` 값을 받아올 수 있다. 그 다음 `ConsumeWhitespace` 함수로 `block` 의 whitespace 를 제거한다. `block` 이 끝까지 consume 된 상태라면 `block` 은 whitespace 로만 이루어져 있다고 볼 수 있다. 이 경우 `kUnsupported` 를 리턴하여 함수 안에 빈 값이거나 괄호 안에 빈 값이 있는 케이스에 대하여 처리할 수 있다.

### 테스트

- third_party/blink/web_tests/external/wpt/css/css-conditional/js/supports-conditionText.html

```
FAIL conditionText getter for @supports () assert_equals: expected 1 but got 0
FAIL conditionText getter for @supports func() assert_equals: expected 1 but got 0
FAIL conditionText getter for @supports (()) assert_equals: expected 1 but got 0
FAIL conditionText getter for @supports (func()) assert_equals: expected 1 but got 0
```

- third_party/blink/web_tests/external/wpt/css/css-conditional/css-supports-040.xht
- third_party/blink/web_tests/external/wpt/css/css-conditional/css-supports-041.xht

코드를 수정하면서 WPT 에서 빈 ()에 대한 케이스를 많이 수정할 수 있었다. blink unit test 에도 `()` `( )` `asdf()` 와 같은 테스트 케이스도 추가하였다.

### 코드 리뷰

blink unit test 에서 `(` 만 선언되어 있는 경우 `kParseFailure` 를 리턴하도록 되어 있었다. 기존 테스트 코드를 깨지 않기 위해 `)` 토큰이 아예 없는 경우에 대한 예외처리 코드를 넣었었다. 리뷰어가 `)`가 보장되어 있기 때문에 불필요한 예외처리라고 댓글을 남겼다. 기존에 있던 테스트 코드 때문에 넣었다고 리뷰어에게 설명을 하면서 테스트를 고치면 될지 물어보았다. `(` 도 `<general-enclosed>` 로 간주된다고 하여 예외처리를 삭제하고 테스트 케이스를 변경하였다.

### 후기

최종적으로 반영한 코드는 몇 줄 안 되지만 예외처리를 생각하는 과정에서 CSS Rule Parser 에 대해 조금 더 깊게 볼 수 있었다. 다른 패치를 반영할 때도 도움이 많이 될 것 같다.
