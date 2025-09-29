import React from "react";

export const BottomCaption = ({ text }: { text: string }) => (
  <div
    style={{
      textAlign: "center",
      fontSize: 40,
      color: "yellow",
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      textShadow: "2px 2px 4px black",
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: "12px 16px",
      borderRadius: "8px",
      maxWidth: "90%",
      margin: "0 auto",
      willChange: "auto",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    }}
  >
    {text}
  </div>
);

export const TopBarCaption = ({ text }: { text: string }) => (
  <div
    style={{
      textAlign: "center",
      padding: "15px 16px",
      background: "rgba(0,0,0,0.8)",
      color: "white",
      fontSize: 32,
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      borderRadius: "8px",
      textShadow: "1px 1px 2px black",
      maxWidth: "90%",
      margin: "0 auto",
      willChange: "auto",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    }}
  >
    {text}
  </div>
);

export const KaraokeCaption = ({ text }: { text: string }) => (
  <div
    style={{
      textAlign: "center",
      fontSize: 36,
      color: "cyan",
      fontWeight: "bold",
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      textShadow: "2px 2px 4px black",
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: "15px 16px",
      borderRadius: "8px",
      maxWidth: "90%",
      margin: "0 auto",
      willChange: "auto",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    }}
  >
    {text}
  </div>
);