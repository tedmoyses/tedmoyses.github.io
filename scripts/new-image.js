const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const { isValidPhotoId, normalizePhotoId, downloadHeroAssets } = require("./lib/unsplash");

async function ask(rl, { prompt, required = false, validate = null }) {
  while (true) {
    const value = (await rl.question(`${prompt}: `)).trim();
    if (!value) {
      if (!required) return "";
      console.log("  A value is required.");
      continue;
    }
    if (validate && !validate(value)) {
      console.log("  That value is not valid.");
      continue;
    }
    return value;
  }
}

async function main() {
  let photoId = process.argv[2] || "";
  let slug = process.argv[3] || "";

  if (photoId && !isValidPhotoId(photoId)) {
    console.log("  That photo ID is not valid.");
    photoId = "";
  }

  const rl = readline.createInterface({ input, output });

  try {
    if (!photoId) {
      photoId = await ask(rl, {
        prompt: "Unsplash photo ID (photo-...)",
        required: true,
        validate: isValidPhotoId
      });
    }

    if (!slug) {
      slug = await ask(rl, {
        prompt: "Post slug",
        required: true,
        validate: (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      });
    }

    const alt = await ask(rl, { prompt: "Hero image alt text", required: true });
    const credit = await ask(rl, { prompt: "Image credit", required: true });
    const creditUrl = await ask(rl, {
      prompt: "Image credit URL",
      required: true,
      validate: (value) => /^https?:\/\//i.test(value)
    });

    const assets = await downloadHeroAssets({ photoId: normalizePhotoId(photoId), slug });

    console.log(`\nDownloaded images for "${slug}" using ${normalizePhotoId(photoId)}`);
    console.log("\nAdd this to your post frontmatter:\n");
    console.log(`hero_image: "${assets.heroImage}"`);
    console.log(`hero_image_thumb: "${assets.thumbImage}"`);
    console.log(`hero_image_alt: "${alt}"`);
    console.log(`hero_image_width: ${assets.width}`);
    console.log(`hero_image_height: ${assets.height}`);
    console.log(`image_credit: "${credit}"`);
    console.log(`image_credit_url: "${creditUrl}"`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
