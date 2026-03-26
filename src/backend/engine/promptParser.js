// Prompt Parser Engine
// Parses natural language prompts to extract dataset configuration

const numberWords = {
  hundred: 100,
  thousand: 1000,
  ten: 10,
  twenty: 20,
  fifty: 50,
  "five hundred": 500,
  "two hundred": 200,
  "five thousand": 5000,
  "ten thousand": 10000,
  million: 1000000,
};

const dataTypeKeywords = {
  int: [
    "age",
    "count",
    "number",
    "quantity",
    "id",
    "year",
    "score",
    "rating",
    "rank",
    "phone",
    "zip",
  ],
  float: [
    "price",
    "salary",
    "income",
    "amount",
    "cost",
    "rate",
    "percentage",
    "weight",
    "height",
    "bmi",
    "temperature",
    "gpa",
  ],
  categorical: [
    "status",
    "category",
    "type",
    "level",
    "risk",
    "gender",
    "sex",
    "department",
    "country",
    "city",
    "state",
    "color",
    "grade",
    "class",
    "condition",
    "diagnosis",
    "diabetes",
  ],
  text: [
    "name",
    "email",
    "address",
    "description",
    "comment",
    "note",
    "title",
    "review",
    "feedback",
  ],
};

function extractNumber(prompt) {
  // Try to find explicit numbers
  const numMatch = prompt.match(
    /(\d{1,7})\s*(rows|records|entries|samples|patients|customers|users|students|transactions|items|products|employees|data\s*points)/i,
  );
  if (numMatch) return parseInt(numMatch[1]);

  // Try word-based numbers
  for (const [word, num] of Object.entries(numberWords)) {
    if (prompt.toLowerCase().includes(word)) return num;
  }

  // Default
  return 100;
}

function detectDatasetType(prompt) {
  const lower = prompt.toLowerCase();
  if (
    lower.includes("image") ||
    lower.includes("photo") ||
    lower.includes("picture") ||
    lower.includes("face") ||
    lower.includes("scan")
  ) {
    return "image";
  }
  if (
    lower.includes("text") ||
    lower.includes("article") ||
    lower.includes("review") ||
    lower.includes("paragraph") ||
    lower.includes("sentence") ||
    lower.includes("report") ||
    lower.includes("clinical note")
  ) {
    return "text";
  }
  return "tabular";
}

function extractColumns(prompt) {
  const lower = prompt.toLowerCase();
  const columns = [];

  // Try "with <column list>" patterns
  const withMatch = prompt.match(/with\s+(.+?)(?:\.|$)/i);
  if (withMatch) {
    const colText = withMatch[1];
    // Split by "and" and ","
    const parts = colText
      .split(/,\s*|\s+and\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of parts) {
      const cleaned = part
        .replace(/^(columns?|fields?|attributes?)\s*:?\s*/i, "")
        .trim();
      if (cleaned.length > 1 && cleaned.length < 50) {
        const colName = cleaned
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");
        if (colName) {
          columns.push({
            name: colName,
            type: inferType(colName),
          });
        }
      }
    }
  }

  // If no columns found, try to extract individual keywords
  if (columns.length === 0) {
    const commonColumns = [
      "name",
      "age",
      "email",
      "gender",
      "city",
      "country",
      "salary",
      "department",
      "score",
      "grade",
      "status",
      "date",
      "price",
      "quantity",
      "rating",
      "category",
      "blood_pressure",
      "diabetes",
      "risk_level",
      "bmi",
      "weight",
      "height",
      "id",
      "phone",
      "address",
      "income",
      "experience",
      "education",
      "transaction_amount",
      "account_type",
      "credit_score",
    ];
    for (const col of commonColumns) {
      const searchTerm = col.replace(/_/g, "[_ ]?");
      const regex = new RegExp(`\\b${searchTerm}\\b`, "i");
      if (regex.test(lower)) {
        columns.push({ name: col, type: inferType(col) });
      }
    }
  }

  // If still empty, add defaults based on topic detection
  if (columns.length === 0) {
    if (
      lower.includes("healthcare") ||
      lower.includes("patient") ||
      lower.includes("medical")
    ) {
      return [
        { name: "patient_id", type: "int" },
        { name: "name", type: "text" },
        { name: "age", type: "int", min: 18, max: 85 },
        { name: "gender", type: "categorical", categories: ["Male", "Female"] },
        { name: "blood_pressure", type: "int", min: 90, max: 180 },
        { name: "condition", type: "categorical" },
        {
          name: "risk_level",
          type: "categorical",
          categories: ["Low", "Medium", "High", "Critical"],
        },
      ];
    }
    if (
      lower.includes("finance") ||
      lower.includes("transaction") ||
      lower.includes("bank")
    ) {
      return [
        { name: "transaction_id", type: "int" },
        { name: "date", type: "text" },
        { name: "amount", type: "float", min: 5, max: 10000 },
        { name: "category", type: "categorical" },
        {
          name: "status",
          type: "categorical",
          categories: ["Completed", "Pending", "Failed"],
        },
      ];
    }
    if (
      lower.includes("student") ||
      lower.includes("school") ||
      lower.includes("education")
    ) {
      return [
        { name: "student_id", type: "int" },
        { name: "name", type: "text" },
        { name: "age", type: "int", min: 16, max: 30 },
        {
          name: "grade",
          type: "categorical",
          categories: ["A", "B", "C", "D", "F"],
        },
        { name: "gpa", type: "float", min: 0, max: 4 },
        { name: "department", type: "categorical" },
      ];
    }
    // Generic default
    return [
      { name: "id", type: "int" },
      { name: "name", type: "text" },
      { name: "value", type: "float", min: 0, max: 1000 },
      { name: "category", type: "categorical" },
      {
        name: "status",
        type: "categorical",
        categories: ["Active", "Inactive"],
      },
    ];
  }

  return columns;
}

