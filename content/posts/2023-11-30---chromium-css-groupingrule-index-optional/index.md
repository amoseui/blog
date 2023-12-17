---
title: "Chromium Contribution: CSS GroupingRule insertRule 함수의 index 파라미터를 optional 로 변경"
date: 2023-11-30 08:00:00
template: post
draft: false
slug: "/chromium-css-groupingrule-index-optional"
category: "chromium"
tags:
  - opensource
  - chromium
  - css
  - w3c
  - wpt
description: 2023년 Chromium 에 반영한 다섯 번째 패치 내용 정리
---

### 관련 링크

- 제목: css: Make index optional in insertRule of CSSGroupingRule
- 패치: https://chromium-review.googlesource.com/c/chromium/src/+/5066757
- 버그
  - https://bugs.chromium.org/p/chromium/issues/detail?id=689684
- w3c spec: https://drafts.csswg.org/cssom/#the-cssgroupingrule-interface

### 개요

`CSSGroupingRule` 은 CSS에서 다른 CSS 규칙들을 그룹화하는 데 사용되는 추상 기본 인터페이스이다. `@media` 또는 `@supports` 규칙과 같은 `at-rule` 그룹을 형성하는 데 사용된다.

```webidl
[Exposed=Window]
interface CSSGroupingRule : CSSRule {
  [SameObject] readonly attribute CSSRuleList cssRules;
  unsigned long insertRule(CSSOMString rule, optional unsigned long index = 0);
  undefined deleteRule(unsigned long index);
};
```

`insertRule` 함수를 사용하면 새로운 스타일 규칙을 현재 스타일 시트에 추가할 수 있다.

```js
var stylesheet = document.styleSheets[0];
var newRule = "body { background-color: black; }";
stylesheet.insertRule(newRule, stylesheet.cssRules.length);
```

`insertRule` 함수의 마지막 인자인 `index` 값은 스펙 상으로 optional 하며 값을 명시하지 않는 경우, 0 으로 default 값을 사용하게 되어있다. 현재 Chromium 에서는 이 값이 optional 이 아니기 때문에 값을 넣지 않으면 오류가 발생한다.

```js
var stylesheet = document.styleSheets[0];
var newRule = "body { background-color: white; }";
stylesheet.insertRule(newRule);
```

### 내용

`CSSGroupingRule` `insertRule` 함수의 `index` 파라미터를 `optional` 로 변경하고 값이 없는 경우 0 을 사용하도록 변경했다. 추가로 rule 파라미터의 타입도 `DOMString` 에서 `CSSOMString` 으로 변경했다.

IDL 인터페이스만 변경하고 별도 구현 부분을 수정할 필요는 없었다.

### 테스트

WPT 에서 스펙과 맞지 않는 부분과 `insertRule` 의 `index` 를 특정하지 않는 케이스에 대한 테스트가 실패하고 있었다.

- third_party/blink/web_tests/external/wpt/css/cssom/CSSGroupingRule-insertRule.html

```js
test(function (t) {
  var groupingRule = create(t);
  var first = groupingRule.cssRules[0].cssText;
  var result;

  result = groupingRule.insertRule(".foo {}");

  assert_equals(groupingRule.cssRules.length, 2);
  assert_not_equals(groupingRule.cssRules[0].cssText, first);
  assert_equals(groupingRule.cssRules[1].cssText, first);
  assert_equals(result, 0);
}, "index not specified");
```

코드 수정과 함께 테스트 결과가 성공으로 바뀌었다.

### 후기

간단한 수정이었지만 스펙과 다른 부분을 고치는 건 뿌듯한 일이다. WPT 테스트 결과도 수정할 수 있었고 스펙과 일치하지 않는 blink 의 오래된 테스트도 고칠 수 있었다.
