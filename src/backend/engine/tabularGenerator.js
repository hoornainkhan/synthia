// Tabular Data Generation Engine
// Uses Gemini for text columns, random generation for numbers

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Data arrays for random generation
const firstNames = [
  "John",
  "Jane",
  "Michael",
  "Sarah",
  "David",
  "Emma",
  "Chris",
  "Lisa",
  "Robert",
  "Anna",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
];
const cities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
];
const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "IT",
  "Legal",
  "R&D",
  "Support",
];
const conditions = [
  "Healthy",
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Arthritis",
  "Depression",
  "Anxiety",
  "Migraine",
  "Allergies",
  "Back Pain",
];
const statuses = [
  "Active",
  "Inactive",
  "Pending",
  "Completed",
  "Cancelled",
  "On Hold",
  "Approved",
  "Rejected",
  "In Progress",
  "Closed",
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCorrelatedRisk(age, bp) {
  let score = 0;
  if (age > 60) score += 2;
  else if (age > 40) score += 1;
  if (bp > 140) score += 2;
  else if (bp > 120) score += 1;
  score += Math.random() > 0.7 ? 1 : 0;
  if (score >= 4) return "Critical";
  if (score >= 3) return "High";
  if (score >= 1) return "Medium";
  return "Low";
}

// Helper to extract JSON from markdown-wrapped Gemini responses
function parseGeminiJSON(text) {
  let cleanText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleanText);
}

