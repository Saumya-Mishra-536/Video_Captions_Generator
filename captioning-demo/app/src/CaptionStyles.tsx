import React from "react";

export const BottomCaption = ({ text }: { text: string }) => (
  <div
    style={{
      position: "absolute",
      bottom: 40,
      width: "100%",
      textAlign: "center",
      fontSize: 40,
      color: "yellow",
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      textShadow: "2px 2px 4px black",
    }}
  >
    {text}
  </div>
);

export const TopBarCaption = ({ text }: { text: string }) => (
  <div
    style={{
      position: "absolute",
      top: 10,
      width: "100%",
      textAlign: "center",
      padding: 10,
      background: "rgba(0,0,0,0.5)",
      color: "white",
      fontSize: 28,
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
    }}
  >
    {text}
  </div>
);

export const KaraokeCaption = ({ text }: { text: string }) => (
  <div
    style={{
      position: "absolute",
      bottom: 80,
      width: "100%",
      textAlign: "center",
      fontSize: 36,
      color: "cyan",
      fontWeight: "bold",
      fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      textShadow: "1px 1px 3px black",
    }}
  >
    {text}
  </div>
);