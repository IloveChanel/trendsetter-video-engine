import React from "react";
import { Img, staticFile } from "remotion";

export const PhoneMockup: React.FC<{ src: string }> = ({ src }) => (
  <div style={{ width: 380, height: 780, borderRadius: 44, border: "10px solid #1E3D2F", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", backgroundColor: "#F6F3EB" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);
