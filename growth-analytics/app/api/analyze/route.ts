import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadStudent } from "@/lib/studentStore";

const SYSTEM_PROMPT = `당신은 중학생의 AI 프롬프트 작성 역량을 평가하는 분석가입니다.

평가 원칙:
- 채점 기준을 엄격하게 적용합니다. 평균적인 중학생 프롬프트는 20~40점 범위입니다.
- 60점 이상은 명확한 근거가 있을 때만 줍니다.
- 80점 이상은 매우 드물며, 해당 지표에서 전문적 수준일 때만 가능합니다.
- 회차 간 비교의 일관성이 가장 중요합니다. 같은 기준을 모든 회차에 동일하게 적용합니다.
- 각 지표는 0~100 정수로만 반환합니다.

10개 지표 채점 기준 (엄격 적용):

DIR (디렉팅 밀도)
0~20:  단순 질문 또는 한 줄 명령. "~알려줘", "~써줘" 수준. 구조 없음.
21~45: 역할 부여 OR 맥락 설명 둘 중 하나만 있음.
46~70: 역할 + 맥락 두 가지 모두 있으나 구체성 부족하거나 서로 연결 안 됨.
71~100: 역할 + 맥락 + 구체적 지시 셋 다 있고 유기적으로 연결됨. 매우 드묾.

CON (제약 완성도)
0~15:  제약 조건 전혀 없음.
16~40: 한 가지 제약 있음. "자세히", "간단히" 같은 모호한 표현은 20점 이하.
41~65: 두 가지 이상 제약 명시. 단 하나라도 모호하면 60점 초과 불가.
66~100: 세 가지 이상 구체적 제약 (분량·톤·형식·금지사항 등). 매우 드묾.

SPE (구체성 지수)
0~20:  주제 자체가 막연. "~에 대해", "좀 알려줘" 수준.
21~45: 주제는 있으나 원하는 결과가 명시되지 않음.
46~65: 주제 + 원하는 결과 명시. 예시나 기대 형식은 없음.
66~100: 주제 + 원하는 결과 + 예시 또는 기대 형식까지 구체적. 드묾.

LEN (유효 길이)
0~20:  10단어 이하 또는 단순 반복으로 채운 경우.
21~40: 11~25단어. 정보 있음.
41~60: 26~50단어. 정보 밀도 보통.
61~100: 50단어 이상이며 군더더기 없이 정보가 촘촘함. (길이만 길고 중복이 많으면 60점 이하.)

CLR (목적 명확도)
0~20:  읽고 나서 해석이 두 가지 이상 가능. 무엇을 원하는지 불명확.
21~45: 목적은 있으나 범위가 너무 넓거나 추상적.
46~65: 목적과 범위가 있으나 경계가 약간 모호함.
66~100: 한 문장으로 정확히 요약 가능. 의도 파악에 혼란 없음. 드묾.

AUD (청중 인식)
0~15:  독자·사용자 언급 없음.
16~35: 간접적 언급만 ("쉽게", "재미있게"). 타겟 불명확.
36~60: 타겟 독자 명시. 단 나이·수준·목적 중 하나만.
61~100: 타겟을 나이·수준·목적 등 두 가지 이상으로 구체적 지정. 드묾.

OUT (출력 설계)
0~15:  출력 형식 언급 없음.
16~35: 간단한 형식 언급 ("목록으로", "짧게"). 매우 모호.
36~60: 형식 + 분량 중 한 가지 구체적 지정.
61~100: 형식 + 분량 + 구조(섹션·순서 등)까지 모두 지정. 드묾.

ORI (독창성 신호)
0~20:  검색창에 그대로 쳐도 될 수준. 완전히 일반적.
21~40: 약간의 개인화 또는 특이한 소재. 접근법은 평범.
41~65: 독자적 관점 또는 가상 시나리오가 있음. 창의적 시도 보임.
66~100: 독자적 관점 + 창의적 설정이 함께 있고 프롬프트 전체에 녹아있음. 매우 드묾.

CTX (맥락 활용도)
0~20:  배경 정보 없음. 맥락 없이 요청만.
21~40: 한 문장 이내의 간단한 배경 ("~를 위해", "~상황에서").
41~60: 구체적 상황 또는 목적 설명. 전략적 활용까지는 아님.
61~100: 배경·상황·목적·제약을 전략적으로 배치해 AI의 답변 방향을 유도. 드묾.

ITR (발전 신호)
시작 회차: 반드시 null 반환.
그 다음 회차부터, 직전 회차와 비교:
0~20:  거의 동일한 패턴. 의미있는 변화 없음.
21~45: 한 가지 요소만 개선 (예: 길이만 늘어남, 형식만 추가됨).
46~70: 두 가지 이상 요소 개선 또는 구조적 변화 있음.
71~100: 전반적 구조 + 새로운 요소 추가 + 이전 약점 보완. 명확한 도약.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, startRound, endRound } = body;

  if (!name || !startRound || !endRound) {
    return NextResponse.json(
      { error: "name, startRound, endRound 는 필수입니다." },
      { status: 400 }
    );
  }

  const student = loadStudent(name);
  if (!student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const sessions = student.sessions
    .filter((s) => s.round >= startRound && s.round <= endRound)
    .sort((a, b) => a.round - b.round);

  if (sessions.length === 0) {
    return NextResponse.json({ error: "해당 범위에 분석할 데이터가 없습니다." }, { status: 400 });
  }

  const roundLines = sessions
    .map((s) => `${s.round}회차: ${s.prompt}`)
    .join("\n\n");

  const firstRound = sessions[0].round;
  const lastRound = sessions[sessions.length - 1].round;

  const userMessage = `다음은 ${name}의 회차별 프롬프트입니다.
