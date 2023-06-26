---
title: "Chromium Contribution: CSS FontFace 속성 타입을 DOMString 에서 CSSOMString 으로 변경"
date: 2023-06-20 22:50:00
template: post
draft: false
slug: "/chromium-css-fontface-cssomstring"
category: "chromium"
tags:
  - opensource
  - chromium
  - css
  - w3c
description: 2023년 Chromium 에 반영한 첫 번째 패치 내용 정리
---

### 관련 링크

- 제목: Replace DOMString with CSSOMString for FontFace properties
- 패치: https://chromium-review.googlesource.com/c/chromium/src/+/4624019
- 버그
  - https://bugs.chromium.org/p/chromium/issues/detail?id=1344170
  - https://bugs.chromium.org/p/chromium/issues/detail?id=1408675

### 개요

다시 Chromium 에 contribution 을 시작했다. 작년 10월에 마지막으로 패치를 반영한 이후로 6개월 넘게 아무것도 하지 않았다. 이제 다시 마음을 잡고 꾸준히 기여해보려고 한다. 오랜만에 버그 트래커를 뒤져서 쉬운 것부터 찾아 시작했다. 올해 웹 플랫폼 생태계에서 집중적으로 신경쓰고 있는 모듈 중 하나이고 이슈가 많은 CSS 모듈을 선택했다. CSS 모듈 내 Web Spec 과 Chromium Blink 의 Web IDL(Interface Definition Language) 파일의 내용이 일치하지 않는 이슈를 찾아 수정하였다.

### 내용

이슈의 내용은 W3C CSS 스펙에 따라 `FontFace` 의 속성들이 현재 선언되어 있는 `DOMString` 대신 `CSSOMString` 타입을 리턴해야 된다는 것이었다. 보통 IDL 에서 어떤 속성의 타입이 스펙과 다른 경우, 1) IDL 의 파일만 살짝 바꿔주면 되는 경우, 2) IDL 및 IDL 이 동일한지 검증을 하는 WPT (Web Platform Tests) 를 같이 수정해줘야 하는 경우, 3) IDL 과 관련된 로직, C++ 파일들까지 함께 수정해줘야 하는 경우 등 간단하게는 3가지 경우가 있고 가끔은 그보다 더 복잡한 경우가 있기도 하다. 이번 수정은 1)번과 같은 경우에 속했다.

`CSSOMString` 은 `CSSOM`(CSS Object Model) 에서 사용하는 String type 이다. [CSSOMString](https://drafts.csswg.org/cssom/#cssomstring-type) 스펙에 따르면 `CSSOMString` 에 대한 실제 구현은 브라우저에서 `USVString` 이나 `DOMString` 중 하나를 선택하면 된다고 한다. Chromium 에서는 `third_party/blink/renderer/core/css/cssom_string.idl` 파일에 `typedef DOMString CSSOMString` 으로 선언되어 있어 IDL 에서 `DOMString` 을 쓰나 `CSSOMString` 을 쓰나 같은 것이었다. 그래도 스펙을 따르는게 맞으니 `FontFace` 에 선언되어있는 `DOMString` 을 `CSSOMString` 바꿔주었고, 수정 과정에서 발견한 `FontFaceDescriptors` 에 대해서도 같은 수정을 해주었다.

### 마무리

오랜만의 contribution 이었기 때문에 간단한 수정으로 시작하게 되었다. 앞으로 매주 꾸준히 할 수 있는 동력과 시스템을 만들고 싶다.
