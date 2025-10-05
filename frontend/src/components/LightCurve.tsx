import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Download, Info } from "lucide-react";

export const LightCurve = () => {
  // Simulated light curve data points
  const generateLightCurveData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      const time = i * 0.1;
      // Simulate a transit event with periodic dimming
      let flux = 1.0;
      if (i >= 40 && i <= 60) {
        flux = 0.988 - (0.002 * Math.sin((i - 40) * Math.PI / 20));
      }
      // Add noise
      flux += (Math.random() - 0.5) * 0.001;
      data.push({ time, flux });
    }
    return data;
  };

  const lightCurveData = generateLightCurveData();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground glow-text">Light Curve Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Visualize and analyze stellar brightness variations to identify exoplanet transits
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full stellar-gradient">
            <Info className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">About Light Curves</h3>
            <p className="text-muted-foreground">
              A light curve shows how the brightness of a star changes over time. When a planet passes in front of its host star 
              (a transit), it blocks a small amount of light, causing a characteristic dip in the light curve. By analyzing these 
              patterns, we can detect exoplanets and determine their properties.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Light Curve Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Transit Light Curve</h2>
                <Badge className="stellar-gradient">KOI-7016</Badge>
              </div>

              {/* SVG Light Curve Chart */}
              <div className="bg-background/50 rounded-lg p-4 border border-border/20">
                <svg viewBox="0 0 800 300" className="w-full h-auto">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <line
                      key={`grid-${i}`}
                      x1="50"
                      y1={50 + i * 40}
                      x2="750"
                      y2={50 + i * 40}
                      stroke="hsl(var(--border))"
                      strokeOpacity="0.2"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Y-axis */}
                  <line x1="50" y1="30" x2="50" y2="250" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  {/* X-axis */}
                  <line x1="50" y1="250" x2="750" y2="250" stroke="hsl(var(--foreground))" strokeWidth="2" />

                  {/* Y-axis label */}
                  <text x="20" y="140" fill="hsl(var(--muted-foreground))" fontSize="14" transform="rotate(-90 20 140)">
                    Relative Flux
                  </text>

                  {/* X-axis label */}
                  <text x="400" y="280" fill="hsl(var(--muted-foreground))" fontSize="14" textAnchor="middle">
                    Time (days)
                  </text>

                  {/* Plot light curve */}
                  <path
                    d={lightCurveData.map((point, i) => {
                      const x = 50 + (point.time / 10) * 700;
                      const y = 250 - (point.flux - 0.985) * 13333;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />

                  {/* Data points */}
                  {lightCurveData.map((point, i) => {
                    if (i % 3 !== 0) return null;
                    const x = 50 + (point.time / 10) * 700;
                    const y = 250 - (point.flux - 0.985) * 13333;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="hsl(var(--accent))"
                      />
                    );
                  })}

                  {/* Transit region highlight */}
                  <rect
                    x={50 + (4 / 10) * 700}
                    y="30"
                    width={(2 / 10) * 700}
                    height="220"
                    fill="hsl(var(--primary))"
                    fillOpacity="0.1"
                    stroke="hsl(var(--primary))"
                    strokeOpacity="0.3"
                    strokeDasharray="5,5"
                  />

                  {/* Transit label */}
                  <text
                    x={50 + (5 / 10) * 700}
                    y="20"
                    fill="hsl(var(--primary))"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Transit Event
                  </text>
                </svg>
              </div>

              <Button className="w-full stellar-gradient">
                <Download className="mr-2 h-5 w-5" />
                Export Light Curve Data
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Transit Statistics</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Transit Depth</p>
                <p className="text-2xl font-bold text-foreground">1.2%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-foreground">2.1 hrs</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-2xl font-bold text-foreground">3.84 days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Detection Parameters</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Signal-to-Noise:</span>
                <span className="font-semibold text-foreground">24.7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Baseline Flux:</span>
                <span className="font-semibold text-foreground">1.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Min Flux:</span>
                <span className="font-semibold text-foreground">0.988</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ingress Time:</span>
                <span className="font-semibold text-foreground">18 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Egress Time:</span>
                <span className="font-semibold text-foreground">19 min</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Result</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg stellar-gradient">
                <p className="text-lg font-bold text-primary-foreground mb-1">Confirmed Transit</p>
                <p className="text-sm text-primary-foreground/80">High confidence exoplanet detection</p>
              </div>
              <div className="space-y-2">
                <Badge className="w-full justify-center bg-green-500/20 text-green-400 py-2">
                  ✓ Periodic Signal Detected
                </Badge>
                <Badge className="w-full justify-center bg-green-500/20 text-green-400 py-2">
                  ✓ Consistent Transit Shape
                </Badge>
                <Badge className="w-full justify-center bg-green-500/20 text-green-400 py-2">
                  ✓ No Secondary Eclipse
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
            <div className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Data Source</p>
                <p className="text-xs text-muted-foreground">Kepler Q1-Q17 DR25</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
