import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { MissionPDF } from "../../components/MissionPDF";
import type { MissionCard } from "../generate-mission/route";

export async function POST(req: NextRequest) {
  const card: MissionCard = await req.json();

  // JSX로 전달해야 @react-pdf/renderer 타입이 정확히 맞음
  const buffer = await renderToBuffer(<MissionPDF card={card} />);

  const filename = `미션카드_${card.sessionNumber}회차_${card.studentName}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
