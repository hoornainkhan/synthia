// Image Generation Engine
// Uses Unsplash API to fetch high-quality images based on category

const UNSPLASH_ACCESS_KEY =
  process.env.UNSPLASH_ACCESS_KEY || process.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_SECRET_KEY =
  process.env.UNSPLASH_SECRET_KEY || process.env.VITE_UNSPLASH_SECRET_KEY;
const UNSPLASH_APP_ID =
  process.env.UNSPLASH_APP_ID || process.env.VITE_UNSPLASH_APP_ID;

const UNSPLASH_API_BASE = "https://api.unsplash.com";

async function fetchImageFromUnsplash(query, pageNum = 1) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn("Unsplash access key not configured");
      return null;
    }

    // Search for images by query/category
    const searchUrl = `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=1&orientation=landscape`;

    const resp = await fetch(searchUrl, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    if (!resp.ok) {
      console.warn("Unsplash API error", resp.status);
      return null;
    }

    const data = await resp.json();

    if (!data.results || data.results.length === 0) {
      console.warn(`No images found for query: ${query}`);
      return null;
    }

    const image = data.results[0];
    return {
      url: image.urls.regular,
      credit: {
        photographer: image.user.name,
        unsplashUrl: image.user.portfolio_url || image.user.links.html,
      },
      alt: image.alt_description || query,
    };
  } catch (error) {
    console.warn("Unsplash API fetch failed:", error);
    return null;
  }
}

async function imageUrlToDataUrl(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to convert image URL to data URL:", error);
    return null;
  }
}

export async function generateSyntheticImages({ category, style, count }) {
  const images = [];

  // Create a search query combining category and style
  const searchQuery = `${style} ${category}`;

  for (let i = 0; i < count; i++) {
    // Vary the search to get different results
    const query = i > 0 ? `${searchQuery} ${i}` : searchQuery;
    const imageData = await fetchImageFromUnsplash(
      query,
      Math.floor(i / 1) + 1,
    );

    if (imageData?.url) {
      // Note: In production, you may want to cache images or use URLs directly
      // instead of converting to data URLs for performance
      const dataUrl = await imageUrlToDataUrl(imageData.url);

      images.push({
        id: i + 1,
        label: `${category}_${style}_${i + 1}`,
        dataUrl: dataUrl || imageData.url,
        url: imageData.url,
        category,
        style,
        credit: imageData.credit,
        generatedAt: new Date().toISOString(),
      });
    } else {
      // Fallback to dummy image if Unsplash fetch fails
      images.push(generateDummyImage(category, style, i + 1));
    }
  }

  return images;
}

function generateDummyImage(category, style, id) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const colors = {
    faces: ["#f5d0a9", "#d4a76a", "#8b6f47"],
    medical: ["#1a1a2e", "#16213e", "#0f3460"],
    vehicles: ["#2c3e50", "#34495e", "#e74c3c"],
    landscape: ["#2d5016", "#4a7c23", "#6b8e23"],
  };

  const categoryColors = colors[category] || ["#666"];
  const color =
    categoryColors[Math.floor(Math.random() * categoryColors.length)];

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${category} ${style}`, 128, 128);

  return {
    id,
    label: `${category}_${id}`,
    dataUrl: canvas.toDataURL(),
    category,
    style,
    generatedAt: new Date().toISOString(),
  };
}
