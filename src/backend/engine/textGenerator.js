// Text Data Generation Engine
// Uses Google Gemini API for real text generation

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAV_i0KHOLCu0mwqulaKW4yr1uVjEOu-H8"); // Replace with your actual key
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper function to extract and parse JSON from markdown-wrapped responses
function parseGeminiJSON(text) {
  // Remove markdown code blocks if present
  let cleanText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleanText);
}

export async function generateTextData({ topic, length, tone, count }) {
  const data = [];

  const lengthMap = {
    short: "1-2 sentences",
    medium: "3-5 sentences",
    long: "a detailed paragraph",
  };

  const prompt = `Generate ${count} pieces of synthetic text data about ${topic}. Each piece should be ${lengthMap[length]} long, in a ${tone} tone. Make them realistic and varied. Return as a JSON array of strings.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseGeminiJSON(text);

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini did not return an array");
    }

    return parsed.map((textItem, index) => ({
      id: index + 1,
      text: String(textItem),
      topic,
      length,
      tone,
      wordCount: String(textItem).split(/\s+/).length,
      generatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback to dummy data if API fails
    return generateDummyTextData({ topic, length, tone, count });
  }
}

// Fallback dummy generator
function generateDummyTextData({ topic, length, tone, count }) {
  const templates = {
    short: [
      `This is a short ${tone} text about ${topic}.`,
      `Brief information regarding ${topic} in ${tone} style.`,
      `A concise note on ${topic}.`,
      `Short ${tone} overview of ${topic} topic.`,
      `Quick ${tone} reference about ${topic}.`,
    ],
    medium: [
      `This is a medium-length ${tone} text about ${topic}. It provides more details and context about the subject matter.`,
      `Here is some ${tone} content related to ${topic}. It includes additional information and examples.`,
      `A detailed explanation of ${topic} written in a ${tone} manner.`,
    ],
    long: [
      `This is a comprehensive ${tone} text about ${topic}. It covers various aspects, provides in-depth analysis, and includes multiple examples and details to give a complete understanding of the subject. The content is structured to be informative and engaging.`,
      `An extensive discussion on ${topic} presented in a ${tone} style. This text explores different perspectives, includes relevant background information, and offers insights that would be valuable for research or learning purposes.`,
    ],
  };

  const selectedTemplates = templates[length];
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      text: selectedTemplates[
        Math.floor(Math.random() * selectedTemplates.length)
      ],
      topic,
      length,
      tone,
      wordCount: 20 + Math.floor(Math.random() * 50),
      generatedAt: new Date().toISOString(),
    });
  }
  return data;
}
