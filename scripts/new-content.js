const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const { isValidPhotoId, downloadHeroAssets } = require("./lib/unsplash");

const root = path.resolve(__dirname, "..");

const DOWNLOADED_HERO_KEYS = [
  "hero_image",
  "hero_image_thumb",
  "hero_image_alt",
  "hero_image_width",
  "hero_image_height",
  "image_credit",
  "image_credit_url"
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function todayISO() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

async function suggestedOrder() {
  let max = 0;
  const dir = path.join(root, "src/projects");
  let files = [];
  try {
    files = await fsp.readdir(dir);
  } catch {
    return 1;
  }
  for (const file of files.filter((f) => f.endsWith(".md"))) {
    const text = await fsp.readFile(path.join(dir, file), "utf8");
    const match = text.match(/^order:\s*(\d+)/m);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

const defaultReplacements = {
  stack: "[]",
  hero_image_width: "1600",
  hero_image_height: "900",
  series_order: "1"
};

function escapeYaml(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function replaceTokens(line, answers, { inactive = false } = {}) {
  return line.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_, key) => {
    const value = answers[key] ?? "";
    if (inactive && !value && defaultReplacements[key]) return defaultReplacements[key];
    return escapeYaml(value);
  });
}

function renderStack(value) {
  const items = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return ["stack:", ...items.map((item) => `  - ${JSON.stringify(item)}`)];
}

function renderGroup(group, answers) {
  const joined = group.join("\n");
  const keys = [...joined.matchAll(/{{\s*([A-Za-z0-9_]+)\s*}}/g)].map((m) => m[1]);
  const fieldMatch = joined.match(/#\?\s*([A-Za-z0-9_]+):/);
  const fieldName = fieldMatch ? fieldMatch[1] : null;

  let active;
  if (fieldName === "stack") {
    active = Boolean(answers.stack);
  } else if (keys.includes("link_label") || keys.includes("link_url")) {
    active = Boolean(answers.link_label && answers.link_url);
  } else {
    active = keys.some((key) => Boolean(answers[key]));
  }

  if (active && fieldName === "stack") return renderStack(answers.stack);

  return group.map((line) => {
    const comment = active
      ? line.replace(/^(\s*)#\?( ?)/, "$1")
      : line.replace(/^(\s*)#\?( ?)/, "$1# ");
    return replaceTokens(comment, answers, { inactive: !active });
  });
}

function renderTemplate(template, answers) {
  const lines = template.split(/\r?\n/);
  const output = [];

  for (let i = 0; i < lines.length; ) {
    if (/^\s*#\?\s+/.test(lines[i])) {
      const group = [lines[i]];
      i += 1;
      while (
        i < lines.length &&
        /^\s*#\?\s+/.test(lines[i]) &&
        !/^#\?\s+[A-Za-z0-9_]+:/.test(lines[i])
      ) {
        group.push(lines[i]);
        i += 1;
      }
      output.push(...renderGroup(group, answers));
      continue;
    }
    output.push(replaceTokens(lines[i], answers));
    i += 1;
  }

  return output.join("\n");
}

async function buildConfig(type) {
  if (type === "post") {
    return {
      template: path.join(root, "_templates/post.md"),
      outputDir: path.join(root, "src/blog/posts"),
      filename: (answers) => `${answers.date}-${slugify(answers.title)}.md`,
      fields: {
        title: { prompt: "Title", required: true },
        date: {
          prompt: "Date (YYYY-MM-DD)",
          required: true,
          default: todayISO(),
          validate: isValidDate
        },
        draft: {
          prompt: "Draft? (true/false)",
          required: true,
          default: "true",
          validate: (value) => /^(true|false)$/i.test(value)
        },
        summary: { prompt: "Summary", optional: true },
        hero_image: { prompt: "Hero image path", optional: true },
        hero_image_thumb: { prompt: "Hero thumbnail path", optional: true },
        hero_image_alt: { prompt: "Hero image alt text", optional: true },
        hero_image_width: { prompt: "Hero image width", optional: true, default: "1600" },
        hero_image_height: { prompt: "Hero image height", optional: true, default: "900" },
        image_credit: { prompt: "Image credit", optional: true },
        image_credit_url: { prompt: "Image credit URL", optional: true },
        series: { prompt: "Series name", optional: true },
        series_order: { prompt: "Series order", optional: true, default: "1" }
      }
    };
  }

  if (type === "project") {
    const nextOrder = await suggestedOrder();
    return {
      template: path.join(root, "_templates/project.md"),
      outputDir: path.join(root, "src/projects"),
      filename: (answers) => `${slugify(answers.title)}.md`,
      fields: {
        title: { prompt: "Title", required: true },
        order: {
          prompt: "Order",
          required: true,
          default: String(nextOrder),
          validate: (value) => /^\d+$/.test(value)
        },
        status: {
          prompt: "Status (active/coming-soon/archived/idea)",
          required: true,
          default: "coming-soon",
          validate: (value) => ["active", "coming-soon", "archived", "idea"].includes(value)
        },
        summary: { prompt: "Summary", optional: true },
        stack: { prompt: "Stack (comma separated)", optional: true },
        link_label: { prompt: "Link label", optional: true },
        link_url: { prompt: "Link URL", optional: true }
      }
    };
  }

  return null;
}

async function ask(rl, meta) {
  const suffix = meta.default ? ` [${meta.default}]` : "";
  while (true) {
    const raw = await rl.question(`${meta.prompt}${suffix}: `);
    let value = raw.trim();

    if (!value && meta.default) value = meta.default;
    if (!value && meta.optional) return "";

    if (!value) {
      console.log("  A value is required.");
      continue;
    }

    if (meta.validate && !meta.validate(value)) {
      console.log("  That value is not valid.");
      continue;
    }

    return value;
  }
}

async function askYesNo(rl, prompt) {
  const raw = await rl.question(`${prompt} (y/N): `);
  return /^(y|yes)$/i.test(raw.trim());
}

function applyDependencies(answers) {
  if (!answers.hero_image) {
    for (const key of [
      "hero_image_thumb",
      "hero_image_alt",
      "hero_image_width",
      "hero_image_height",
      "image_credit",
      "image_credit_url"
    ]) {
      answers[key] = "";
    }
  }

  if (!answers.series) answers.series_order = "";

  if (!(answers.link_label && answers.link_url)) {
    answers.link_label = "";
    answers.link_url = "";
  }
}

async function main() {
  const type = process.argv[2];
  const config = await buildConfig(type);

  if (!config) {
    console.error("Usage: node scripts/new-content.js <post|project>");
    process.exitCode = 1;
    return;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const template = await fsp.readFile(config.template, "utf8");
    const answers = {};

    const initialKeys = type === "post" ? ["title", "date"] : ["title"];
    for (const key of initialKeys) {
      answers[key] = await ask(rl, config.fields[key]);
    }

    let heroDownloaded = false;
    if (type === "post" && (await askYesNo(rl, "Download a hero image now?"))) {
      const photoId = await ask(rl, {
        prompt: "Unsplash photo ID (photo-...)",
        required: true,
        validate: isValidPhotoId
      });
      const alt = await ask(rl, { prompt: "Hero image alt text", required: true });
      const credit = await ask(rl, { prompt: "Image credit", required: true });
      const creditUrl = await ask(rl, {
        prompt: "Image credit URL",
        required: true,
        validate: (value) => /^https?:\/\//i.test(value)
      });

      const assets = await downloadHeroAssets({ photoId, slug: slugify(answers.title) });
      Object.assign(answers, {
        hero_image: assets.heroImage,
        hero_image_thumb: assets.thumbImage,
        hero_image_alt: alt,
        hero_image_width: String(assets.width),
        hero_image_height: String(assets.height),
        image_credit: credit,
        image_credit_url: creditUrl
      });
      heroDownloaded = true;
    }

    for (const [key, meta] of Object.entries(config.fields)) {
      if (key in answers) continue;
      if (heroDownloaded && DOWNLOADED_HERO_KEYS.includes(key)) continue;
      answers[key] = await ask(rl, meta);
    }

    applyDependencies(answers);

    const filename = config.filename(answers);
    const target = path.join(config.outputDir, filename);

    try {
      await fsp.access(target, fs.constants.F_OK);
      console.error(`\nAborted: ${path.relative(root, target)} already exists.`);
      process.exitCode = 1;
      return;
    } catch {
      // File does not exist, which is what we want.
    }

    await fsp.mkdir(config.outputDir, { recursive: true });
    await fsp.writeFile(target, renderTemplate(template, answers), "utf8");
    console.log(`\nCreated ${path.relative(root, target)}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
