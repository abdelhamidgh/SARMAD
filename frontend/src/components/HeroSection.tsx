import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Telescope, TrendingUp, Upload } from "lucide-react";
import heroVideo from "@/assets/Homepage_1.mp4";
import { VideoBackground } from "@/components/VideoBackground";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const audioRef = (window as any).heroAudioRef;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VideoBackground videoSrc={heroVideo} audioRef={audioRef} />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-card/40 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">
              NASA Space Apps Challenge 2025
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Discover
              </span>
              <br />
              <span className="text-foreground glow-text">New Worlds</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Harness the power of AI to detect exoplanets in NASA's Kepler
              mission data. Advanced machine learning meets space exploration.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="stellar-gradient hover:scale-105 transition-stellar shadow-lg shadow-primary/30"
            >
              Start Detecting
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-card/80 transition-stellar backdrop-blur-sm"
            >
              <Telescope className="mr-2 h-5 w-5" />
              Explore Data
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card className="p-6 bg-card/60 backdrop-blur-md border-border/20 hover:bg-card/80 hover:scale-105 transition-stellar">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full stellar-gradient">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">High Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  96%+ detection accuracy powered by advanced ML models
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/60 backdrop-blur-md border-border/20 hover:bg-card/80 hover:scale-105 transition-stellar">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full stellar-gradient">
                  <Telescope className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Kepler Data</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze data from NASA's groundbreaking Kepler mission
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/60 backdrop-blur-md border-border/20 hover:bg-card/80 hover:scale-105 transition-stellar">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full stellar-gradient">
                  <Upload className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Easy Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your datasets and get instant predictions
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
