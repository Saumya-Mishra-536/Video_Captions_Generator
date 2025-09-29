import React from "react";
import { Sequence, Video, AbsoluteFill } from "remotion";
import { BottomCaption, TopBarCaption, KaraokeCaption } from "./CaptionStyles";

interface Props {
  videoFile: File;
  captions: { start: number; end: number; text: string }[];
  preset: string;
}

export default function VideoComposition({ videoFile, captions, preset }: Props) {
  // Pick which caption style to render based on dropdown choice
  const CaptionComponent =
    preset === "top"
      ? TopBarCaption
      : preset === "karaoke"
      ? KaraokeCaption
      : BottomCaption;

  return (
    <AbsoluteFill>
      {/* Main video */}
      <Video src={URL.createObjectURL(videoFile)} />
      
      {/* Caption overlay sequences */}
      {captions.map((cap, i) => (
        <Sequence
          key={i}
          from={Math.floor(cap.start * 30)}  // Convert start time (s) to frames
          durationInFrames={Math.floor((cap.end - cap.start) * 30)} // duration in frames
        >
          <CaptionComponent text={cap.text} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}