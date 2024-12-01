---
title: Chromium Faster Build 테스트
date: 2024-11-30 12:00:00
template: post
draft: false
slug: "/chromium-faster-build"
category: "chromium"
tags:
  - chromium
description: faster build
---

Chromium 빠른 빌드를 위한 환경 셋업 방법을 ㅣ

Chromium 빌드는 굉장히 오래 걸린다. 2018년 데스크톱을 새로 맞췄다. 구매한지 벌써 6년.

- AMD 라이젠 7 피나클릿지 2700X (8 core / 16 thread)
- 32GB RAM

지금은 2018년 때보다 풀빌드 시간이 더 많이 걸린다.


구글 개발자를 위한 별도의 가이드가 있다. 내부 문서와 서버 사용으로 굉장히 빠르게 빌드를 할 수 있는 것 같은데 볼 방법이 없으니 실제로 어느 정도인지는 알기 어렵다.

[Faster builds](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#Faster-builds) 가이드를 제공한다.
리모트 캐시 빌드를 사용한 빌드가 따로 있다. tryjob access 가 있는 개발자라면 별도의 신청으로 권한을 얻을 수 있다.
내가 보냈을 때는 committer 인지 확인을 했다. 구글에서 비용을 사용하는 것이다보니 아무나 해주는 것 같진 않다.

나도 committer 가 된 후에 신청을 했다.

Reclient 를 사용한다.
구글 클라우드 계정이 필요하다.

https://github.com/bazelbuild/remote-apis
https://github.com/bazelbuild/reclient

### 셋업

This section contains some things you can change to speed up your builds, sorted so that the things that make the biggest difference are first.

Use Reclient
Warning: If you are a Google employee, do not follow the instructions below. See go/chrome-linux-build#setup-remote-execution instead.
Chromium's build can be sped up significantly by using a remote execution system compatible with REAPI. This allows you to benefit from remote caching and executing many build actions in parallel on a shared cluster of workers.

For contributors who have tryjob access , please ask a Googler to email accounts@chromium.org on your behalf to access RBE backend paid by Google. Note that reclient for external contributors is a best-effort process. We do not guarantee when you will be invited. Reach out to reclient-users@chromium.org if you have any questions about reclient usage.

To get started, you need access to an REAPI-compatible backend. The following instructions assume that you received an invitation from Google to use Chromium's RBE service and were granted access to it. However, you are welcome to use any of the other compatible backends, in which case you will have to adapt the following instructions regarding the authentication method, instance name, etc. to work with your backend.

Chromium‘s build uses a client developed by Google called reclient to remotely execute build actions. If you would like to use reclient with RBE, you’ll first need to:

Install the gcloud CLI. You can pick any installation method from that page that works best for you.
Run gcloud auth login --update-adc and login with your authorized account. Ignore the message about the --update-adc flag being deprecated.
Next, you'll have to specify your rbe_instance in your .gclient configuration to use the correct one for Chromium contributors:

Warning: If you are a Google employee, do not follow the instructions below. See go/chrome-linux-build#setup-remote-execution instead.
solutions = [
  {
    ...,
    "custom_vars": {
      # This is the correct instance name for using Chromium's RBE service.
      # You can only use it if you were granted access to it. If you use your
      # own REAPI-compatible backend, you will need to change this accordingly
      # to its requirements.
      "rbe_instance": "projects/rbe-chromium-untrusted/instances/default_instance",
    },
  },
]
And run gclient sync. This will regenerate the config files in buildtools/reclient_cfgs to use the rbe_instance that you just added to your .gclient file.

Then, add the following GN args to your args.gn:

use_remoteexec = true
reclient_cfg_dir = "../../buildtools/reclient_cfgs/linux"
If you are building an older version of Chrome with reclient you will need to use rbe_cfg_dir = "../../buildtools/reclient_cfgs_linux"
That‘s it. Remember to always use autoninja for building Chromium as described below, which handles the startup and shutdown of the reproxy daemon process that’s required during the build, instead of directly invoking ninja.
