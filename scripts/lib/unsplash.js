const path = require("node:path");
const fsp = require("node:fs/promises");

const root = path.resolve(__dirname, "..", "..");
const PHOTO_ID_RE = /^photo-\d+-[a-zA-Z0-9]+$/;

function normalizePhotoId(input) {
  let value = String(input ?? "").trim();

  if (value.startsWith("https://images.unsplash.com/")) {
    try {
      value = new URL(value).pathname.split("/").pop() || "";
    } catch {
      // Fall through to validation.
    }
  }

  value = value.split("?")[0].replace(/\/$/, "");

  if (!PHOTO_ID_RE.test(value)) {
    throw new Error('Expected an Unsplash photo ID like "photo-1506744038136-46273834b3fb".');
  }

  return value;
}

function isValidPhotoId(input) {
  try {
    normalizePhotoId(input);
    return true;
  } catch {
    return false;
  }
}

function buildImageUrl(photoId, { width, height, quality }) {
  const params = new URLSearchParams({
    w: String(width),
    h: String(height),
    fit: "crop",
    crop: "entropy",
    q: String(quality),
    fm: "jpg"
  });
  return `https://images.unsplash.com/${photoId}?${params.toString()}`;
}

async function downloadImage(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed with HTTP ${response.status}: ${url}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Expected an image but received ${contentType || "an unknown type"}.`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  await fsp.writeFile(destination, bytes);
}

async function fileExists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadHeroAssets({ photoId, slug }) {
  const id = normalizePhotoId(photoId);
  const safeSlug = String(slug)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!safeSlug) throw new Error("A post slug is required.");

  const dir = path.join(root, "src/assets/images/blog", safeSlug);
  const heroPath = path.join(dir, "hero.jpg");
  const thumbPath = path.join(dir, "hero-thumb.jpg");

  for (const filePath of [heroPath, thumbPath]) {
    if (await fileExists(filePath)) {
      throw new Error(`Image already exists: ${path.relative(root, filePath)}`);
    }
  }

  try {
    await downloadImage(buildImageUrl(id, { width: 1600, height: 900, quality: 80 }), heroPath);
    await downloadImage(buildImageUrl(id, { width: 800, height: 450, quality: 75 }), thumbPath);
  } catch (error) {
    await fsp.rm(heroPath, { force: true });
    await fsp.rm(thumbPath, { force: true });
    throw error;
  }

  return {
    heroImage: `/assets/images/blog/${safeSlug}/hero.jpg`,
    thumbImage: `/assets/images/blog/${safeSlug}/hero-thumb.jpg`,
    width: 1600,
    height: 900,
    thumbWidth: 800,
    thumbHeight: 450
  };
}

module.exports = {
  normalizePhotoId,
  isValidPhotoId,
  buildImageUrl,
  downloadImage,
  downloadHeroAssets
};