${firstRound}회차부터 ${lastRound}회차까지 분석해주세요.

${roundLines}

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "rounds": [
    {
      "round": ${firstRound},
      "scores": {
        "DIR": 숫자, "CON": 숫자, "SPE": 숫자, "LEN": 숫자,
        "CLR": 숫자, "AUD": 숫자, "OUT": 숫자,
        "ORI": 숫자, "CTX": 숫자, "ITR": ${firstRound === 1 ? "null (1회차이므로 반드시 null)" : "숫자"}
      },
      "overall": 위 ITR을 제외한 9개 점수의 평균 정수,
      "one_line": "이 회차 프롬프트 한 줄 평가 (20자 이내)",
      "highlights": [
        {"text": "하이라이트할 텍스트 그대로", "type": "role|context|constraint|format"}
      ]
    }
  ],
  "growth_summary": "5~6문장의 구체적 성장 분석"
}

overall 계산 규칙:
- ITR이 null인 회차: DIR+CON+SPE+LEN+CLR+AUD+OUT+ORI+CTX 9개 평균
- ITR이 숫자인 회차: 10개 평균

growth_summary 작성 규칙 (반드시 준수):
- 5~6문장 분량
- 시작 회차(${firstRound}회차)와 종료 회차(${lastRound}회차)의 overall 점수를 명시
- 가장 크게 성장한 지표 2개와 변화 수치를 구체적으로 언급
- 아직 개선이 필요한 지표 1개와 그 이유를 구체적으로 서술
- 프롬프트 문체 또는 구조의 질적 변화를 한 문장으로 표현
- 다음 단계에서 집중할 점을 제언으로 마무리

highlights 규칙:
- role: 역할 부여 텍스트
- context: 맥락·배경 설명 텍스트
- constraint: 제약 조건 텍스트
- format: 출력 형식 지정 텍스트
- 해당 없으면 빈 배열 []`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY 가 설정되지 않았습니다. growth-analytics/.env.local 파일에 ANTHROPIC_API_KEY=sk-ant-... 를 추가하고 서버를 재시작하세요.",
      },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const result = JSON.parse(cleaned);

  return NextResponse.json(result);
}
