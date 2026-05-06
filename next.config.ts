import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer는 서버에서 번들링하지 않고 외부 패키지로 처리
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