function inferType(colName) {
  const lower = colName.toLowerCase();
  for (const [type, keywords] of Object.entries(dataTypeKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return type;
    }
  }
  return "text";
}

function detectTopic(prompt) {
  const lower = prompt.toLowerCase();
  if (
    lower.includes("healthcare") ||
    lower.includes("patient") ||
    lower.includes("medical") ||
    lower.includes("clinical")
  )
    return "healthcare";
  if (
    lower.includes("finance") ||
    lower.includes("transaction") ||
    lower.includes("bank") ||
    lower.includes("stock")
  )
    return "finance";
  if (
    lower.includes("ecommerce") ||
    lower.includes("e-commerce") ||
    lower.includes("product") ||
    lower.includes("order") ||
    lower.includes("customer")
  )
    return "ecommerce";
  return "healthcare";
}

function detectImageConfig(prompt) {
  const lower = prompt.toLowerCase();
  let category = "faces";
  if (
    lower.includes("medical") ||
    lower.includes("scan") ||
    lower.includes("x-ray") ||
    lower.includes("mri")
  )
    category = "medical";
  if (
    lower.includes("vehicle") ||
    lower.includes("car") ||
    lower.includes("truck")
  )
    category = "vehicles";
  if (
    lower.includes("nature") ||
    lower.includes("landscape") ||
    lower.includes("tree")
  )
    category = "nature";

  let style = "realistic";
  if (lower.includes("cartoon") || lower.includes("animated"))
    style = "cartoon";
  if (
    lower.includes("grayscale") ||
    lower.includes("black and white") ||
    lower.includes("bw")
  )
    style = "grayscale";

  const countMatch = prompt.match(
    /(\d+)\s*(images?|photos?|pictures?|samples?)/i,
  );
  const count = countMatch ? Math.min(parseInt(countMatch[1]), 20) : 6;

  return { category, style, count };
}

export function parsePrompt(prompt) {
  const datasetType = detectDatasetType(prompt);

  if (datasetType === "text") {
    const topic = detectTopic(prompt);
    let length = "short";
    if (
      prompt.toLowerCase().includes("long") ||
      prompt.toLowerCase().includes("detailed")
    )
      length = "long";
    else if (
      prompt.toLowerCase().includes("medium") ||
      prompt.toLowerCase().includes("paragraph")
    )
      length = "medium";

    let tone = "formal";
    if (
      prompt.toLowerCase().includes("casual") ||
      prompt.toLowerCase().includes("informal")
    )
      tone = "casual";

    const countMatch = prompt.match(
      /(\d+)\s*(texts?|articles?|reviews?|reports?|entries?|samples?|notes?)/i,
    );
    const count = countMatch ? Math.min(parseInt(countMatch[1]), 50) : 10;

    return {
      type: "text",
      config: { topic, length, tone, count },
    };
  }

  if (datasetType === "image") {
    return {
      type: "image",
      config: detectImageConfig(prompt),
    };
  }

  // Tabular
  const numRows = extractNumber(prompt);
  const columns = extractColumns(prompt);

  return {
    type: "tabular",
    config: { columns, numRows },
  };
}
