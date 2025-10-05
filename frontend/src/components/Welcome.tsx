import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import introVideo from "@/assets/Intro.mp4";

interface WelcomeProps {
  onEnter: () => void;
}

export const Welcome = ({ onEnter }: WelcomeProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEnter = () => {
    setIsTransitioning(true);

    // Play PS2 startup sound during transition
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.log("Audio play failed:", err));
    }

    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${
          isTransitioning ? "animate-zoom-out" : ""
        }`}
      >
        <source src={introVideo} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-background/30 transition-opacity duration-1000 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle-field"></div>
      </div>

      <div
        className={`relative z-10 text-center space-y-8 transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border-2 border-primary/30 bg-card/40 backdrop-blur-sm animate-pulse-glow">
            <img
              src="../public/planet.png"
              alt="SARMAD"
              className="h-20 w-auto object-contain"
            />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight glow-text">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Welcome, Researcher
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Embark on a journey to discover new worlds beyond our solar system
          </p>
        </div>

        <Button
          onClick={handleEnter}
          size="lg"
          className="stellar-gradient text-lg px-8 py-6 rounded-full hover:scale-110 transition-stellar shadow-lg shadow-primary/50"
        >
          <Rocket className="mr-2 h-5 w-5" />
          Begin Exploration
        </Button>
      </div>

      {/* PS2 Startup Audio */}
      <audio ref={audioRef} src="/audio/ps2-startup.mp3" preload="auto" />
    </div>
  );
};
