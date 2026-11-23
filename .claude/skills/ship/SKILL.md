---
name: ship
description: 이 저장소의 git flow 절차를 실제 명령과 함께 안내. 새 작업을 시작할 때(이슈·브랜치 생성), 작업을 마쳐 PR을 올리고 develop에 머지할 때, main으로 릴리즈하거나 배포본을 긴급 수정할 때 사용
---

# 작업 올리기 (git flow)

브랜치명·커밋 메시지·제목의 형식은 `.claude/rules/git.md`가 기준이고, 이 문서는 순서와 명령만 다룬다

## 1. 시작 — 이슈와 브랜치

```bash
git checkout develop && git pull --ff-only
gh issue create --title "[Feat] 제목" --body-file <본문 파일>
git checkout -b "feat/#이슈번호-description"
```

- 이슈 본문은 `.github/ISSUE_TEMPLATE.md` 형식
- 브랜치명은 `#` 때문에 반드시 따옴표로 감싼다

## 2. 구현과 커밋

- 논리 단위마다 커밋을 나눈다 (하나의 커밋은 하나의 목적)
- `git add -A` 대신 파일을 지정해 스테이징한다
- 커밋 전 `npm run check` 통과 확인

```bash
git add <파일...>
git commit -m "feat: 변경 내용"
```

## 3. PR

```bash
git push -u origin "feat/#이슈번호-description"
gh pr create --base develop --title "[Feat] 제목" --body-file <본문 파일>
```

- 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 형식, `Closes #이슈번호` 포함
- `develop`·`main`으로 가는 PR은 CI 통과 뒤 머지 가능 (브랜치 보호), `gh pr checks <PR번호> --watch`로 대기

## 4. develop 머지 — Merge commit

```bash
gh pr merge <PR번호> --merge --delete-branch --subject "[Feat] 제목 (#PR번호)"
gh issue close <이슈번호>
git checkout develop && git pull --ff-only
```

- `develop` 머지는 이슈 자동 종료 미지원, `gh issue close`로 직접 종료
- 커밋·PR·이슈 본문에 AI 도구 서명·공동 작성자 표기 금지

## 5. 릴리즈 — develop → main, Squash merge

```bash
gh issue create --title "[Release] v1.0.0 운영 배포" --body-file <본문 파일>
gh pr create --base main --head develop --title "[Release] v1.0.0 운영 배포" --body-file <본문 파일>
gh pr merge <PR번호> --squash --subject "[Release] v1.0.0 운영 배포"
git checkout main && git pull --ff-only
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

- 릴리즈 PR에는 `--delete-branch`를 쓰지 않는다 (`develop`이 지워진다)
- 릴리즈 뒤 `develop`에서 작업을 이어 가려면 `main`을 `develop`으로 되돌려 합치는 PR을 먼저 연다

## 6. 긴급 수정 — hotfix

배포본에 바로 반영해야 하는 수정에 사용

```bash
git checkout main && git pull --ff-only
gh issue create --title "[Fix] 수정 내용" --body-file <본문 파일>
git checkout -b "hotfix/#이슈번호-description"
# 수정 후
gh pr create --base main --title "[Fix] 수정 내용" --body-file <본문 파일>
gh pr merge <PR번호> --merge --delete-branch
git checkout main && git pull --ff-only
git tag -a v1.0.1 -m "v1.0.1" && git push origin v1.0.1
```

- PR 본문에 무엇을 왜 바꿨는지 적는다
- 수정 뒤 `main`을 `develop`으로 되돌려 합치는 PR을 연다
