import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDatasets } from "../context/DatasetContext.jsx";
import {
  generateTabularData,
  computeColumnStats,
} from "../../backend/engine/tabularGenerator.js";
import { generateTextData } from "../../backend/engine/textGenerator.js";
import { generateSyntheticImages } from "../../backend/engine/imageGenerator.js";
import {
  Sparkles,
  Settings2,
  Plus,
  Trash2,
  Wand2,
  Loader2,
  Table,
  FileText,
  Image,
  Sliders,
  Link2,
  Zap,
} from "lucide-react";

const DATA_TYPES = ["int", "float", "categorical", "text", "boolean"];
const LENGTHS = ["short", "medium", "long"];
const TONES = ["formal", "casual"];
const IMG_STYLES = ["realistic", "cartoon", "grayscale"];

export default function Generate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addDataset } = useDatasets();

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Structured config state
  const [datasetType, setDatasetType] = useState("tabular");
  const [datasetName, setDatasetName] = useState("");
  const [numRows, setNumRows] = useState(100);
  const [columns, setColumns] = useState([
    { name: "id", type: "int", min: 1, max: 10000, categories: "" },
    { name: "name", type: "text", min: "", max: "", categories: "" },
    { name: "age", type: "int", min: 18, max: 85, categories: "" },
    {
      name: "status",
      type: "categorical",
      min: "",
      max: "",
      categories: "Active,Inactive,Pending",
    },
  ]);

  // Text config
  const [textTopic, setTextTopic] = useState("");
  const [textLength, setTextLength] = useState("short");
  const [textTone, setTextTone] = useState("formal");
  const [textCount, setTextCount] = useState(10);

  // Image config
  const [imgCategory, setImgCategory] = useState("");
  const [imgStyle, setImgStyle] = useState("realistic");
  const [imgCount, setImgCount] = useState(6);

  // Advanced
  const [noiseLevel, setNoiseLevel] = useState(0.3);
  const [enableCorrelation, setEnableCorrelation] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (location.state?.presetType) {
      setDatasetType(location.state.presetType);
    }
    if (location.state?.template) {
      const t = location.state.template;
      setDatasetType(t.type || "tabular");
      setDatasetName(t.name || "");
      if (t.columns) setColumns(t.columns);
      if (t.numRows) setNumRows(t.numRows);
      if (t.textTopic) setTextTopic(t.textTopic);
      if (t.textLength) setTextLength(t.textLength);
      if (t.textCount) setTextCount(t.textCount);
    }
  }, [location.state]);

  const addColumn = () => {
    setColumns([
      ...columns,
      { name: "", type: "text", min: "", max: "", categories: "" },
    ]);
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index, field, value) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    setColumns(updated);
  };

  const simulateProgress = async (steps) => {
    for (const step of steps) {
      setProgressText(step.text);
      setProgress(step.pct);
      await new Promise((r) => setTimeout(r, step.delay));
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(0);

    try {
      let result;

      // Structured input
      if (datasetType === "tabular") {
        await simulateProgress([
          { text: "Initializing model...", pct: 15, delay: 600 },
          { text: "Configuring data schema...", pct: 30, delay: 500 },
          { text: "Generating tabular data...", pct: 50, delay: 800 },
          {
            text: enableCorrelation
              ? "Applying column correlations..."
              : "Randomizing distributions...",
            pct: 70,
            delay: 600,
          },
          { text: "Running quality validation...", pct: 85, delay: 500 },
          { text: "Finalizing dataset...", pct: 95, delay: 400 },
        ]);

        const parsedCols = columns.map((c) => ({
          ...c,
          min: c.min ? Number(c.min) : undefined,
          max: c.max ? Number(c.max) : undefined,
          categories: c.categories
            ? c.categories.split(",").map((s) => s.trim())
            : undefined,
        }));
        const data = await generateTabularData(parsedCols, numRows, noiseLevel);
        const stats = computeColumnStats(data, parsedCols);
        result = {
          name: datasetName || `Tabular_${Date.now()}`,
          type: "tabular",
          data,
          columns: parsedCols,
          stats,
        };
      } else if (datasetType === "text") {
        await simulateProgress([
          { text: "Loading LLM model...", pct: 15, delay: 700 },
          { text: `Generating ${textTopic} text data...`, pct: 40, delay: 800 },
          { text: "Ensuring semantic consistency...", pct: 65, delay: 600 },
          { text: "Applying tone adjustments...", pct: 80, delay: 500 },
          { text: "Finalizing text dataset...", pct: 95, delay: 400 },
        ]);

        const data = await generateTextData({
          topic: textTopic,
          length: textLength,
          tone: textTone,
          count: textCount,
        });
        result = {
          name: datasetName || `Text_${Date.now()}`,
          type: "text",
          data,
          config: {
            topic: textTopic,
            length: textLength,
            tone: textTone,
            count: textCount,
          },
        };
      } else {
        await simulateProgress([
          { text: "Initializing model...", pct: 15, delay: 700 },
          {
            text: `Generating ${imgCategory} images (${imgStyle})...`,
            pct: 40,
            delay: 1000,
          },
          { text: "Applying style transfer...", pct: 65, delay: 600 },
          { text: "Post-processing outputs...", pct: 85, delay: 500 },
          { text: "Finalizing image dataset...", pct: 95, delay: 400 },
        ]);

        const data = await generateSyntheticImages({
          category: imgCategory,
          style: imgStyle,
          count: imgCount,
        });
        result = {
          name: datasetName || `Image_${Date.now()}`,
          type: "image",
          data,
          config: { category: imgCategory, style: imgStyle, count: imgCount },
        };
      }

      // Ensure data is always an array
      if (!Array.isArray(result.data)) {
        throw new Error("Generated data is not in the correct format");
      }

      setProgress(100);
      setProgressText("Complete!");
      await new Promise((r) => setTimeout(r, 500));

      const saved = addDataset(result);
      navigate(`/dataset/${saved.id}`);
    } catch (err) {
      console.error(err);
      setProgressText(`Error: ${err.message || "Failed to generate dataset"}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-8 px-4 animate-fade-in">
      {/* Header */}
      <div style={{ marginLeft: "2rem" }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-primary-400" />
          <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
            Generate
          </span>
        </div>
        <h1 className="text-2xl font-bold text-dark-50">Generate Dataset</h1>
        <p className="text-dark-400 text-sm mt-1.5">
          Create synthetic data using AI-powered generation engines
        </p>
      </div>

      {/* Dataset Name */}
      <div className="glass-card p-6">
        <label className="block text-sm text-dark-300 mb-2 font-medium">
          Dataset Name
        </label>
        <input
          type="text"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
          className="input-field"
          placeholder="e.g., Healthcare Patient Records"
        />
      </div>

      {/* Structured Configuration */}
      <div className="space-y-6">
        {/* Dataset Type */}
        <div className="glass-card p-6">
          <label className="block text-sm text-dark-300 mb-4 font-medium">
            Dataset Type
          </label>
          <div className="flex gap-4">
            {[
              { type: "tabular", icon: Table, label: "Tabular" },
              { type: "text", icon: FileText, label: "Text" },
              { type: "image", icon: Image, label: "Image" },
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setDatasetType(type)}
                className={`flex-1 flex items-center justify-center gap-2.5 p-5 rounded-xl border transition-all
                  ${
                    datasetType === type
                      ? "border-primary-500/30 bg-primary-500/10 text-primary-400"
                      : "border-dark-700/50 bg-dark-800/30 text-dark-400 hover:border-dark-600"
                  }`}
              >
                <Icon size={20} /> <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabular Config */}
        {datasetType === "tabular" && (
          <div className="glass-card p-8 space-y-6">
            <div>
              <label className="block text-sm text-dark-300 mb-2 font-medium">
                Number of Rows
              </label>
              <input
                type="number"
                value={numRows}
                onChange={(e) =>
                  setNumRows(
                    Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)),
                  )
                }
                className="input-field w-48"
                min={1}
                max={10000}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm text-dark-300 font-medium">
                  Columns
                </label>
                <button
                  onClick={addColumn}
                  className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-4"
                >
                  <Plus size={14} /> Add Column
                </button>
              </div>
              <div className="space-y-3">
                {columns.map((col, i) => (
                  <div key={i} className="flex items-center gap-3 flex-wrap">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => updateColumn(i, "name", e.target.value)}
                      className="input-field flex-1 min-w-[140px]"
                      placeholder="Column name"
                    />
                    <select
                      value={col.type}
                      onChange={(e) => updateColumn(i, "type", e.target.value)}
                      className="input-field w-36"
                    >
                      {DATA_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {(col.type === "int" || col.type === "float") && (
                      <>
                        <input
                          type="number"
                          value={col.min}
                          onChange={(e) =>
                            updateColumn(i, "min", e.target.value)
                          }
                          className="input-field w-24"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={col.max}
                          onChange={(e) =>
                            updateColumn(i, "max", e.target.value)
                          }
                          className="input-field w-24"
                          placeholder="Max"
                        />
                      </>
                    )}
                    {col.type === "categorical" && (
                      <input
                        type="text"
                        value={col.categories}
                        onChange={(e) =>
                          updateColumn(i, "categories", e.target.value)
                        }
                        className="input-field flex-1 min-w-[180px]"
                        placeholder="Options (comma separated)"
                      />
                    )}
                    <button
                      onClick={() => removeColumn(i)}
                      className="p-2.5 rounded-lg text-dark-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text Config */}
        {datasetType === "text" && (
          <div className="glass-card p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-dark-300 mb-2 font-medium">
                  Topic
                </label>
                <input
                  type="text"
                  value={textTopic}
                  onChange={(e) => setTextTopic(e.target.value)}
                  className="input-field"
                  placeholder="e.g., healthcare, finance, any topic"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2 font-medium">
                  Length
                </label>
                <select
                  value={textLength}
                  onChange={(e) => setTextLength(e.target.value)}
                  className="input-field"
                >
                  {LENGTHS.map((l) => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2 font-medium">
                  Tone
                </label>
                <select
                  value={textTone}
                  onChange={(e) => setTextTone(e.target.value)}
                  className="input-field"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2 font-medium">
                  Count
                </label>
                <input
                  type="number"
                  value={textCount}
                  onChange={(e) =>
                    setTextCount(
                      Math.min(50, Math.max(1, parseInt(e.target.value) || 1)),
                    )
                  }
                  className="input-field"
                  min={1}
                  max={50}
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Config */}
        {datasetType === "image" && (
          <div className="glass-card p-8 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-dark-300 mb-2 font-medium">
                  Category
                </label>
                <input
                  type="text"
                  value={imgCategory}
                  onChange={(e) => setImgCategory(e.target.value)}
                  className="input-field"
                  placeholder="e.g., faces, cars, landscapes, any category"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2 font-medium">
                  Style
                </label>
                <select
                  value={imgStyle}
                  onChange={(e) => setImgStyle(e.target.value)}
                  className="input-field"
                >
                  {IMG_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2 font-medium">
                  Count
                </label>
                <input
                  type="number"
                  value={imgCount}
                  onChange={(e) =>
                    setImgCount(
                      Math.min(20, Math.max(1, parseInt(e.target.value) || 1)),
                    )
                  }
                  className="input-field"
                  min={1}
                  max={20}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-6 text-dark-300 hover:text-dark-200 transition-colors"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <Sliders size={16} /> Advanced Settings
          </span>
          <span className="text-xs text-dark-500">
            {showAdvanced ? "Hide" : "Show"}
          </span>
        </button>
        {showAdvanced && (
          <div className="px-6 pb-6 space-y-5 border-t border-dark-800/50 pt-5">
            {/* Noise Control */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-dark-300 font-medium">
                  Noise Level
                </label>
                <span className="text-xs text-dark-500">
                  {noiseLevel < 0.3
                    ? "Low → Realistic"
                    : noiseLevel < 0.7
                      ? "Medium → Balanced"
                      : "High → Diverse"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-dark-700 accent-primary-500"
              />
              <div className="flex justify-between text-xs text-dark-600 mt-1.5">
                <span>Realistic</span>
                <span>Diverse</span>
              </div>
            </div>

            {/* Correlation Control */}
            {datasetType === "tabular" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Link2 size={16} className="text-dark-400" />
                  <span className="text-sm text-dark-300 font-medium">
                    Enable Column Correlations
                  </span>
                </div>
                <button
                  onClick={() => setEnableCorrelation(!enableCorrelation)}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 relative
                    ${enableCorrelation ? "bg-primary-500" : "bg-dark-600"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform
                    ${enableCorrelation ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Button */}
      {!generating ? (
        <button
          onClick={handleGenerate}
          className="btn-primary w-full flex items-center justify-center gap-2.5 py-4 text-base"
        >
          <Wand2 size={20} />
          Generate Dataset
        </button>
      ) : (
        <div className="glass-card p-8">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Loader2 size={20} className="text-primary-400 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-200">
                {progressText}
              </p>
              <p className="text-xs text-dark-500">{progress}% complete</p>
            </div>
          </div>
          <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
