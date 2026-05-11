"use client";

import { useState } from "react";
import InputTab from "@/components/InputTab";
import ReportTab from "@/components/ReportTab";

type Tab = "input" | "report";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("input");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* 헤더 */}
      <header
        className="border-b px-8 py-5"
        style={{ borderColor: "var(--border)" }}
      >
        <h1
          className="text-lg"
          style={{
            fontFamily: "Pretendard, sans-serif",
            color: "var(--subtext)",
            letterSpacing: "0.2em",
          }}
        >
          Growth Analytics
        </h1>
      </header>

      {/* 탭 바 */}
      <nav
        className="flex border-b px-8"
        style={{ borderColor: "var(--border)" }}
      >
        {(["input", "report"] as Tab[]).map((tab) => {
          const label = tab === "input" ? "INPUT" : "REPORT";
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-4 text-sm transition-colors"
              style={{
                fontFamily: "Pretendard, sans-serif",
                letterSpacing: "0.15em",
                color: isActive ? "var(--text)" : "var(--subtext)",
                borderBottom: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* 탭 콘텐츠 */}
      <main className="px-8 py-8 max-w-5xl mx-auto">
        {activeTab === "input" ? <InputTab /> : <ReportTab />}
      </main>
    </div>
  );
}
