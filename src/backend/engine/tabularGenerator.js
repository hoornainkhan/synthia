// Tabular Data Generation Engine
// Uses OpenRouter LLM for text columns, random generation for numbers

// Helper function to call LLM API through backend proxy
async function callLLMAPI(prompt) {
  try {
    const response = await fetch("http://localhost:4000/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      let errorMsg = `Backend error (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg += `: ${errorData.error || "Unknown error"}`;
      } catch {
        // ignore JSON parse errors on error responses
      }
      console.error("Backend proxy error:", errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.content || typeof data.content !== "string") {
      throw new Error("Empty or invalid content in API response");
    }
    return data.content;
  } catch (error) {
    console.error("LLM API call failed:", error.message);
    throw error;
  }
}

// Data arrays for random generation
const firstNames = [
  "John", "Jane", "Michael", "Sarah", "David", "Emma", "Chris", "Lisa",
  "Robert", "Anna", "James", "Emily", "William", "Olivia", "Benjamin",
  "Sophia", "Daniel", "Isabella", "Matthew", "Mia",
];
const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas",
  "Jackson", "White", "Harris", "Martin", "Thompson", "Moore", "Allen",
];
const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
];
const departments = [
  "Engineering", "Marketing", "Sales", "HR", "Finance",
  "Operations", "IT", "Legal", "R&D", "Support",
  "Product", "Design", "Quality Assurance", "Customer Success",
];
const conditions = [
  "Healthy", "Hypertension", "Diabetes", "Asthma", "Arthritis",
  "Depression", "Anxiety", "Migraine", "Allergies", "Back Pain",
  "Insomnia", "Obesity", "Anemia", "Bronchitis",
];
const statuses = [
  "Active", "Inactive", "Pending", "Completed", "Cancelled",
  "On Hold", "Approved", "Rejected", "In Progress", "Closed",
];
const companies = [
  "Acme Corp", "TechVision Inc", "Global Solutions", "Innovate Labs",
  "Summit Enterprises", "Nexus Group", "Pinnacle Systems", "Atlas Digital",
  "Vertex Industries", "Quantum Dynamics",
];
const products = [
  "Widget Pro", "Smart Sensor", "Cloud Manager", "Data Analyzer",
  "Network Hub", "Security Suite", "Task Runner", "Code Editor",
  "File Sync", "Report Builder",
];
const jobTitles = [
  "Software Engineer", "Data Analyst", "Product Manager", "UX Designer",
  "DevOps Engineer", "Marketing Lead", "Sales Rep", "HR Coordinator",
  "QA Tester", "Business Analyst", "CTO", "VP of Engineering",
];

// Review/comment/feedback templates for local fallback
const reviewTemplates = [
  "Great product, works exactly as described. Highly recommended!",
  "Average experience. The quality could be better for the price.",
  "Excellent customer service and fast shipping. Will buy again.",
  "Not what I expected. The description was misleading.",
  "Good value for money. Solid build quality and nice packaging.",
  "Fantastic! Exceeded all my expectations. Five stars!",
  "Decent product but took too long to arrive.",
  "Very satisfied with this purchase. Works perfectly.",
  "Could be improved in some areas but overall a good buy.",
  "Outstanding quality and attention to detail. Love it!",
  "The product stopped working after two weeks. Disappointed.",
  "Perfect for my needs. Easy to set up and use.",
  "Nice design but the functionality is limited.",
  "Best purchase I've made this year. Absolutely love it.",
  "Reasonable quality for the price point. No complaints.",
];

const descriptionTemplates = [
  "A high-quality item designed for everyday use with premium materials and modern aesthetics.",
  "Professional-grade solution offering reliable performance and durability.",
  "Compact and lightweight design with advanced features for maximum productivity.",
  "Versatile product suitable for both personal and professional applications.",
  "State-of-the-art technology combined with user-friendly interface and ergonomic design.",
  "Budget-friendly option that doesn't compromise on quality or performance.",
  "Premium edition featuring enhanced capabilities and extended warranty.",
  "Industry-leading solution trusted by thousands of customers worldwide.",
  "Innovative design with sustainability in mind, made from eco-friendly materials.",
  "Feature-rich product with intuitive controls and seamless integration.",
];

const titleTemplates = [
  "Advanced Analytics Dashboard", "Smart Home Controller Pro", "Cloud Storage Solution",
  "Enterprise Security Platform", "Digital Marketing Toolkit", "AI-Powered Assistant",
  "Real-Time Data Monitor", "Automated Workflow Engine", "Customer Insights Report",
  "Performance Optimization Suite", "Mobile Payment Gateway", "Team Collaboration Hub",
  "Inventory Management System", "Predictive Maintenance Tool", "Content Management Platform",
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

// Helper to extract JSON from markdown-wrapped LLM responses
function parseLLMJSON(text) {
  if (!text || typeof text !== "string") {
    console.warn("Invalid LLM response text:", typeof text);
    return null;
  }

  try {
    // Remove markdown code fence wrappers
    let cleanText = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Try to find JSON array in the response
    const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    return JSON.parse(cleanText);
  } catch (err) {
    console.warn("JSON parse failed, trying line-by-line extraction:", err.message);

    // Last resort: try to extract quoted strings
    try {
      const matches = text.match(/"([^"]+)"/g);
      if (matches && matches.length > 0) {
        return matches.map((m) => m.replace(/^"|"$/g, ""));
      }
    } catch {
      // ignore
    }

    return null;
  }
}

