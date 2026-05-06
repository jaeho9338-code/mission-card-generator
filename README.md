# 미션 카드 생성기

부산 중학생 대상 AI 활용 과외(9회차)에서 매 회차 학생에게 줄 미션 카드를 자동 생성하는 도구입니다.
학생의 관심 분야(축구, 게임, K-pop 등)를 입력하면 같은 회차라도 다른 의뢰인·상황·산출물이 담긴 A4 PDF를 만들어 줍니다.

---

## 시작하기 전에

- **Node.js 22+** 필요 (`nvm install 22`로 설치)
- **Anthropic API 키** 필요 (claude.ai 또는 console.anthropic.com에서 발급)

---

## 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 ANTHROPIC_API_KEY 값을 채워 넣으세요

# 3. 개발 서버 실행
source ~/.nvm/nvm.sh && npm run dev
```

브라우저에서 **http://localhost:3000** 접속

---

## 사용 방법

1. **회차** 선택 (1~9, 드롭다운)
2. **학생 이름** 입력
3. **관심 분야** 입력 — 예: `축구`, `게임`, `K-pop`, `과학`, `역사`
4. **미션 종류** 선택 — 현장(수업 중 제작) / 과제(수업 후 제출)
5. **미션 카드 생성하기** 클릭 → AI가 맞춤형 미션 내용 생성
6. 결과 확인 후 **PDF 다운로드** 클릭

다운로드 파일명: `미션카드_4회차_김민준.pdf`

---

## 핵심 동작

같은 회차라도 관심 분야에 따라 **의뢰인 · 상황 · 산출물**이 다르게 생성됩니다.

| 회차 | 관심 분야 | 의뢰인 | 산출물 |
|------|----------|--------|--------|
| 4회차 | 축구 | 축구 전문지 편집장 | 축구 칼럼 1편 |
| 4회차 | 게임 | 게임 매거진 에디터 | 게임 분석 글 |
| 7회차 | 과학 | 같은 반 친구 | 과학 학습 웹 도구 |

---

## 프로젝트 구조

```
app/
├── page.tsx                        # 입력 폼 + 결과 미리보기
├── api/
│   ├── generate-mission/route.ts   # Anthropic API 호출 → 미션 JSON 생성
│   └── download-pdf/route.tsx      # PDF 렌더링 → 파일 다운로드
└── components/
    └── MissionPDF.tsx              # @react-pdf/renderer PDF 문서 컴포넌트
docs/
├── CONTEXT.md                      # 수업 도메인 컨텍스트 (회차/능력/카드 양식/톤)
└── 학부모용_안내문.docx             # 디자인 톤·수업 구조 원본
public/fonts/                       # Pretendard OTF (PDF 내장용)
```

---

## 환경 변수

| 변수 | 설명 |
|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 키 (`.env.local`에 설정) |

---

## 기술 스택

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **@anthropic-ai/sdk** — 미션 내용 동적 생성 (claude-sonnet-4-6)
- **@react-pdf/renderer** — 서버 사이드 A4 PDF 생성
- **Pretendard** — 한국어 본문 폰트
