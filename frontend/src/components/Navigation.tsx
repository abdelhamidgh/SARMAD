import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Telescope,
  BarChart3,
  Upload,
  Search,
  Menu,
  X,
  Satellite,
  LineChart,
  MessageSquare,
  Users,
} from "lucide-react";

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({
  currentSection,
  onSectionChange,
}: NavigationProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Mission Control", icon: BarChart3 },
    { id: "detector", label: "AI Detector", icon: Telescope },
    { id: "search", label: "Exoplanet Search", icon: Search },
    { id: "community", label: "Research Community", icon: Users },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 backdrop-blur-md">
        <Card className="rounded-none border-0 bg-card/80">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full animate-pulse-glow">
                  <img
                    src="../public/planet.png"
                    alt="SARMAD"
                    className="h-14 w-auto object-contain"
                    width={56}
                    height={86}

                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Kepler Exoplanet Detection
                  </p>
                </div>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onSectionChange(item.id)}
                      className={`gap-2 transition-stellar ${
                        isActive
                          ? "stellar-gradient shadow-lg shadow-primary/30"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                {isMobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-background/95 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <Card className="fixed top-16 left-0 right-0 m-4 p-4 bg-card/95 backdrop-blur-md border-border/20">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`justify-start gap-3 ${
                      isActive ? "stellar-gradient" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