async function generateTextValues(col, numRows, context = {}) {
  const name = col.name.toLowerCase();
  const categories = col.categories
    ? col.categories.split(",").map((s) => s.trim())
    : null;

  // For columns that can be generated randomly without API
  if (name.includes("name") && name.includes("first")) {
    return Array.from({ length: numRows }, () => randChoice(firstNames));
  }
  if (name.includes("name") && name.includes("last")) {
    return Array.from({ length: numRows }, () => randChoice(lastNames));
  }
  if (name.includes("name") && !name.includes("column")) {
    return Array.from(
      { length: numRows },
      () => `${randChoice(firstNames)} ${randChoice(lastNames)}`,
    );
  }
  if (name.includes("email")) {
    return Array.from(
      { length: numRows },
      () =>
        `${randChoice(firstNames).toLowerCase()}${randInt(1, 999)}@example.com`,
    );
  }
  if (name.includes("city") || name.includes("location")) {
    return Array.from({ length: numRows }, () => randChoice(cities));
  }
  if (name.includes("department") || name.includes("dept")) {
    return Array.from({ length: numRows }, () => randChoice(departments));
  }
  if (name.includes("condition") || name.includes("diagnosis")) {
    return Array.from({ length: numRows }, () => randChoice(conditions));
  }
  if (name.includes("status")) {
    return Array.from({ length: numRows }, () => randChoice(statuses));
  }
  if (name.includes("category")) {
    return categories
      ? Array.from({ length: numRows }, () => randChoice(categories))
      : Array.from({ length: numRows }, () => randChoice(categories));
  }
  if (name.includes("address")) {
    return Array.from(
      { length: numRows },
      () =>
        `${randInt(100, 9999)} ${randChoice(["Main St", "Oak Ave", "Elm St", "Maple Dr", "Pine Rd"])}, ${randChoice(cities)}`,
    );
  }
  if (name.includes("phone")) {
    return Array.from(
      { length: numRows },
      () =>
        `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
    );
  }
  if (name.includes("gender") || name.includes("sex")) {
    return Array.from({ length: numRows }, () =>
      randChoice(["Male", "Female", "Non-binary"]),
    );
  }
  if (name.includes("country")) {
    return Array.from({ length: numRows }, () =>
      randChoice([
        "USA",
        "UK",
        "Canada",
        "India",
        "Germany",
        "Japan",
        "Australia",
        "Brazil",
        "France",
        "China",
      ]),
    );
  }
  if (name.includes("date")) {
    return Array.from({ length: numRows }, () => {
      const d = new Date(2020 + randInt(0, 5), randInt(0, 11), randInt(1, 28));
      return d.toISOString().split("T")[0];
    });
  }
  if (name.includes("id")) {
    return Array.from({ length: numRows }, () => `ID-${randInt(10000, 99999)}`);
  }

  // For API-based generation, batch them
  let prompt = "";
  if (
    name.includes("review") ||
    name.includes("comment") ||
    name.includes("feedback")
  ) {
    prompt = `Generate ${numRows} realistic ${name.includes("review") ? "product reviews" : name.includes("comment") ? "comments" : "feedbacks"}. Each should be ${randInt(10, 50)} words long. Make them varied and natural. Return as a JSON array of strings.`;
  } else if (name.includes("description")) {
    prompt = `Generate ${numRows} realistic descriptions for ${context.category || "general"} items. Each should be ${randInt(20, 80)} words long. Make them detailed and natural. Return as a JSON array of strings.`;
  } else if (name.includes("title")) {
    prompt = `Generate ${numRows} realistic titles for ${context.category || "general"} items. Each under 10 words. Return as a JSON array of strings.`;
  } else {
    // Generic text generation
    prompt = `Generate ${numRows} realistic text entries for a column called "${col.name}". Each should be ${randInt(5, 30)} words long and natural. Return as a JSON array of strings.`;
  }

  if (prompt) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      const values = parseGeminiJSON(text);
      return values.map((v) => v.replace(/^["']|["']$/g, "")); // Remove quotes if present
    } catch (error) {
      console.error("Gemini API error for text generation:", error);
      // Fallback to simple text
      return Array.from(
        { length: numRows },
        () => `Sample ${col.name} ${randInt(1, 9999)}`,
      );
    }
  }

  return Array.from(
    { length: numRows },
    () => `Sample ${col.name} ${randInt(1, 9999)}`,
  );
}

async function generateTextValue(col, context = {}) {
  const values = await generateTextValues(col, 1, context);
  return values[0];
}

function generateValue(col, rowContext = {}) {
  const name = col.name.toLowerCase();
  const type = col.type;

  // For text type columns, use LLM
  if (type === "text") {
    return generateTextValue(col, rowContext);
  }

  // Keep random generation for numbers and other types
  if (name.includes("risk"))
    return generateCorrelatedRisk(rowContext.age || 30, rowContext.bp || 120);
  if (name.includes("age")) {
    const age = randInt(col.min || 18, col.max || 85);
    rowContext.age = age;
    return age;
  }
  if (
    name.includes("blood") ||
    name.includes("bp") ||
    name.includes("pressure")
  ) {
    const bp = randInt(col.min || 90, col.max || 180);
    rowContext.bp = bp;
    return bp;
  }
  if (name.includes("salary") || name.includes("income"))
    return randFloat(col.min || 30000, col.max || 150000, 0);
  if (name.includes("score") || name.includes("rating"))
    return randFloat(col.min || 0, col.max || 100, 1);
  if (
    name.includes("price") ||
    name.includes("amount") ||
    name.includes("cost")
  )
    return randFloat(col.min || 5, col.max || 1000, 2);
  if (name.includes("quantity") || name.includes("count"))
    return randInt(col.min || 1, col.max || 100);
  if (name.includes("weight"))
    return randFloat(col.min || 50, col.max || 120, 1);
  if (name.includes("height"))
    return randFloat(col.min || 150, col.max || 200, 1);
  if (name.includes("bmi")) return randFloat(col.min || 18, col.max || 35, 1);

  // Fallback by type
  if (type === "int") return randInt(col.min || 0, col.max || 1000);
  if (type === "float") return randFloat(col.min || 0, col.max || 1000, 2);
  if (type === "categorical") {
    const cats = col.categories || ["A", "B", "C", "D"];
    return randChoice(cats);
  }
  if (type === "boolean") return randChoice([true, false]);

  return randInt(0, 100);
}

export async function generateTabularData(columns, numRows, noiseLevel = 0.3) {
  const data = [];

  // Separate text and non-text columns for batch processing
  const textColumns = columns.filter((col) => col.type === "text");
  const nonTextColumns = columns.filter((col) => col.type !== "text");

  // Pre-generate text column values in batches
  const textColumnValues = {};
  for (const col of textColumns) {
    textColumnValues[col.name] = await generateTextValues(col, numRows);
  }

  for (let i = 0; i < numRows; i++) {
    const row = {};
    const ctx = {};

    // Generate non-text values first
    for (const col of nonTextColumns) {
      row[col.name] = generateValue(col, ctx);
    }

    // Assign pre-generated text values
    for (const col of textColumns) {
      row[col.name] = textColumnValues[col.name][i];
    }

    data.push(row);
  }

  // Add noise based on noise level
  if (noiseLevel > 0.5) {
    const numNoisy = Math.floor(data.length * (noiseLevel - 0.5) * 0.1);
    for (let i = 0; i < numNoisy; i++) {
      const rowIdx = randInt(0, data.length - 1);
      const colIdx = randInt(0, columns.length - 1);
      const col = columns[colIdx];
      if (col.type === "int" || col.type === "float") {
        data[rowIdx][col.name] = null; // introduce missing values
      }
    }
  }

  return data;
}

export function computeColumnStats(data, columns) {
  const stats = {};
  for (const col of columns) {
    const values = data
      .map((row) => row[col.name])
      .filter((v) => v !== null && v !== undefined);
    if (
      col.type === "int" ||
      col.type === "float" ||
      typeof values[0] === "number"
    ) {
      const nums = values.map(Number).filter((n) => !isNaN(n));
      if (nums.length > 0) {
        stats[col.name] = {
          type: "numeric",
          min: Math.min(...nums),
          max: Math.max(...nums),
          mean: parseFloat(
            (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2),
          ),
          count: nums.length,
          nulls: data.length - nums.length,
        };
      }
    } else {
      const freq = {};
      values.forEach((v) => {
        freq[v] = (freq[v] || 0) + 1;
      });
      stats[col.name] = {
        type: "categorical",
        unique: Object.keys(freq).length,
        top: Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        count: values.length,
        nulls: data.length - values.length,
      };
    }
  }
  return stats;
}
