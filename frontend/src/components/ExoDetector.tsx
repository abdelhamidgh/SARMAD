import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Zap,
  CheckCircle,
  AlertTriangle,
  Target,
  Globe,
  Edit3,
  Activity,
  Database,
  TrendingUp,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

// Interface for the 16 manual input fields
interface ManualExoplanetData {
  koi_fpflag_nt: string;
  koi_fpflag_ss: string;
  koi_fpflag_co: string;
  koi_fpflag_ec: string;
  koi_period: string;
  koi_impact: string;
  koi_duration: string;
  koi_depth: string;
  koi_prad: string;
  koi_teq: string;
  koi_insol: string;
  koi_model_snr: string;
  koi_steff: string;
  koi_slogg: string;
  koi_srad: string;
  koi_kepmag: string;
}

// Component to display batch prediction results in a table
const BatchResultsTable = ({ results }: { results: any[] }) => (
  <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
    <h2 className="text-xl font-semibold text-foreground mb-4">
      Batch Analysis Results
    </h2>
    <div className="overflow-x-auto max-h-[600px]">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0">
          <tr>
            <th scope="col" className="px-4 py-3">
              #
            </th>
            <th scope="col" className="px-4 py-3">
              Prediction
            </th>
            <th scope="col" className="px-4 py-3">
              Confidence
            </th>
            <th scope="col" className="px-4 py-3">
              Habitability
            </th>
            <th scope="col" className="px-4 py-3">
              Planet Radius (R⊕)
            </th>
            <th scope="col" className="px-4 py-3">
              Equilibrium Temp (K)
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((item, index) => (
            <tr
              key={index}
              className="border-b border-border/20 hover:bg-muted/50"
            >
              <td className="px-4 py-2 font-medium">{index + 1}</td>
              <td className="px-4 py-2">
                <Badge
                  className={
                    item.is_exoplanet
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {item.prediction_label}
                </Badge>
              </td>
              <td className="px-4 py-2">{item.confidence}%</td>
              <td className="px-4 py-2">
                <Badge
                  className={
                    item.is_habitable
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }
                >
                  {item.is_habitable
                    ? "Potentially Habitable"
                    : "Not Habitable"}
                </Badge>
              </td>
              <td className="px-4 py-2">
                {item.original_data?.koi_prad
                  ? Number(item.original_data.koi_prad).toFixed(2)
                  : "N/A"}
              </td>
              <td className="px-4 py-2">
                {item.original_data?.koi_teq || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export default function ExoDetector() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [modelStats, setModelStats] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [testCsvStatus, setTestCsvStatus] = useState<string>("");

  const [manualData, setManualData] = useState<ManualExoplanetData>({
    koi_fpflag_nt: "",
    koi_fpflag_ss: "",
    koi_fpflag_co: "",
    koi_fpflag_ec: "",
    koi_period: "",
    koi_impact: "",
    koi_duration: "",
    koi_depth: "",
    koi_prad: "",
    koi_teq: "",
    koi_insol: "",
    koi_model_snr: "",
    koi_steff: "",
    koi_slogg: "",
    koi_srad: "",
    koi_kepmag: "",
  });

  useEffect(() => {
    fetchModelAccuracy();
    fetchModelStats();
  }, []);

  const fetchModelAccuracy = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accuracy`);
      const data = await response.json();
      if (data.accuracy !== null) setModelAccuracy(data.accuracy);
    } catch (error) {
      console.error("Error fetching accuracy:", error);
    }
  };

  const fetchModelStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      setModelStats(await response.json());
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setUploadStatus("Uploading and processing dataset...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/update_model`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadStatus(
          data.status === "model retrained"
            ? `✔ Model retrained! Added ${data.rows_added} rows. Accuracy: ${(
                data.training_accuracy * 100
              ).toFixed(2)}%`
            : `✔ Data added! ${data.rows_added} rows uploaded. Buffer: ${data.buffer_rows}/${data.threshold}`
        );
        fetchModelAccuracy();
        fetchModelStats();
        setTimeout(() => setUploadStatus(""), 5000);
      } else {
        setUploadStatus(`✖ Error: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus(`✖ Upload failed: ${error}`);
    }
  };

  const handleTestCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setIsBatchAnalyzing(true);
    setBatchResults(null);
    setResults(null);
    setTestCsvStatus("Uploading and analyzing...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/predict_batch`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setBatchResults(data);
        setTestCsvStatus(`✔ Analysis complete! Found ${data.length} records.`);
      } else {
        setTestCsvStatus(`✖ Error: ${data.error || "Prediction failed"}`);
      }
    } catch (error) {
      setTestCsvStatus(`✖ Upload failed: ${error}`);
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof ManualExoplanetData)[] = [
      "koi_fpflag_nt",
      "koi_fpflag_ss",
      "koi_fpflag_co",
      "koi_fpflag_ec",
      "koi_period",
      "koi_impact",
      "koi_duration",
      "koi_depth",
      "koi_prad",
      "koi_teq",
      "koi_insol",
      "koi_model_snr",
      "koi_steff",
      "koi_slogg",
      "koi_srad",
      "koi_kepmag",
    ];
    if (requiredFields.some((field) => !manualData[field])) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsAnalyzing(true);
    setResults(null);
    setBatchResults(null);
    try {
      const response = await fetch(`${API_BASE_URL}/predict_manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualData),
      });
      const data = await response.json();
      if (response.ok) {
        setResults({
          ...data,
          planetRadius: parseFloat(manualData.koi_prad),
          orbitalPeriod: parseFloat(manualData.koi_period),
          transitDepth: parseFloat(manualData.koi_depth) / 1_000_000,
          stellarMagnitude: parseFloat(manualData.koi_kepmag),
          equilibriumTemp: parseFloat(manualData.koi_teq),
          dataSource: "Manual Entry",
        });
      } else {
        alert(`Prediction error: ${data.error}`);
      }
    } catch (error) {
      alert(`Connection error: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (
    field: keyof ManualExoplanetData,
    value: string
  ) => {
    setManualData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground glow-text">
          AI Exoplanet Detector
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter parameters manually or upload Kepler light curve data to detect
          and classify potential exoplanets using machine learning.
        </p>
        {modelStats && (
          <div className="flex justify-center flex-wrap gap-4 mt-4">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Database className="h-3 w-3 mr-1" />
              {modelStats.total_data_rows} Training Samples
            </Badge>
            {modelAccuracy !== null && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                {(modelAccuracy * 100).toFixed(2)}% Accuracy
              </Badge>
            )}
            {modelStats.buffer_rows > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Activity className="h-3 w-3 mr-1" />
                Buffer: {modelStats.buffer_rows}/{modelStats.threshold}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
            <Tabs defaultValue="manual">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-8">
                <div className="border border-border/20 rounded-lg p-6 space-y-4">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Help Improve Model
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a labeled CSV to contribute to the model's training
                    data. The model retrains after{" "}
                    {modelStats?.threshold || 200} new samples are added.
                  </p>
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium mb-1">Required CSV Format:</p>
                    <p>• Must include 'koi_disposition' column (CONFIRMED/CANDIDATE/FALSE POSITIVE)</p>
                    <p>• Must include feature columns: koi_fpflag_nt, koi_period, koi_prad, etc.</p>
                    <p>• Download template: <a href="http://localhost:5000/csv_template" className="text-primary hover:underline">training_template.csv</a></p>
                  </div>
                  <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="train-file-upload"
                    />
                    <label
                      htmlFor="train-file-upload"
                      className="cursor-pointer space-y-2"
                    >
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="font-medium text-foreground">
                        Click to upload training data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CSV with 'koi_disposition' label
                      </p>
                    </label>
                  </div>
                  {uploadStatus && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        uploadStatus.includes("✔")
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {uploadStatus}
                    </div>
                  )}
                </div>
                <div className="border border-border/20 rounded-lg p-6 space-y-4">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Test Using CSV
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload an unlabeled CSV file to get predictions for multiple
                    exoplanet candidates at once.
                  </p>
                  <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleTestCsvUpload}
                      className="hidden"
                      id="test-file-upload"
                    />
                    <label
                      htmlFor="test-file-upload"
                      className="cursor-pointer space-y-2"
                    >
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="font-medium text-foreground">
                        Click to upload test data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unlabeled CSV with features
                      </p>
                    </label>
                  </div>
                  {testCsvStatus && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        testCsvStatus.includes("✔")
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {testCsvStatus}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                      Centroid Flags *
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Not Transit-Like (koi_fpflag_nt)"
                        value={manualData.koi_fpflag_nt}
                        onChange={(e) =>
                          handleInputChange("koi_fpflag_nt", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Stellar Variability (koi_fpflag_ss)"
                        value={manualData.koi_fpflag_ss}
                        onChange={(e) =>
                          handleInputChange("koi_fpflag_ss", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Centroid Offset (koi_fpflag_co)"
                        value={manualData.koi_fpflag_co}
                        onChange={(e) =>
                          handleInputChange("koi_fpflag_co", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Ephemeris Match (koi_fpflag_ec)"
                        value={manualData.koi_fpflag_ec}
                        onChange={(e) =>
                          handleInputChange("koi_fpflag_ec", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4 text-secondary" />
                      Planetary & Transit Data *
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Orbital Period (days)"
                        value={manualData.koi_period}
                        onChange={(e) =>
                          handleInputChange("koi_period", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Impact Parameter"
                        value={manualData.koi_impact}
                        onChange={(e) =>
                          handleInputChange("koi_impact", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Transit Duration (hours)"
                        value={manualData.koi_duration}
                        onChange={(e) =>
                          handleInputChange("koi_duration", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Transit Depth (ppm)"
                        value={manualData.koi_depth}
                        onChange={(e) =>
                          handleInputChange("koi_depth", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Planetary Radius (Earth radii)"
                        value={manualData.koi_prad}
                        onChange={(e) =>
                          handleInputChange("koi_prad", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Equilibrium Temp (K)"
                        value={manualData.koi_teq}
                        onChange={(e) =>
                          handleInputChange("koi_teq", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Insolation Flux (Earth flux)"
                        value={manualData.koi_insol}
                        onChange={(e) =>
                          handleInputChange("koi_insol", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Transit Signal-to-Noise"
                        value={manualData.koi_model_snr}
                        onChange={(e) =>
                          handleInputChange("koi_model_snr", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      Stellar Data *
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Stellar Temp (K)"
                        value={manualData.koi_steff}
                        onChange={(e) =>
                          handleInputChange("koi_steff", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Stellar Gravity (log10)"
                        value={manualData.koi_slogg}
                        onChange={(e) =>
                          handleInputChange("koi_slogg", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Stellar Radius (Solar radii)"
                        value={manualData.koi_srad}
                        onChange={(e) =>
                          handleInputChange("koi_srad", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Kepler-band Magnitude"
                        value={manualData.koi_kepmag}
                        onChange={(e) =>
                          handleInputChange("koi_kepmag", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full stellar-gradient"
                    disabled={isAnalyzing}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    {isAnalyzing ? "Analyzing..." : "Analyze Data"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-6">
          {isBatchAnalyzing || isAnalyzing ? (
            <Card className="p-12 bg-card/80 backdrop-blur-sm border-border/20 text-center flex items-center justify-center h-full">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center animate-pulse">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Analyzing...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The AI is processing the data. Please wait.
                  </p>
                </div>
              </div>
            </Card>
          ) : batchResults ? (
            <BatchResultsTable results={batchResults} />
          ) : results ? (
            <>
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      Detection Results
                    </h2>
                    <Badge
                      className={
                        results.is_exoplanet
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {results.confidence}% Confidence
                    </Badge>
                  </div>
                  <div className="p-6 rounded-lg stellar-gradient">
                    <div className="flex items-center gap-3">
                      {results.is_exoplanet ? (
                        <CheckCircle className="h-8 w-8 text-primary-foreground" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-primary-foreground" />
                      )}
                      <div>
                        <p className="text-lg font-bold text-primary-foreground">
                          {results.prediction_label}
                        </p>
                        <p className="text-sm text-primary-foreground/80">
                          {results.is_exoplanet
                            ? "Positive Detection"
                            : "False Positive"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {results.probabilities && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground">
                        Classification Probabilities:
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Confirmed
                            </span>
                            <span className="text-sm font-medium text-green-400">
                              {results.probabilities.confirmed}%
                            </span>
                          </div>
                          <Progress
                            value={results.probabilities.confirmed}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Candidate
                            </span>
                            <span className="text-sm font-medium text-yellow-400">
                              {results.probabilities.candidate}%
                            </span>
                          </div>
                          <Progress
                            value={results.probabilities.candidate}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              False Positive
                            </span>
                            <span className="text-sm font-medium text-red-400">
                              {results.probabilities.false_positive}%
                            </span>
                          </div>
                          <Progress
                            value={results.probabilities.false_positive}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Exoplanet Status
                        </span>
                      </div>
                      <Badge
                        className={
                          results.is_exoplanet
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {results.is_exoplanet ? "Detected" : "Not Detected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-secondary" />
                        <span className="text-sm text-muted-foreground">
                          Habitability
                        </span>
                      </div>
                      <Badge
                        className={
                          results.is_habitable
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }
                      >
                        {results.is_habitable
                          ? "Potentially Habitable"
                          : "Not Habitable"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Key Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Planet Radius
                    </p>
                    <p className="font-semibold text-foreground">
                      {results.planetRadius.toFixed(2)} R⊕
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Orbital Period
                    </p>
                    <p className="font-semibold text-foreground">
                      {results.orbitalPeriod.toFixed(2)} days
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Transit Depth
                    </p>
                    <p className="font-semibold text-foreground">
                      {(results.transitDepth * 100).toFixed(4)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Stellar Magnitude
                    </p>
                    <p className="font-semibold text-foreground">
                      {results.stellarMagnitude.toFixed(1)} mag
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Equilibrium Temp
                    </p>
                    <p className="font-semibold text-foreground">
                      {results.equilibriumTemp} K
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Habitable Zone
                    </p>
                    <p className="font-semibold text-foreground">
                      {results.habitable_zone}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 bg-card/80 backdrop-blur-sm border-border/20 text-center flex items-center justify-center h-full">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter data manually or upload a CSV to start detecting
                    exoplanets.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
