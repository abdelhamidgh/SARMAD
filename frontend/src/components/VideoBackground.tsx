import { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoSrc: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export const VideoBackground = ({ videoSrc, audioRef }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      
      {/* Separate audio element for video sound */}
      <audio ref={audioRef} loop>
        <source src={videoSrc} type="video/mp4" />
      </audio>
      
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60" />
      <div className="absolute inset-0 star-field opacity-40" />
    </div>
  );
};
