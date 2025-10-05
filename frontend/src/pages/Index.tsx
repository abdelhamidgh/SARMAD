import { useState, useEffect } from "react";
import { Auth } from "@/components/Auth";
import { Welcome } from "@/components/Welcome";
import { HeroSection } from "@/components/HeroSection";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import ExoDetector from "@/components/ExoDetector";
import { ExoplanetSearch } from "@/components/ExoplanetSearch";
import { SpaceAmbientAudio } from "@/components/SpaceAmbientAudio";
import { ResearchCommunity } from "@/components/ResearchCommunity";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("auth");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [researcherUsername, setResearcherUsername] = useState<string>("");

  const handleAuthSuccess = (token: string, username: string) => {
    setIsAuthenticated(true);
    setAuthToken(token);
    setResearcherUsername(username);

    // Store token globally for API calls
    (window as any).authToken = token;

    setCurrentSection("welcome");
  };

  // Clean up token on unmount
  useEffect(() => {
    return () => {
      delete (window as any).authToken;
    };
  }, []);

  const handleWelcomeEnter = () => {
    setCurrentSection("hero");
  };

  const handleGetStarted = () => {
    setCurrentSection("dashboard");
  };

  const renderCurrentSection = () => {
    // Show Auth page first if not authenticated
    if (!isAuthenticated) {
      return <Auth onAuthSuccess={handleAuthSuccess} />;
    }

    // Once authenticated, show the rest of the flow
    switch (currentSection) {
      case "welcome":
        return <Welcome onEnter={handleWelcomeEnter} />;
      case "hero":
        return <HeroSection onGetStarted={handleGetStarted} />;
      case "dashboard":
        return <Dashboard />;
      case "detector":
        return <ExoDetector />;
      case "search":
        return <ExoplanetSearch />;
      case "community":
        return <ResearchCommunity />;
      default:
        return <Welcome onEnter={handleWelcomeEnter} />;
    }
  };

  return (
    <div className="min-h-screen cosmic-gradient">
      {isAuthenticated &&
        currentSection !== "welcome" &&
        currentSection !== "hero" && (
          <Navigation
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />
        )}
      <main
        className={
          isAuthenticated &&
          currentSection !== "welcome" &&
          currentSection !== "hero"
            ? "pt-20"
            : ""
        }
      >
        {renderCurrentSection()}
      </main>
      <SpaceAmbientAudio currentSection={currentSection} />
    </div>
  );
};

export default Index;
