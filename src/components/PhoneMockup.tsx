import React from "react";
import { Img, getStaticFiles, staticFile } from "remotion";
import verifylyBrand from "../../config/brands/verifyly.json";

/** True if `src` exists in public/ (Remotion injects the file list into Studio and bundled renders). */
function existsInPublic(src: string): boolean {
  try {
    const name = src.replace(/^\/+/, "");
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
}

/**
 * Phone frame showing an app screenshot from public/. If the screenshot hasn't been
 * synced into public/ yet, a branded placeholder screen is shown instead of failing the render.
 */
export const PhoneMockup: React.FC<{ src: string }> = ({ src }) => {
  const c = verifylyBrand.colors;
  return (
    <div style={{ width: 380, height: 780, borderRadius: 44, border: `10px solid ${c.primary}`, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", backgroundColor: c.background, flexShrink: 0 }}>
      {existsInPublic(src) ? (
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "sans-serif", color: c.primary, padding: 32, boxSizing: "border-box", textAlign: "center" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: c.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 700 }}>✓</div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{verifylyBrand.brandName}</div>
          <div style={{ fontSize: 24, opacity: 0.8, overflowWrap: "break-word" }}>{verifylyBrand.tagline}</div>
          <div style={{ marginTop: 16, padding: "16px 36px", borderRadius: 999, backgroundColor: c.primary, color: "#fff", fontSize: 24, fontWeight: 600 }}>Scan · Upload · Verify</div>
        </div>
      )}
    </div>
  );
};
