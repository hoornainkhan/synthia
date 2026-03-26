import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDatasets } from "../context/DatasetContext.jsx";
import {
  exportCSV,
  exportJSON,
  exportExcel,
  exportImagesZip,
} from "../../backend/utils/exporters.js";
import {
  FolderOpen,
  Trash2,
  Download,
  Eye,
  Search,
  Table,
  FileText,
  Image,
  Clock,
  Shield,
  Filter,
  BarChart3,
} from "lucide-react";

export default function MyDatasets() {
  const { datasets, deleteDataset } = useDatasets();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = datasets
    .filter((d) => {
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      return a.name.localeCompare(b.name);
    });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this dataset?")) {
      deleteDataset(id);
    }
  };

  const handleDownload = (e, ds) => {
    e.stopPropagation();
    const name = ds.name || "dataset";
    if (ds.type === "image") {
      exportImagesZip(ds.data, name);
    } else {
      const data =
        ds.type === "text"
          ? ds.data.map((d) => ({ id: d.id, text: d.text, topic: d.topic }))
          : ds.data;
      exportCSV(data, name);
    }
  };

  const TypeIcon = ({ type }) => {
    if (type === "tabular") return <Table size={14} />;
    if (type === "text") return <FileText size={14} />;
    return <Image size={14} />;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-8 px-4 animate-fade-in">
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen size={20} className="text-primary-400" />
          <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
            Library
          </span>
        </div>
        <h1 className="text-2xl font-bold text-dark-50">My Datasets</h1>
        <p className="text-dark-400 text-sm mt-1.5">
          View, download, and manage your generated datasets
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "3rem" }}
            placeholder="Search datasets..."
          />
        </div>
        <div className="flex gap-1.5 bg-dark-900/50 p-1.5 rounded-xl">
          {["all", "tabular", "text", "image"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all
                ${typeFilter === t ? "bg-dark-700 text-primary-400" : "text-dark-400 hover:text-dark-300"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-auto text-xs py-2.5"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Dataset Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-14 text-center max-w-2xl mx-auto">
          <FolderOpen size={48} className="mx-auto text-dark-600 mb-5" />
          <h3 className="text-lg font-medium text-dark-300 mb-2">
            {datasets.length === 0 ? "No datasets yet" : "No matching datasets"}
          </h3>
          <p className="text-dark-500 text-sm">
            {datasets.length === 0
              ? "Generate your first dataset to see it here"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ds) => (
            <div
              key={ds.id}
              className="glass-card p-6 cursor-pointer group"
              onClick={() => navigate(`/dataset/${ds.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 truncate group-hover:text-primary-400 transition-colors">
                    {ds.name}
                  </h3>
                  <p className="text-xs text-dark-500 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(ds.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`tag shrink-0 ${ds.modelTag === "GAN" ? "tag-gan" : ds.modelTag === "LLM" ? "tag-llm" : "tag-diffusion"}`}
                >
                  {ds.modelTag}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-dark-400 mb-5">
                <span className="flex items-center gap-1">
                  <TypeIcon type={ds.type} /> {ds.type}
                </span>
                <span>
                  {ds.type === "tabular" && `${ds.data?.length || 0} rows`}
                  {ds.type === "text" && `${ds.data?.length || 0} entries`}
                  {ds.type === "image" && `${ds.data?.length || 0} images`}
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={10} className="text-success-400" /> Synthetic
                </span>
              </div>

              {/* Quality mini-score */}
              {ds.qualityScore && (
                <div className="flex gap-3 mb-5">
                  {Object.entries(ds.qualityScore).map(([key, val]) => (
                    <div key={key} className="flex-1 text-center">
                      <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            key === "realism"
                              ? "bg-primary-500"
                              : key === "diversity"
                                ? "bg-accent-500"
                                : "bg-success-500"
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-dark-500 mt-1 block">
                        {key} {val}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2.5 pt-4 border-t border-dark-800/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dataset/${ds.id}`);
                  }}
                  className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Eye size={13} /> View
                </button>
                <button
                  onClick={(e) => handleDownload(e, ds)}
                  className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download size={13} /> Download
                </button>
                <button
                  onClick={(e) => handleDelete(e, ds.id)}
                  className="btn-secondary text-xs py-2 px-3.5 text-danger-400 hover:bg-danger-500/10"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
