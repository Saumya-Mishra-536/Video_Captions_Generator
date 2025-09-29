import React, { useMemo } from "react";
import { Video, AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate } from "remotion";
import { BottomCaption, TopBarCaption, KaraokeCaption } from "./CaptionStyles";

interface Props {
  videoFile: File;
  captions: { start: number; end: number; text: string }[];
  preset: string;
}

export default function VideoComposition({ videoFile, captions, preset }: Props) {
  const { durationInFrames, fps } = useVideoConfig();
  const currentFrame = useCurrentFrame();
  
  // Pick which caption style to render based on dropdown choice
  const CaptionComponent =
    preset === "top"
      ? TopBarCaption
      : preset === "karaoke"
      ? KaraokeCaption
      : BottomCaption;

  // Memoize caption calculation to prevent re-renders
  const currentCaption = useMemo(() => {
    if (captions.length === 0) return null;
    
    const currentTime = currentFrame / fps;
    
    // Find the caption that should be active at the current time
    const activeCaption = captions.find(cap => {
      return currentTime >= cap.start && currentTime <= cap.end;
    });
    
    // If no exact match, find the closest caption
    if (!activeCaption) {
      // Find the caption that starts closest to current time
      const sortedCaptions = [...captions].sort((a, b) => Math.abs(a.start - currentTime) - Math.abs(b.start - currentTime));
      const closestCaption = sortedCaptions[0];
      
      // Show the closest caption if we're within 3 seconds (more generous)
      if (Math.abs(closestCaption.start - currentTime) <= 3) {
        return closestCaption;
      }
      
      // If we're between captions, show the previous caption for a bit longer
      const previousCaption = captions
        .filter(cap => cap.end <= currentTime)
        .sort((a, b) => b.end - a.end)[0];
      
      if (previousCaption && (currentTime - previousCaption.end) <= 1) {
        return previousCaption;
      }
    }
    
    return activeCaption;
  }, [captions, currentFrame, fps]);

  // Memoize video URL to prevent re-creation
  const videoUrl = useMemo(() => URL.createObjectURL(videoFile), [videoFile]);

  return (
    <AbsoluteFill>
      {/* Main video - optimized for smooth playback */}
      <Video 
        src={videoUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
        volume={1}
        playbackRate={1}
        startFrom={0}
        endAt={durationInFrames}
      />
      
      {/* Render only current caption with smooth transitions */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: preset === "top" ? "flex-start" : preset === "karaoke" ? "center" : "flex-end",
            justifyContent: "center",
            padding: "20px",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <CaptionComponent text={currentCaption.text} />
        </div>
      )}
      
    </AbsoluteFill>
  );
}