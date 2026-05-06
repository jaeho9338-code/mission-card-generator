import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// 회차별 수업 정보 — 프롬프트 맥락용
const SESSION_INFO: Record<number, { topic: string; objective: string; skills: string }> = {
  1: {
    topic: "처음 만남 — 왜 AI인가",
    objective: "AI로 만든 작품 30개를 좋은 것/평범한 것/나쁜 것으로 분류하고 이유를 본인 언어로 설명",
    skills: "안목·동기",
  },
  2: {
    topic: "AI에게 시키는 법",
    objective: "동일한 결과물을 한 줄 명령형·역할+맥락+제약·예시 첨부 세 방식으로 시켜 비교 분석",
    skills: "디렉팅",
  },
  3: {
    topic: "글과 발표 자료",
    objective: "처음 듣는 주제로 슬라이드 8~10장 + 5분 발표 스크립트를 60분 안에 완성. 사실 오류 0건 목표",
    skills: "제작·디렉팅·검증",
  },
  4: {
    topic: "전문가의 톤으로 글쓰기",
    objective: "관심 분야의 전문가 칼럼/리뷰/분석 글 800~1200자 작성",
    skills: "디렉팅·검증·완성도",
  },
  5: {
    topic: "이미지 시리즈 만들기",
    objective: "본인 캐릭터 1개를 정하고 8가지 표정·포즈를 일관된 스타일로 제작",
    skills: "제작·안목",
  },
  6: {
    topic: "음성과 영상 만들기",
    objective: "가상 제품의 30초 광고 영상 제작 — 콘셉트 1쪽 → 소재 추출 → 영상 합성",
    skills: "제작·디렉팅·완성도",
  },
  7: {
    topic: "PC 웹 도구 만들기",
    objective: "친구나 본인이 실제로 쓸 수 있는 PC 웹 도구 1개 제작 후 URL로 공유",
    skills: "제작·오너십",
  },
  8: {
    topic: "다듬기와 가려내기",
    objective: "AI 헛소리 5가지 중 거짓 2개 가려내기 + 이전 작품 중 가장 아쉬운 것 95점으로 리메이크",
    skills: "검증·완성도",
  },
  9: {
    topic: "부모님께 발표",
    objective: "9회차 동안 배운 것과 작품을 슬라이드+시연+5~10분으로 부모님께 직접 발표",
    skills: "오너십·발표력·종합",
  },
};

export type MissionCard = {
  sessionNumber: number;
  sessionTopic: string;
  skills: string;
  studentName: string;
  missionType: "현장" | "과제";
  client: string;
  situation: string;
  deliverable: string;
  constraints: string[];
  successCriteria: string;
  judge: string;
};

export async function POST(req: NextRequest) {
  const { sessionNumber, studentName, interest, missionType } = await req.json();
  const session = SESSION_INFO[Number(sessionNumber)];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `당신은 중학생 대상 AI 활용 과외 수업의 미션 카드 생성 전문가입니다.
미션 카드는 "가상의 의뢰인이 시킨 실제 일"처럼 생생하게 만들어야 합니다.

규칙:
- 의뢰인은 학생 관심 분야와 직접 연결되는 구체적 인물·직책이어야 합니다
- 상황은 마감·긴박감·현실감이 있어야 합니다 (1~2문장)
- 산출물은 해당 회차 학습 목표에 부합하면서 관심 분야에 맞게 변형되어야 합니다
- 제약은 2~3개, 구체적이고 측정 가능하게
- 반드시 JSON만 반환하고 다른 텍스트는 절대 포함하지 마세요`,
    messages: [
      {
        role: "user",
        content: `다음 정보로 미션 카드를 만들어 주세요.

회차: ${sessionNumber}회차 — ${session.topic}
이 회차 목표: ${session.objective}
기르는 능력: ${session.skills}
학생 이름: ${studentName}
관심 분야: ${interest}
미션 종류: ${missionType} (${missionType === "현장" ? "수업 중 60~80분 내 제작" : "수업 후 다음 회차까지 제출"})

JSON 형식으로만 응답:
{
  "client": "의뢰인 이름 또는 직책",
  "situation": "의뢰인이 처한 상황 1~2문장",
  "deliverable": "학생이 만들어야 할 최종 결과물 (형식·분량 포함)",
  "constraints": ["조건1", "조건2", "조건3"],
  "successCriteria": "의뢰인이 납품을 수락하는 기준 1문장",
  "judge": "심사관 역할"
}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
  // 마크다운 코드블록이 붙어 올 경우 제거
  const jsonText = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const generated = JSON.parse(jsonText);

  const result: MissionCard = {
    sessionNumber: Number(sessionNumber),
    sessionTopic: session.topic,
    skills: session.skills,
    studentName,
    missionType,
    ...generated,
  };

  return NextResponse.json(result);
}
