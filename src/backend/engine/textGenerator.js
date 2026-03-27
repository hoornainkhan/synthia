// Text Data Generation Engine
// Uses NVIDIA NIM API via backend proxy

// Helper function to call LLM API through backend proxy with Retry Logic
async function callLLMAPI(prompt, maxRetries = 3) {
  let delay = 2000; // Start with a 2-second delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("http://localhost:4000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        // If we hit a rate limit (429), wait and try again
        if (response.status === 429 && attempt < maxRetries) {
          console.warn(
            `[TextGen] Rate limited (429). Retrying in ${delay}ms... (Attempt ${attempt} of ${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Double the wait time (2s, 4s, 8s)
          continue;
        }

        let errorMsg = `Backend error (${response.status})`;
        try {
          const errorData = await response.json();
          errorMsg += `: ${errorData.error || "Unknown error"}`;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.content || typeof data.content !== "string") {
        throw new Error("Empty or invalid content in API response");
      }
      return data.content;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("LLM API call failed after max retries:", error.message);
        throw error;
      }
    }
  }
}

// Helper function to extract and parse JSON from LLM responses
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
    console.warn("JSON parse failed:", err.message);

    // Last resort: extract quoted strings
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

export async function generateTextData({ topic, length, tone, count }) {
  const lengthMap = {
    short: "1-2 sentences",
    medium: "3-5 sentences",
    long: "a detailed paragraph",
  };

  const prompt = `Generate ${count} pieces of text about "${topic}".
Rules:
- Each piece should be ${lengthMap[length]}
- Tone: ${tone}
- Return ONLY a JSON array of strings, nothing else
- No explanation, no markdown

Example format: ["text 1", "text 2"]`;

  try {
    const text = await callLLMAPI(prompt);
    const parsed = parseLLMJSON(text);

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      console.warn("LLM returned invalid data, using fallback");
      return generateDummyTextData({ topic, length, tone, count });
    }

    // Pad results if API returned fewer than requested
    const result = [];
    for (let i = 0; i < count; i++) {
      const textItem = parsed[i % parsed.length];
      result.push({
        id: i + 1,
        text: String(textItem),
        topic,
        length,
        tone,
        wordCount: String(textItem).split(/\s+/).length,
        generatedAt: new Date().toISOString(),
      });
    }
    return result;
  } catch (error) {
    console.error("LLM API error:", error.message);
    return generateDummyTextData({ topic, length, tone, count });
  }
}

// Fallback dummy generator — used when API is unavailable
function generateDummyTextData({ topic, length, tone, count }) {
  const templates = {
    short: [
      `This is a concise ${tone} overview about ${topic}, highlighting the most essential aspects.`,
      `A brief ${tone} note on ${topic} covering the key points and main takeaways.`,
      `Short ${tone} summary discussing ${topic} and its relevance in today's context.`,
      `Quick ${tone} reference about ${topic} with essential facts and figures.`,
      `A compact ${tone} analysis of ${topic} focusing on core principles.`,
      `Introducing ${topic}: a ${tone} perspective on its significance and impact.`,
      `Key insights about ${topic} presented in a ${tone} manner for quick understanding.`,
    ],
    medium: [
      `This is a ${tone} exploration of ${topic}. It delves into the fundamental concepts and provides context for understanding its importance. The discussion covers key areas that are most relevant to current developments in the field.`,
      `Here is a ${tone} analysis of ${topic}. It examines multiple perspectives and presents evidence-based insights. The content is structured to provide both breadth and depth of understanding on the subject matter.`,
      `A comprehensive ${tone} review of ${topic}. This piece discusses the historical background, current state, and future implications. Multiple aspects are considered to provide a well-rounded perspective.`,
      `An informative ${tone} piece about ${topic} that covers the essential theories and practical applications. It draws on recent research and expert opinions to present a balanced view of the subject.`,
    ],
    long: [
      `This is a detailed ${tone} examination of ${topic}. It provides an in-depth look at the various facets of the subject, including its historical development, current applications, and future prospects. The analysis draws on multiple sources and perspectives to offer a comprehensive understanding. Key challenges and opportunities are identified, along with potential strategies for addressing them. The discussion is supported by data and examples that illustrate the practical implications of the topic.`,
      `An extensive ${tone} discussion on ${topic} that explores the subject from multiple angles. This piece covers the theoretical foundations, practical applications, and societal implications. It examines how ${topic} has evolved over time and what trends are shaping its future direction. Case studies and real-world examples are used to illustrate key points, making the content both informative and engaging for readers at all levels.`,
      `A thorough ${tone} analysis of ${topic}, examining its multifaceted nature and broad implications. The discussion spans historical context, current state of affairs, and projected developments. Through careful analysis of available evidence and expert perspectives, this piece aims to provide readers with a nuanced understanding of ${topic} and its role in shaping modern discourse and practice.`,
    ],
  };

  const selectedTemplates = templates[length] || templates.short;
  const data = [];
  for (let i = 0; i < count; i++) {
    const text = selectedTemplates[i % selectedTemplates.length];
    data.push({
      id: i + 1,
      text,
      topic,
      length,
      tone,
      wordCount: text.split(/\s+/).length,
      generatedAt: new Date().toISOString(),
    });
  }
  return data;
}
