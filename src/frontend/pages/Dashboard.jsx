import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useDatasets } from "../context/DatasetContext.jsx";
import {
  Sparkles,
  Database,
  FileText,
  Image,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock,
  Zap,
  BarChart3,
  PieChart,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { datasets } = useDatasets();
  const navigate = useNavigate();

  const tabularCount = datasets.filter((d) => d.type === "tabular").length;
  const textCount = datasets.filter((d) => d.type === "text").length;
  const imageCount = datasets.filter((d) => d.type === "image").length;
  const recentDatasets = datasets.slice(0, 4);

  const stats = [
    {
      label: "Total Datasets",
      value: datasets.length,
      icon: Database,
      color: "from-primary-500 to-primary-600",
    },
    {
      label: "Tabular",
      value: tabularCount,
      icon: BarChart3,
      color: "from-accent-500 to-accent-600",
    },
    {
      label: "Text",
      value: textCount,
      icon: FileText,
      color: "from-success-400 to-success-500",
    },
    {
      label: "Image",
      value: imageCount,
      icon: Image,
      color: "from-warning-400 to-warning-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-8 px-4 animate-fade-in">
      {/* Welcome Section */}
      <div className="glass-card p-8 relative overflow-hidden max-w-4xl mx-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} className="text-primary-400" />
            <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
              Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-bold text-dark-50 mb-3">
            Welcome back,{" "}
            <span className="gradient-text">{user?.name || "Researcher"}</span>
          </h1>
          <p className="text-dark-400 mb-8 max-w-lg leading-relaxed">
            Generate privacy-safe synthetic datasets for your research,
            training, and testing needs. Powered by advanced AI models.
          </p>
          <button
            onClick={() => navigate("/generate")}
            className="btn-primary flex items-center gap-2 text-base px-6 py-3.5"
          >
            <Zap size={18} />
            Generate New Dataset
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center 
                group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <TrendingUp size={14} className="text-dark-500" />
            </div>
            <p className="text-2xl font-bold text-dark-100">{value}</p>
            <p className="text-sm text-dark-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Datasets */}
      <div>
        <div
          className="flex  items-center justify-between mb-6"
          style={{ marginLeft: "2rem" }}
        >
          <h2 className="text-lg font-semibold text-dark-100 inline-block">
            Recent Datasets
          </h2>
          {datasets.length > 0 && (
            <button
              onClick={() => navigate("/datasets")}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentDatasets.length === 0 ? (
          <div className="glass-card p-14 text-center max-w-2xl mx-auto">
            <Database size={48} className="mx-auto text-dark-600 mb-5" />
            <h3 className="text-lg font-medium text-dark-300 mb-2">
              No datasets yet
            </h3>
            <p className="text-dark-500 mb-8 text-sm">
              Generate your first synthetic dataset to get started
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="btn-primary"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} /> Generate Dataset
              </span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentDatasets.map((ds) => (
              <div
                key={ds.id}
                className="glass-card p-6 cursor-pointer group"
                onClick={() => navigate(`/dataset/${ds.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors">
                      {ds.name}
                    </h3>
                    <p className="text-xs text-dark-500 mt-1">
                      <Clock size={10} className="inline mr-1" />
                      {new Date(ds.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="tag tag-llm">{ds.type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-dark-400">
                  {ds.type === "tabular" && (
                    <span>{ds.data?.length || 0} rows</span>
                  )}
                  {ds.type === "text" && (
                    <span>{ds.data?.length || 0} entries</span>
                  )}
                  {ds.type === "image" && (
                    <span>{ds.data?.length || 0} images</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Shield size={10} className="text-success-400" />
                    Synthetic
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Tabular Data",
            desc: "CSV, demographics, healthcare records",
            icon: BarChart3,
            type: "tabular",
          },
          {
            title: "Text Data",
            desc: "Clinical notes, reviews, reports",
            icon: FileText,
            type: "text",
          },
          {
            title: "Image Data",
            desc: "Faces, medical scans, vehicles",
            icon: Image,
            type: "image",
          },
        ].map(({ title, desc, icon: Icon, type }) => (
          <div
            key={type}
            className="glass-card p-6 cursor-pointer group"
            onClick={() =>
              navigate("/generate", { state: { presetType: type } })
            }
          >
            <Icon
              size={20}
              className="text-primary-400 mb-4 group-hover:scale-110 transition-transform"
            />
            <h3 className="font-semibold text-dark-100 mb-1.5">{title}</h3>
            <p className="text-sm text-dark-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
