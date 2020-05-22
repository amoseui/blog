# blog

[![Build Status](https://travis-ci.org/amoseui/blog.svg?branch=master)](https://travis-ci.org/amoseui/blog)


**Update posts**
```bash
$ git checkout master
$ git checkout -b ${new_branch}

$ hexo new draft ${title}
# source/_drafts/${title}.md
# source/_drafts/${title}/ 폴더 생성 (_config.yml : post_asset_folder: true 인 경우)
# source/_drafts/${title}/ 에 이미지 파일 추가
# ![](image.png) 로 접근 가능

# publish
# 내용에 날짜를 지정하면 그 날짜로, 없으면 현재 날짜로 source/_posts 에 파일이 생성됨
$ hexo publish ${title}

# local 확인
$ hexo generate
$ hexo server

# update posts
$ git add .
$ git commit
$ git push origin ${new_branch}
```

