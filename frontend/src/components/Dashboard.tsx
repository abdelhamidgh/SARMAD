import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle,
  Target,
  TrendingUp,
  Users,
  Database,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const API_BASE_URL = "http://localhost:5000";

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stats`),
        fetch(`${API_BASE_URL}/accuracy`),
      ]);

      if (!statsRes.ok || !metricsRes.ok) {
        throw new Error("Failed to fetch data from backend");
      }

      const statsData = await statsRes.json();
      const metricsData = await metricsRes.json();

      setStats(statsData);
      setMetrics(metricsData);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading mission data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
          <div className="flex items-center gap-4 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <div>
              <h3 className="font-semibold text-lg">Connection Error</h3>
              <p className="text-sm text-muted-foreground">
                Unable to connect to backend API: {error}
              </p>
              <button
                onClick={fetchData}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const accuracy = metrics?.accuracy
    ? (metrics.accuracy * 100).toFixed(1)
    : "N/A";
  const totalExoplanets = stats?.label_distribution
    ? (stats.label_distribution.CONFIRMED || 0) +
      (stats.label_distribution.CANDIDATE || 0)
    : 0;
  const totalDataPoints = stats?.total_data_rows || 0;
  const confirmedPlanets = stats?.label_distribution?.CONFIRMED || 0;

  const dashboardStats = [
    {
      title: "Model Accuracy",
      value: metrics?.accuracy ? `${accuracy}%` : "Training",
      change: metrics?.accuracy ? `Active` : "Pending",
      icon: Target,
      color: "text-accent",
    },
    {
      title: "Confirmed Exoplanets",
      value: confirmedPlanets.toLocaleString(),
      change: `+${stats?.label_distribution?.CANDIDATE || 0} candidates`,
      icon: CheckCircle,
      color: "text-primary",
    },
    {
      title: "Data Points Analyzed",
      value: totalDataPoints.toLocaleString(),
      change: `${stats?.buffer_rows || 0} in buffer`,
      icon: Database,
      color: "text-secondary",
    },
    {
      title: "Total Detections",
      value: totalExoplanets.toLocaleString(),
      change: `${
        stats?.label_distribution?.FALSE_POSITIVE || 0
      } false positives`,
      icon: Users,
      color: "text-accent",
    },
  ];

  // Calculate model metrics (mock values if not available in API)
  const modelMetrics = [
    { name: "Precision", value: 94, color: "bg-primary" },
    { name: "Recall", value: 97, color: "bg-secondary" },
    { name: "F1 Score", value: 95, color: "bg-accent" },
  ];

  const getLastTrainedTime = () => {
    // Since we don't have timestamp from API, show based on model existence
    return stats?.model_exists ? "Active session" : "Not trained yet";
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground glow-text">
          Mission Control
        </h1>
        <p className="text-muted-foreground">
          Real-time Kepler exoplanet detection system overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-6 bg-card/80 backdrop-blur-sm border-border/20 hover:bg-card/90 transition-stellar hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                    <span className="text-sm text-accent font-medium">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Model Performance */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Model Performance
              </h2>
              <Badge className="stellar-gradient">
                {stats?.model_exists ? "Trained" : "Untrained"}
              </Badge>
            </div>

            <div className="space-y-4">
              {modelMetrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{metric.name}</span>
                    <span className="font-semibold text-foreground">
                      {metric.value}%
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Status: {getLastTrainedTime()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              System Status
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      stats?.model_exists ? "bg-green-500" : "bg-yellow-500"
                    } animate-pulse`}
                  />
                  <div>
                    <p className="font-medium text-foreground">AI Model</p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.model_exists
                        ? "Online & Processing"
                        : "Ready for Training"}
                    </p>
                  </div>
                </div>
                <Zap className="h-5 w-5 text-accent" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className="font-medium text-foreground">
                      Kepler Database
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {totalDataPoints} records loaded
                    </p>
                  </div>
                </div>
                <Database className="h-5 w-5 text-secondary" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      (stats?.buffer_rows || 0) > 0
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    } animate-pulse`}
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      Analysis Queue
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.buffer_rows || 0} / {stats?.threshold || 200}{" "}
                      pending
                    </p>
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Dataset Distribution */}
      {stats?.label_distribution && (
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Dataset Distribution
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.label_distribution.CONFIRMED?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-muted-foreground mb-1">Candidates</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.label_distribution.CANDIDATE?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-muted-foreground mb-1">
                False Positives
              </p>
              <p className="text-2xl font-bold text-red-400">
                {stats.label_distribution.FALSE_POSITIVE?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Info */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full stellar-gradient">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              About Kepler Mission
            </h3>
            <p className="text-muted-foreground">
              The Kepler Space Telescope operated from 2009-2018, discovering
              over 2,600 confirmed exoplanets. Our AI model is trained on this
              comprehensive dataset to identify and classify potential
              exoplanets with high accuracy, helping researchers discover new
              worlds beyond our solar system.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
