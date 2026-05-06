import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import path from "path";
import type { MissionCard } from "../api/generate-mission/route";

// Pretendard OTF 폰트 등록 (서버 사이드 전용)
Font.register({
  family: "Pretendard",
  fonts: [
    {
      src: path.join(process.cwd(), "public", "fonts", "Pretendard-Regular.otf"),
      fontWeight: 400,
    },
    {
      src: path.join(process.cwd(), "public", "fonts", "Pretendard-Bold.otf"),
      fontWeight: 700,
    },
  ],
});

// 하이픈 자동 삽입 비활성화 (한국어 깨짐 방지)
Font.registerHyphenationCallback((word) => [word]);

// 디자인 토큰
const ACCENT = "#d4875c";
const ACCENT_DARK = "#b06840";
const FG = "#1a1a1a";
const MUTED = "#6b6b6b";
const BORDER = "#e5e5e5";
const BG = "#ffffff";

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG,
    fontFamily: "Pretendard",
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 52,
  },
  // 상단 헤더 영역
  header: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerBadge: {
    fontSize: 8,
    fontWeight: 700,
    color: BG,
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  headerMissionId: {
    fontSize: 8,
    color: BG,
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: BG,
    marginBottom: 5,
    lineHeight: 1.4,
  },
  headerMeta: {
    fontSize: 9,
    color: BG,
    opacity: 0.75,
  },
  // 카드 항목
  fieldBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 11,
    color: FG,
    lineHeight: 1.65,
  },
  // 제약 목록
  constraintRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
  },
  constraintDash: {
    fontSize: 11,
    color: ACCENT_DARK,
    fontWeight: 700,
  },
  constraintText: {
    fontSize: 11,
    color: FG,
    lineHeight: 1.65,
    flex: 1,
  },
  // 구분선
  divider: {
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    marginVertical: 18,
  },
  // 하단 푸터
  footer: {
    position: "absolute",
    bottom: 32,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
    opacity: 0.8,
  },
  footerAccent: {
    fontSize: 8,
    color: ACCENT,
    fontWeight: 700,
  },
});

export function MissionPDF({ card }: { card: MissionCard }) {
  const missionId = `MISSION-0${card.sessionNumber}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerBadge}>
              {card.missionType === "현장" ? "현장 미션" : "과제 미션"}
            </Text>
            <Text style={styles.headerMissionId}>{missionId}</Text>
          </View>
          <Text style={styles.headerTitle}>
            {card.sessionNumber}회차 — {card.sessionTopic}
          </Text>
          <Text style={styles.headerMeta}>
            {card.studentName} · 기르는 능력: {card.skills}
          </Text>
        </View>

        {/* 의뢰인 */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>의뢰인</Text>
          <Text style={styles.fieldValue}>{card.client}</Text>
        </View>

        {/* 상황 */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>상황</Text>
          <Text style={styles.fieldValue}>{card.situation}</Text>
        </View>

        {/* 최종 산출물 */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>최종 산출물</Text>
          <Text style={styles.fieldValue}>{card.deliverable}</Text>
        </View>

        {/* 제약 */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>제약</Text>
          {card.constraints.map((c, i) => (
            <View key={i} style={styles.constraintRow}>
              <Text style={styles.constraintDash}>—</Text>
              <Text style={styles.constraintText}>{c}</Text>
            </View>
          ))}
        </View>

        {/* 성공 기준 */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>성공 기준</Text>
          <Text style={styles.fieldValue}>{card.successCriteria}</Text>
        </View>

        <View style={styles.divider} />

        {/* 심사관 */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>심사관</Text>
          <Text style={styles.fieldValue}>{card.judge}</Text>
        </View>

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text style={styles.footerAccent}>운영자 AI 과외</Text>
          <Text style={styles.footerText}>removed@example.com · [redacted]</Text>
        </View>
      </Page>
    </Document>
  );
}
