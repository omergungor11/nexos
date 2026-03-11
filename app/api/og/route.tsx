import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Nexos Emlak";
  const subtitle =
    searchParams.get("subtitle") || "Güvenilir Gayrimenkul Danışmanlığı";
  const type = searchParams.get("type") || "default";

  const isProperty = type === "property";
  const isBlog = type === "blog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            N
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "600",
              letterSpacing: "0.05em",
              opacity: 0.9,
            }}
          >
            NEXOS EMLAK
          </span>
          {isProperty && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: "14px",
                background: "rgba(255,255,255,0.15)",
                padding: "4px 14px",
                borderRadius: "999px",
                letterSpacing: "0.04em",
              }}
            >
              Emlak İlanı
            </span>
          )}
          {isBlog && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: "14px",
                background: "rgba(255,255,255,0.15)",
                padding: "4px 14px",
                borderRadius: "999px",
                letterSpacing: "0.04em",
              }}
            >
              Blog
            </span>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "90%",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 26,
                opacity: 0.75,
                maxWidth: "80%",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: 0.6,
            fontSize: "16px",
          }}
        >
          <span>nexos.com.tr</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
