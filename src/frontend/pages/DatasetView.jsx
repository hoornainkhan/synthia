import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDatasets } from "../context/DatasetContext.jsx";
import {
  exportCSV,
  exportJSON,
  exportExcel,
  exportImagesZip,
} from "../../backend/utils/exporters.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Archive,
  Shield,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Table,
  Image,
  Eye,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function DatasetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDataset } = useDatasets();
  const dataset = getDataset(id);
  const [activeTab, setActiveTab] = useState("preview");

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
        <AlertCircle size={48} className="text-dark-600 mb-4" />
        <h2 className="text-xl font-semibold text-dark-300 mb-2">
          Dataset Not Found
        </h2>
        <button
          onClick={() => navigate("/datasets")}
          className="btn-primary mt-4"
        >
          Go to My Datasets
        </button>
      </div>
    );
  }

  const handleExport = (format) => {
    const name = dataset.name || "dataset";
    if (!Array.isArray(dataset.data)) {
      alert("Dataset is not in a valid format for export");
      return;
    }
    if (dataset.type === "image") {
      exportImagesZip(dataset.data, name);
      return;
    }
    const exportData =
      dataset.type === "text"
        ? dataset.data.map((d) => ({
            id: d.id,
            text: d.text,
            topic: d.topic,
            wordCount: d.wordCount,
          }))
        : dataset.data;
    if (format === "csv") exportCSV(exportData, name);
    else if (format === "json") exportJSON(exportData, name);
    else if (format === "excel") exportExcel(exportData, name);
  };

  // Prepare chart data for tabular datasets
  const getChartData = () => {
    if (dataset.type !== "tabular" || !dataset.stats)
      return { barData: [], pieData: [], histogramData: [] };

    const stats = dataset.stats;
    const catCol = Object.entries(stats).find(
      ([, v]) => v.type === "categorical",
    );
    const numCol = Object.entries(stats).find(([, v]) => v.type === "numeric");

    let pieData = [];
    let barData = [];
    if (catCol) {
      pieData = catCol[1].top.map(([name, value]) => ({ name, value }));
      barData = pieData;
    }

    let histogramData = [];
    if (numCol && Array.isArray(dataset.data)) {
      const values = dataset.data
        .map((r) => r[numCol[0]])
        .filter((v) => v !== null && v !== undefined)
        .map(Number);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const bucketCount = 8;
      const bucketSize = (max - min) / bucketCount || 1;
      const buckets = Array.from({ length: bucketCount }, (_, i) => ({
        range: `${Math.round(min + i * bucketSize)}-${Math.round(min + (i + 1) * bucketSize)}`,
        count: 0,
      }));
      values.forEach((v) => {
        const idx = Math.min(
          Math.floor((v - min) / bucketSize),
          bucketCount - 1,
        );
        if (idx >= 0 && idx < buckets.length) buckets[idx].count++;
      });
      histogramData = buckets;
    }

    return { barData, pieData, histogramData };
  };

  const { barData, pieData, histogramData } = getChartData();

  return (
    <div className="max-w-7xl mx-auto flex flex-col space-y-6 px-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-dark-800/50 text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-dark-50">{dataset.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="tag tag-llm">{dataset.type} Data</span>
              <span className="text-xs text-dark-500">
                {new Date(dataset.createdAt).toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-xs text-success-400">
                <Shield size={10} /> Synthetic Data
              </span>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          {dataset.type === "image" ? (
            <button
              onClick={() => handleExport("zip")}
              className="btn-secondary flex items-center gap-1.5 text-xs"
            >
              <Archive size={14} /> Download ZIP
            </button>
          ) : (
            <>
              <button
                onClick={() => handleExport("csv")}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <FileText size={14} /> CSV
              </button>
              <button
                onClick={() => handleExport("json")}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <FileJson size={14} /> JSON
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <FileSpreadsheet size={14} /> Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      {dataset.type === "tabular" && (
        <div className="flex gap-1 bg-dark-900/50 p-1 rounded-xl w-fit">
          {[
            { id: "preview", icon: Table, label: "Table View" },
            { id: "charts", icon: BarChart3, label: "Charts" },
            { id: "stats", icon: TrendingUp, label: "Statistics" },
          ].map(({ id: tabId, icon: Icon, label }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tabId ? "bg-dark-700/80 text-primary-400" : "text-dark-400 hover:text-dark-300"}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* Tabular Content */}
      {dataset.type === "tabular" && Array.isArray(dataset.data) && (
        <>
          {activeTab === "preview" && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      {dataset.columns?.map((col) => (
                        <th
                          key={col.name}
                          className="px-4 py-3 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider"
                        >
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.data.slice(0, 20).map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-dark-800/30 hover:bg-dark-800/30 transition-colors"
                      >
                        {dataset.columns?.map((col) => (
                          <td
                            key={col.name}
                            className="px-4 py-2.5 text-dark-300 whitespace-nowrap"
                          >
                            {row[col.name] !== null &&
                            row[col.name] !== undefined ? (
                              String(row[col.name])
                            ) : (
                              <span className="text-dark-600 italic">null</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-dark-800/50 text-xs text-dark-500">
                Showing {Math.min(20, dataset.data.length)} of{" "}
                {dataset.data.length} rows
              </div>
            </div>
          )}

          {activeTab === "charts" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {barData.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                    <BarChart3 size={16} className="text-primary-400" />{" "}
                    Distribution (Bar)
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {barData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {pieData.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                    <PieIcon size={16} className="text-accent-400" />{" "}
                    Distribution (Pie)
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {histogramData.length > 0 && (
                <div className="glass-card p-5 lg:col-span-2">
                  <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                    <BarChart3 size={16} className="text-success-400" />{" "}
                    Histogram
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={histogramData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="range"
                        stroke="#64748b"
                        fontSize={10}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === "stats" && dataset.stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(dataset.stats).map(([name, stat]) => (
                <div key={name} className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-dark-200 mb-3">
                    {name}
                  </h3>
                  {stat.type === "numeric" ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Type</span>
                        <span className="text-dark-200">Numeric</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Min</span>
                        <span className="text-dark-200">{stat.min}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Max</span>
                        <span className="text-dark-200">{stat.max}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Mean</span>
                        <span className="text-dark-200">{stat.mean}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Count</span>
                        <span className="text-dark-200">{stat.count}</span>
                      </div>
                      {stat.nulls > 0 && (
                        <div className="flex justify-between">
                          <span className="text-warning-400">Nulls</span>
                          <span className="text-warning-400">{stat.nulls}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Type</span>
                        <span className="text-dark-200">Categorical</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Unique Values</span>
                        <span className="text-dark-200">{stat.unique}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Count</span>
                        <span className="text-dark-200">{stat.count}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-dark-400">Top Values:</span>
                        <div className="mt-1 space-y-1">
                          {stat.top.map(([val, cnt]) => (
                            <div
                              key={val}
                              className="flex justify-between items-center"
                            >
                              <span className="text-dark-300">{val}</span>
                              <span className="text-dark-500">{cnt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Text Content */}
      {dataset.type === "text" && Array.isArray(dataset.data) && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-success-400" /> Text Preview
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {dataset.data.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-dark-800/40 border border-dark-700/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-dark-500">
                    Entry #{item.id}
                  </span>
                  <span className="text-xs text-dark-500">
                    {item.wordCount} words
                  </span>
                </div>
                <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Content */}
      {dataset.type === "image" && Array.isArray(dataset.data) && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
            <Image size={16} className="text-primary-400" /> Image Gallery
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dataset.data.map((img) => (
              <div
                key={img.id}
                className="rounded-xl overflow-hidden border border-dark-700/30 group"
              >
                <div className="relative aspect-square">
                  <img
                    src={img.dataUrl}
                    alt={img.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye size={20} className="text-white" />
                  </div>
                </div>
                <div className="p-2 bg-dark-800/50">
                  <p className="text-xs text-dark-400 truncate">{img.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Badge */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Shield size={14} className="text-success-400" />
        <span className="text-xs text-dark-500">
          Privacy Safe – No Real Data Used • Synthetic Data Generated
        </span>
      </div>
    </div>
  );
}
