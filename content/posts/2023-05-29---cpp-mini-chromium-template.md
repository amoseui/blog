---
title: cpp-mini-chromium-template 프로젝트 소개
date: 2023-05-29 21:00:00
template: post
draft: false
slug: /cpp-mini-chromium-template
category: opensource
tags:
  - opensource
  - chromium
  - cpp
description: cpp-mini-chromium-template 프로젝트 소개
aliases:
  - cpp-mini-chromium-template 프로젝트 소개
---

Chromium [base](https://chromium.googlesource.com/chromium/src/base/) 에는 Chromium 의 전반적인 핵심 기능과 유틸리티를 제공하는 코드가 있다. 공통으로 사용되는 유틸리티 함수, 데이터 구조, 도구, 플랫폼 지원 등과 같은 코드가 있는 일종의 C++ 라이브러리이다. C++ 최신 기능을 앞서 구현해서 사용하기도 하고 대체해서 사용하기도 한다. 상당히 고도화되어 있고 안정화되어있기 때문에 이쪽 코드를 분석하면 C++ 실력을 키우는데 상당히 도움이 될거라 생각한다. 유닛 테스트도 잘 되어있다.

하지만 Chromium 은 너무 큰 프로젝트이기 때문에 코드 다운로드와 빌드에 대한 장벽이 상당히 높다. 개인적인 경험으로는 리눅스가 그나마 편한데 그것도 쉬운 편은 아니다. base 분석 하나 때문에 리눅스를 설치하고 전체 코드를 받아 빌드하는 건 너무 큰 일이다.

이런 문제를 해결하기 위해서 그랬는지는 몰라도 Chromium 팀에서 [mini_chromium](https://chromium.googlesource.com/chromium/mini_chromium) 이라는 프로젝트를 따로 만들어 놓았다. mini_chromium 은 Chromium 에서 base 코드만 따로 떼어서 구성한 작은 프로젝트이다. 이를 활용하면 base 코드를 어느 정도 사용하고 분석할 수 있다. 빌드 환경이나 스크립트, 명령어 등은 Chromium 프로젝트와 거의 동일하다. 하지만 이 프로젝트를 받아서 코드를 구현할 수 있는 건 아니다.

이를 쉽게 하기 위해서 [cpp-mini-chromium-tmeplate](https://github.com/amoseui/cpp-mini-chromium-template/) 이라는 프로젝트를 하나 만들었다. `hello.cc`, `hello_static.cc` 에 원하는 코드를 추가해서 테스트해볼 수 있다. 또 `hello_test.cc`로 googletest 도 돌려볼 수 있다. GitHub 에서 이 프로젝트를 템플릿 프로젝트로 선언해 놓았기 때문에 클릭 한번으로 이 프로젝트 기반의 신규 프로젝트를 만들 수도 있다. 실제로 개인적인 알고리즘 공부를 위한 프로젝트도 이 프로젝트 템플릿으로 만들어서 쓰고 있다.

환경 셋업 및 사용 방법은 아래 가이드를 따르면 된다.

### Prerequisites

```bash
$ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
$ export PATH=$DEPOT_TOOLS:$PATH
```

### Sync

```bash
$ git clone git@github.com:amoseui/cpp-mini-chromium-template.git
$ cd cpp-mini-chromium-template
$ gclient sync
```

### Build

```bash
$ gn gen out/Debug
$ ninja -C out/Debug hello
```

### Run

```bash
$ ./out/Debug/hello
```

### Test

```bash
$ gn gen out/Debug
$ ninja -C out/Debug hello_unittest
$ ./out/Debug/hello_unittest
```
