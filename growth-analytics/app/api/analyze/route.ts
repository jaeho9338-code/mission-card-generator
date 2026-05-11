import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadStudent } from "@/lib/studentStore";

const SYSTEM_PROMPT = `당신은 중학생의 AI 프롬프트 작성 역량을 평가하는 분석가입니다.

평가 원칙:
- 중학생 기준의 느슨한 기준으로 평가합니다.
- 완벽하지 않아도 시도 자체에 후하게 점수를 줍니다.
- 회차 간 비교의 일관성이 가장 중요합니다.
- 각 지표는 0~100 정수로만 반환합니다.

10개 지표 채점 기준:

DIR (디렉팅 밀도)
0~30:  "~에 대해 알려줘" 수준. 동사 하나짜리 명령.
31~60: 역할 부여 OR 맥락 설명 둘 중 하나 있음.
61~100: 역할 + 맥락 + 구체적 지시 셋 다 있음.

CON (제약 완성도)
0~30:  제약 조건 전혀 없음.
31~60: 한 가지 제약 있음 (길이·톤·형식 중 하나).
61~100: 두 가지 이상 제약 명시.

SPE (구체성 지수)
0~30:  주제가 막연하고 원하는 것이 불명확.
31~60: 주제는 있으나 요구사항이 모호.
61~100: 주제 + 요구사항 + 예상 결과까지 구체적.

LEN (유효 길이)
0~30:  10단어 이하.
31~60: 11~40단어, 정보 밀도 보통.
61~100: 40단어 이상, 군더더기 없이 정보가 촘촘.

CLR (목적 명확도)
0~30:  무엇을 원하는지 불명확, 해석이 여러 가지.
31~60: 목적은 있으나 범위가 너무 넓음.
61~100: 한 문장으로 요약 가능한 명확한 목적.

AUD (청중 인식)
0~30:  독자·사용자 언급 없음.
31~60: 간접적 언급만 ("쉽게", "재미있게").
61~100: 명시적 타겟 독자·사용자 지정.

OUT (출력 설계)
0~30:  출력 형식 언급 없음.
31~60: 간단한 형식 언급 ("목록으로", "짧게").
61~100: 형식 + 분량 + 구조까지 구체적으로 지정.

ORI (독창성 신호)
0~30:  검색창에 그대로 쳐도 될 법한 일반적 요청.
31~60: 약간의 개인화 또는 특이한 각도가 있음.
61~100: 독자적 관점, 가상 시나리오, 창의적 설정 있음.

CTX (맥락 활용도)
0~30:  배경 정보 없음.
31~60: 간단한 배경 제공 ("~를 위해", "~상황에서").
61~100: 구체적 상황·목적·배경을 전략적으로 활용.

ITR (발전 신호)
1회차: 반드시 null 반환.
2회차 이상, 직전 회차와 비교:
0~30:  거의 동일한 패턴. 발전 없음.
31~60: 일부 요소 개선됨.
61~100: 구조적으로 명확히 발전. 새로운 요소 추가됨.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, maxRound } = body;

  if (!name || !maxRound) {
    return NextResponse.json({ error: "name, maxRound 는 필수입니다." }, { status: 400 });
  }

  const student = loadStudent(name);
  if (!student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  // maxRound까지 회차 필터
  const sessions = student.sessions
    .filter((s) => s.round <= maxRound)
    .sort((a, b) => a.round - b.round);

  if (sessions.length === 0) {
    return NextResponse.json({ error: "분석할 데이터가 없습니다." }, { status: 400 });
  }

  const roundLines = sessions
    .map((s) => `${s.round}회차: ${s.prompt}`)
    .join("\n\n");

  const userMessage = `다음은 ${name}의 회차별 프롬프트입니다.
1회차부터 ${sessions[sessions.length - 1].round}회차까지 분석해주세요.

${roundLines}

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "rounds": [
    {
      "round": 1,
      "scores": {
        "DIR": 숫자, "CON": 숫자, "SPE": 숫자, "LEN": 숫자,
        "CLR": 숫자, "AUD": 숫자, "OUT": 숫자,
        "ORI": 숫자, "CTX": 숫자, "ITR": null또는숫자
      },
      "overall": 위 10개 점수의 평균 정수,
      "one_line": "이 회차 프롬프트 한 줄 평가 (20자 이내)",
      "highlights": [
        {"text": "하이라이트할 텍스트 그대로", "type": "role|context|constraint|format"}
      ]
    }
  ],
  "growth_summary": "전체 성장에 대한 두 문장 요약. 구체적 수치 포함."
}

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

  // JSON 파싱 — 코드블록 래핑 제거 후 파싱
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const result = JSON.parse(cleaned);

  return NextResponse.json(result);
}
