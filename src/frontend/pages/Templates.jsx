import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutTemplate,
  Heart,
  DollarSign,
  ShoppingCart,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Database,
} from "lucide-react";

const templates = [
  {
    id: "healthcare",
    name: "Healthcare Patient Records",
    description:
      "Comprehensive patient dataset with demographics, vitals, conditions, and risk levels.",
    icon: Heart,
    color: "from-red-500 to-pink-600",
    tags: ["GAN", "Tabular"],
    config: {
      type: "tabular",
      name: "Healthcare_Patients",
      numRows: 500,
      columns: [
        {
          name: "patient_id",
          type: "int",
          min: 10000,
          max: 99999,
          categories: "",
        },
        { name: "name", type: "text", min: "", max: "", categories: "" },
        { name: "age", type: "int", min: 18, max: 85, categories: "" },
        {
          name: "gender",
          type: "categorical",
          min: "",
          max: "",
          categories: "Male,Female",
        },
        {
          name: "blood_pressure",
          type: "int",
          min: 90,
          max: 180,
          categories: "",
        },
        {
          name: "diabetes_status",
          type: "categorical",
          min: "",
          max: "",
          categories: "Yes,No,Pre-diabetic",
        },
        {
          name: "condition",
          type: "categorical",
          min: "",
          max: "",
          categories: "Hypertension,Diabetes,Asthma,None,Obesity",
        },
        {
          name: "risk_level",
          type: "categorical",
          min: "",
          max: "",
          categories: "Low,Medium,High,Critical",
        },
        { name: "bmi", type: "float", min: 18, max: 35, categories: "" },
      ],
    },
  },
  {
    id: "finance",
    name: "Financial Transactions",
    description:
      "Transaction records with amounts, categories, fraud indicators, and risk scores.",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    tags: ["GAN", "Tabular"],
    config: {
      type: "tabular",
      name: "Financial_Transactions",
      numRows: 1000,
      columns: [
        {
          name: "transaction_id",
          type: "int",
          min: 100000,
          max: 999999,
          categories: "",
        },
        { name: "date", type: "text", min: "", max: "", categories: "" },
        { name: "amount", type: "float", min: 5, max: 10000, categories: "" },
        {
          name: "category",
          type: "categorical",
          min: "",
          max: "",
          categories: "Food,Shopping,Transfer,Bills,Entertainment,Travel",
        },
        {
          name: "status",
          type: "categorical",
          min: "",
          max: "",
          categories: "Completed,Pending,Failed,Refunded",
        },
        { name: "risk_score", type: "float", min: 0, max: 100, categories: "" },
        {
          name: "country",
          type: "categorical",
          min: "",
          max: "",
          categories: "",
        },
      ],
    },
  },
  {
    id: "ecommerce",
    name: "E-Commerce Users",
    description:
      "Customer profiles with purchase history, preferences, and engagement metrics.",
    icon: ShoppingCart,
    color: "from-blue-500 to-cyan-600",
    tags: ["GAN", "Tabular"],
    config: {
      type: "tabular",
      name: "Ecommerce_Users",
      numRows: 800,
      columns: [
        { name: "user_id", type: "int", min: 1000, max: 99999, categories: "" },
        { name: "name", type: "text", min: "", max: "", categories: "" },
        { name: "email", type: "text", min: "", max: "", categories: "" },
        { name: "age", type: "int", min: 18, max: 65, categories: "" },
        { name: "city", type: "categorical", min: "", max: "", categories: "" },
        {
          name: "total_purchases",
          type: "int",
          min: 0,
          max: 200,
          categories: "",
        },
        {
          name: "total_spent",
          type: "float",
          min: 0,
          max: 15000,
          categories: "",
        },
        { name: "rating", type: "float", min: 1, max: 5, categories: "" },
        {
          name: "status",
          type: "categorical",
          min: "",
          max: "",
          categories: "Active,Inactive,VIP",
        },
      ],
    },
  },
  {
    id: "students",
    name: "Student Performance",
    description:
      "Academic records with grades, attendance, and performance indicators.",
    icon: GraduationCap,
    color: "from-purple-500 to-violet-600",
    tags: ["GAN", "Tabular"],
    config: {
      type: "tabular",
      name: "Student_Performance",
      numRows: 300,
      columns: [
        {
          name: "student_id",
          type: "int",
          min: 1000,
          max: 9999,
          categories: "",
        },
        { name: "name", type: "text", min: "", max: "", categories: "" },
        { name: "age", type: "int", min: 16, max: 30, categories: "" },
        {
          name: "gender",
          type: "categorical",
          min: "",
          max: "",
          categories: "Male,Female,Non-binary",
        },
        {
          name: "department",
          type: "categorical",
          min: "",
          max: "",
          categories: "Engineering,Science,Arts,Business,Medicine",
        },
        { name: "gpa", type: "float", min: 0, max: 4, categories: "" },
        { name: "attendance", type: "int", min: 50, max: 100, categories: "" },
        {
          name: "grade",
          type: "categorical",
          min: "",
          max: "",
          categories: "A,B,C,D,F",
        },
        {
          name: "status",
          type: "categorical",
          min: "",
          max: "",
          categories: "Active,Graduated,On Leave",
        },
      ],
    },
  },
  {
    id: "healthcare-text",
    name: "Clinical Notes (Text)",
    description:
      "AI-generated clinical notes with patient encounters, diagnoses, and treatment plans.",
    icon: Heart,
    color: "from-teal-500 to-emerald-600",
    tags: ["LLM", "Text"],
    config: {
      type: "text",
      name: "Clinical_Notes",
      textTopic: "healthcare",
      textLength: "medium",
      textCount: 15,
    },
  },
  {
    id: "finance-text",
    name: "Financial Reports (Text)",
    description: "Synthetic financial analysis reports and market summaries.",
    icon: DollarSign,
    color: "from-amber-500 to-orange-600",
    tags: ["LLM", "Text"],
    config: {
      type: "text",
      name: "Financial_Reports",
      textTopic: "finance",
      textLength: "long",
      textCount: 10,
    },
  },
];

export default function Templates() {
  const navigate = useNavigate();

  const handleUseTemplate = (template) => {
    navigate("/generate", { state: { template: template.config } });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-8 px-4 animate-fade-in">
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <LayoutTemplate size={20} className="text-primary-400" />
          <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
            Templates
          </span>
        </div>
        <h1 className="text-2xl font-bold text-dark-50">Dataset Templates</h1>
        <p className="text-dark-400 text-sm mt-1.5">
          Pre-configured templates to generate datasets instantly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t.id} className="glass-card p-6 flex flex-col group">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0
                group-hover:scale-110 transition-transform duration-300`}
              >
                <t.icon size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors">
                  {t.name}
                </h3>
                <div className="flex gap-1.5 mt-1.5">
                  {t.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`tag text-[9px] ${
                        tag === "GAN"
                          ? "tag-gan"
                          : tag === "LLM"
                            ? "tag-llm"
                            : "tag-diffusion"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-dark-400 leading-relaxed flex-1 mb-5">
              {t.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-dark-500 mb-5">
              <span className="flex items-center gap-1">
                <Database size={11} />
                {t.config.numRows || t.config.textCount || 0}{" "}
                {t.config.type === "text" ? "entries" : "rows"}
              </span>
              {t.config.columns && (
                <span>{t.config.columns.length} columns</span>
              )}
            </div>

            <button
              onClick={() => handleUseTemplate(t)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
            >
              <Sparkles size={14} /> Use Template <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
