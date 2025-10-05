import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Ruler, Thermometer, Calendar, Star } from "lucide-react";

interface Exoplanet {
  id: string;
  name: string;
  type: string;
  mass: string;
  radius: string;
  temperature: string;
  orbitalPeriod: string;
  hostStar: string;
  distance: string;
  discovered: string;
  keplerID: string;
  gradient: string;
}

const keplerExoplanets: Exoplanet[] = [
  {
    id: "kepler-452b",
    name: "Kepler-452b",
    type: "Super Earth",
    mass: "5.0 Earth masses",
    radius: "1.6 Earth radii",
    temperature: "265 K (-8°C)",
    orbitalPeriod: "385 days",
    hostStar: "Kepler-452",
    distance: "1,402 light-years",
    discovered: "2015",
    keplerID: "KOI-7016",
    gradient: "from-cyan-400 via-teal-400 to-emerald-500"
  },
  {
    id: "kepler-22b",
    name: "Kepler-22b",
    type: "Super Earth",
    mass: "9.1 Earth masses",
    radius: "2.4 Earth radii",
    temperature: "262 K (-11°C)",
    orbitalPeriod: "290 days",
    hostStar: "Kepler-22",
    distance: "620 light-years",
    discovered: "2011",
    keplerID: "KOI-87",
    gradient: "from-blue-400 via-cyan-400 to-teal-500"
  },
  {
    id: "kepler-186f",
    name: "Kepler-186f",
    type: "Terrestrial",
    mass: "1.4 Earth masses",
    radius: "1.1 Earth radii",
    temperature: "188 K (-85°C)",
    orbitalPeriod: "130 days",
    hostStar: "Kepler-186",
    distance: "582 light-years",
    discovered: "2014",
    keplerID: "KOI-571",
    gradient: "from-red-400 via-orange-400 to-amber-500"
  },
  {
    id: "kepler-442b",
    name: "Kepler-442b",
    type: "Super Earth",
    mass: "2.3 Earth masses",
    radius: "1.3 Earth radii",
    temperature: "233 K (-40°C)",
    orbitalPeriod: "112 days",
    hostStar: "Kepler-442",
    distance: "1,206 light-years",
    discovered: "2015",
    keplerID: "KOI-4742",
    gradient: "from-purple-400 via-pink-400 to-fuchsia-500"
  },
  {
    id: "kepler-16b",
    name: "Kepler-16b",
    type: "Gas Giant",
    mass: "0.33 Jupiter masses",
    radius: "0.75 Jupiter radii",
    temperature: "200 K (-73°C)",
    orbitalPeriod: "229 days",
    hostStar: "Kepler-16 (Binary)",
    distance: "245 light-years",
    discovered: "2011",
    keplerID: "KOI-3444",
    gradient: "from-orange-400 via-amber-400 to-yellow-500"
  }
];

export const ExoplanetSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);

  const filteredExoplanets = keplerExoplanets.filter(planet =>
    planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planet.keplerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planet.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground glow-text">Kepler Exoplanet Search</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search and explore confirmed exoplanets discovered by NASA's Kepler mission
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, KOI ID, or planet type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border/30"
          />
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Search Results List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Results ({filteredExoplanets.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredExoplanets.map((planet) => (
              <Card
                key={planet.id}
                className={`p-4 bg-card/80 backdrop-blur-sm border-border/20 cursor-pointer transition-stellar hover:scale-105 ${
                  selectedPlanet?.id === planet.id ? 'ring-2 ring-cyan-400/50' : ''
                }`}
                onClick={() => setSelectedPlanet(planet)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${planet.gradient} flex-shrink-0`}></div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-foreground">{planet.name}</h3>
                    <p className="text-xs text-muted-foreground">{planet.type}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Planet Details */}
        <div className="lg:col-span-2">
          {selectedPlanet ? (
            <div className="space-y-6">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedPlanet.name}</h2>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 text-sm px-3 py-1">
                        🌍 {selectedPlanet.type}
                      </Badge>
                      <p className="text-muted-foreground mt-2">
                        Known as Earth's 'cousin', this planet orbits in the habitable zone of a Sun-like star.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-8">
                    <div className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${selectedPlanet.gradient} shadow-2xl`}>
                      <div className="absolute top-12 left-16 w-8 h-8 rounded-full bg-white/20"></div>
                      <div className="absolute bottom-20 right-12 w-12 h-12 rounded-full bg-white/10"></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Ruler className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">Radius:</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedPlanet.radius}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Globe className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">Mass:</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedPlanet.mass}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Thermometer className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">Temperature:</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedPlanet.temperature}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Calendar className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">Orbital Period:</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedPlanet.orbitalPeriod}</p>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Host Star</p>
                      <p className="text-xl font-semibold text-foreground">{selectedPlanet.hostStar}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="text-xl font-semibold text-foreground">{selectedPlanet.distance}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Discovered</p>
                      <p className="text-xl font-semibold text-foreground">{selectedPlanet.discovered}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mission</p>
                      <p className="text-xl font-semibold text-foreground">Kepler Space Telescope</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="p-12 bg-card/80 backdrop-blur-sm border-border/20 text-center h-full flex items-center justify-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">No Planet Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select an exoplanet from the list to view detailed information
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
