import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import heroVideo from "@/assets/Homepage_1.mp4";

interface SpaceAmbientAudioProps {
  currentSection: string;
}

export const SpaceAmbientAudio = ({ currentSection }: SpaceAmbientAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element using the hero video's audio track
    audioRef.current = new Audio(heroVideo);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    
    // Store reference globally for VideoBackground to access
    (window as any).heroAudioRef = audioRef;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Auto-play audio after Welcome page transition completes
    if (currentSection === "hero" && audioRef.current && !isPlaying) {
      // Delay to allow PS2 startup sound to finish
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(err => console.log("Audio autoplay failed:", err));
        setIsPlaying(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentSection !== "welcome" && currentSection !== "hero" && audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => console.log("Audio autoplay failed:", err));
      setIsPlaying(true);
    }
  }, [currentSection, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={togglePlay}
        className="rounded-full bg-card/80 backdrop-blur-sm border-border/20 hover:bg-card transition-stellar"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={toggleMute}
        className="rounded-full bg-card/80 backdrop-blur-sm border-border/20 hover:bg-card transition-stellar"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  );
};