// Generate text values locally (no API needed)
function generateLocalTextValues(col, numRows) {
  const name = col.name.toLowerCase();

  if (name.includes("review") || name.includes("comment") || name.includes("feedback")) {
    return Array.from({ length: numRows }, () => randChoice(reviewTemplates));
  }
  if (name.includes("description") || name.includes("desc")) {
    return Array.from({ length: numRows }, () => randChoice(descriptionTemplates));
  }
  if (name.includes("title") || name.includes("subject")) {
    return Array.from({ length: numRows }, () => randChoice(titleTemplates));
  }
  if (name.includes("company") || name.includes("organization") || name.includes("org")) {
    return Array.from({ length: numRows }, () => randChoice(companies));
  }
  if (name.includes("product")) {
    return Array.from({ length: numRows }, () => randChoice(products));
  }
  if (name.includes("job") || name.includes("position") || name.includes("role")) {
    return Array.from({ length: numRows }, () => randChoice(jobTitles));
  }

  // Generic fallback
  return Array.from(
    { length: numRows },
    (_, i) => `${col.name} entry ${i + 1}`,
  );
}

async function generateTextValues(col, numRows, context = {}) {
  const name = col.name.toLowerCase();
  const categories = col.categories
    ? (Array.isArray(col.categories)
        ? col.categories
        : col.categories.split(",").map((s) => s.trim()))
    : null;

  // For columns that can be generated randomly without API
  if (name.includes("name") && name.includes("first")) {
    return Array.from({ length: numRows }, () => randChoice(firstNames));
  }
  if (name.includes("name") && name.includes("last")) {
    return Array.from({ length: numRows }, () => randChoice(lastNames));
  }
  if (name.includes("name") && !name.includes("column") && !name.includes("dataset")) {
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
    const cats = categories || ["Category A", "Category B", "Category C", "Category D"];
    return Array.from({ length: numRows }, () => randChoice(cats));
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
        "USA", "UK", "Canada", "India", "Germany",
        "Japan", "Australia", "Brazil", "France", "China",
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
  if (name.includes("company") || name.includes("org")) {
    return Array.from({ length: numRows }, () => randChoice(companies));
  }
  if (name.includes("product")) {
    return Array.from({ length: numRows }, () => randChoice(products));
  }
  if (name.includes("job") || name.includes("position") || name.includes("role")) {
    return Array.from({ length: numRows }, () => randChoice(jobTitles));
  }

  // For API-based generation — only for columns that really need LLM
  let prompt = "";
  if (
    name.includes("review") ||
    name.includes("comment") ||
    name.includes("feedback")
  ) {
    prompt = `Generate ${numRows} realistic ${name.includes("review") ? "product reviews" : name.includes("comment") ? "comments" : "feedbacks"}. Each should be 10-30 words long. Make them varied and natural. Return as a JSON array of strings. Example: ["review 1","review 2"]`;
  } else if (name.includes("description")) {
    prompt = `Generate ${numRows} realistic descriptions for ${context.category || "general"} items. Each should be 20-50 words long. Return as a JSON array of strings. Example: ["desc 1","desc 2"]`;
  } else if (name.includes("title") || name.includes("subject")) {
    prompt = `Generate ${numRows} realistic titles for ${context.category || "general"} items. Each under 10 words. Return as a JSON array of strings. Example: ["title 1","title 2"]`;
  } else {
    prompt = `Generate ${numRows} realistic text entries for a data column called "${col.name}". Each should be 5-20 words long and natural sounding. Return as a JSON array of strings. Example: ["entry 1","entry 2"]`;
  }

  if (prompt) {
    try {
      const text = await callLLMAPI(prompt);
      const values = parseLLMJSON(text);
      if (!Array.isArray(values) || values.length === 0) {
        console.warn(`LLM returned invalid array for "${col.name}", using local fallback`);
        return generateLocalTextValues(col, numRows);
      }
      // Ensure we have enough values (pad if needed)
      const result = [];
      for (let i = 0; i < numRows; i++) {
        const val = values[i % values.length];
        result.push(typeof val === "string" ? val.replace(/^["']|["']$/g, "") : String(val));
      }
      return result;
    } catch (error) {
      console.warn(`LLM API failed for "${col.name}", using local fallback:`, error.message);
      return generateLocalTextValues(col, numRows);
    }
  }

  return generateLocalTextValues(col, numRows);
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
    return randChoice(Array.isArray(cats) ? cats : [cats]);
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
    try {
      textColumnValues[col.name] = await generateTextValues(col, numRows);
    } catch (err) {
      console.warn(`Failed to generate text for "${col.name}", using fallback:`, err.message);
      textColumnValues[col.name] = generateLocalTextValues(col, numRows);
    }
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
      row[col.name] = textColumnValues[col.name][i] || `${col.name} ${i + 1}`;
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
