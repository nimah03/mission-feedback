# 성결대 유학생 단기선교 피드백 수집 앱

구글 문서의 「단기선교 피드백」 양식을 웹 폼으로 만들어, 팀원들이 각자 작성한 내용을
**Supabase 데이터베이스**에 모으고, **관리자 대시보드**에서 결과(점수 평균/응답 목록)를
확인할 수 있는 앱입니다.

- 기술: React + Vite + Supabase
- 페이지
  - `/` : 피드백 작성 폼 (팀원 공유용)
  - `/dashboard` : 결과 대시보드 (점수 평균, 응답 목록, 상세 보기)

---

## 준비물

- [Node.js](https://nodejs.org) (설치되어 있음)
- 무료 [Supabase](https://supabase.com) 계정
- (배포 시) 무료 [Vercel](https://vercel.com) 계정 + GitHub 계정

---

## 1단계. Supabase 프로젝트 만들기

1. https://supabase.com 접속 → **Start your project** → GitHub 등으로 로그인
2. **New project** 클릭
   - Name: 자유롭게 (예: `mission-feedback`)
   - Database Password: 아무 비밀번호나 설정 (기억해두기)
   - Region: `Northeast Asia (Seoul)` 권장
3. 프로젝트가 생성될 때까지 1~2분 기다립니다.

### 테이블 만들기

1. 왼쪽 메뉴에서 **SQL Editor** 클릭 → **New query**
2. 이 프로젝트의 `supabase_schema.sql` 파일 내용을 전부 복사해 붙여넣기
3. **Run** 버튼 클릭 → "Success" 가 뜨면 완료

### 접속 키 복사

1. 왼쪽 메뉴 맨 아래 **Project Settings** (톱니바퀴) → **API**
2. 아래 두 값을 복사해 둡니다.
   - **Project URL** (예: `https://abcd1234.supabase.co`)
   - **anon public** key (아주 긴 문자열)

---

## 2단계. 환경변수 입력

프로젝트 폴더의 `.env` 파일을 열어 위에서 복사한 값을 넣습니다.

```
VITE_SUPABASE_URL=https://여기에_당신의_project_url
VITE_SUPABASE_ANON_KEY=여기에_당신의_anon_key
```

> `.env` 파일은 git에 올라가지 않도록 설정되어 있습니다. (키 노출 방지)

---

## 3단계. 로컬에서 실행해 보기

```bash
npm install      # 최초 1회
npm run dev
```

터미널에 나오는 주소(보통 `http://localhost:5173`)를 브라우저에서 엽니다.

- 폼을 채우고 **제출** → `/dashboard` 로 이동해 응답이 쌓이는지 확인하세요.

---

## 4단계. Vercel로 배포해서 링크 공유하기

가장 쉬운 방법은 GitHub + Vercel 연동입니다.

### (A) GitHub에 코드 올리기

```bash
git init
git add .
git commit -m "단기선교 피드백 앱"
```

그다음 GitHub에서 새 저장소(repository)를 만들고, 안내되는 명령으로 push 합니다.

### (B) Vercel 배포

1. https://vercel.com → GitHub으로 로그인
2. **Add New... → Project** → 방금 만든 저장소 선택 → **Import**
3. **Environment Variables** 섹션에 다음 2개를 추가:
   - `VITE_SUPABASE_URL` = (당신의 Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (당신의 anon key)
4. **Deploy** 클릭 → 1~2분 후 배포 완료
5. 생성된 주소(예: `https://mission-feedback.vercel.app`)를 팀원들에게 공유하세요!

- 팀원 공유: `https://내주소.vercel.app/`
- 결과 확인(관리자): `https://내주소.vercel.app/dashboard`

---

## 보안 관련 참고

현재는 소규모 내부용으로, **누구나 링크로 제출/조회**할 수 있게 설정되어 있습니다.
결과 대시보드를 관리자만 보게 하려면:

- `supabase_schema.sql` 의 "anyone can read feedback" 정책을 제거하고,
  Supabase 인증(로그인) 기반 정책으로 바꾸면 됩니다. (원하시면 추가로 도와드릴 수 있어요.)

---

## 폴더 구조

```
mission-feedback/
├─ src/
│  ├─ data/questions.js       # 피드백 문항 정의 (문서 구조 그대로)
│  ├─ lib/supabase.js         # Supabase 연결
│  ├─ pages/FormPage.jsx      # 작성 폼
│  ├─ pages/DashboardPage.jsx # 결과 대시보드
│  ├─ App.jsx                 # 라우팅/레이아웃
│  └─ App.css / index.css     # 스타일
├─ supabase_schema.sql        # DB 테이블 생성 SQL
├─ .env                       # Supabase 키 (직접 입력)
└─ vercel.json                # 배포용 라우팅 설정
```
