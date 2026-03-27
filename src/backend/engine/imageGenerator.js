// Image Generation Engine
// Uses Unsplash API to fetch high-quality images based on category

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const UNSPLASH_API_BASE = "https://api.unsplash.com";

async function fetchImageFromUnsplash(query, pageNum = 1) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn("Unsplash access key not configured");
      return null;
    }

    const searchUrl = `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(
      query,
    )}&page=${pageNum}&per_page=1&orientation=landscape`;

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
  const searchQuery = `${style} ${category}`;

  let attempts = 0;
  const maxAttempts = count * 3; // allow retries

  while (images.length < count && attempts < maxAttempts) {
    attempts++;

    // better variation
    const queryVariants = [
      searchQuery,
      `${category}`,
      `${style}`,
      `${category} photo`,
      `${style} ${category} high quality`,
    ];

    const query =
      queryVariants[Math.floor(Math.random() * queryVariants.length)];

    const imageData = await fetchImageFromUnsplash(
      query,
      Math.floor(Math.random() * 5) + 1,
    );

    if (imageData?.url) {
      const dataUrl = await imageUrlToDataUrl(imageData.url);

      images.push({
        id: images.length + 1,
        label: `${category}_${style}_${images.length + 1}`,
        dataUrl: dataUrl || imageData.url,
        url: imageData.url,
        category,
        style,
        credit: imageData.credit,
        generatedAt: new Date().toISOString(),
      });
    }
  }

  // If still not enough → fill with dummy images
  while (images.length < count) {
    images.push(generateDummyImage(category, style, images.length + 1));
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
    label: `${category}_${style}_${id}`,
    dataUrl: canvas.toDataURL(),
    category,
    style,
    generatedAt: new Date().toISOString(),
  };
}
