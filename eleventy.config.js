module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addGlobalData("now", () => new Date());

  eleventyConfig.addFilter("slugify", function (str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  eleventyConfig.addFilter("date", function (date, format) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return format.replace("YYYY", y).replace("MM", m).replace("DD", day);
  });

  eleventyConfig.addFilter("readableDate", function (date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  });

  eleventyConfig.addFilter("htmlDateString", function (date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });

  eleventyConfig.addFilter("isExternalUrl", function (url) {
    return typeof url === "string" && /^https?:\/\//i.test(url);
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/posts/*.md").reverse();
  });

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/projects/*.md")
      .filter((item) => !item.data.draft && item.data.eleventyExcludeFromCollections !== true)
      .sort((a, b) => {
        const ao = Number.isFinite(a.data.order) ? a.data.order : Number.POSITIVE_INFINITY;
        const bo = Number.isFinite(b.data.order) ? b.data.order : Number.POSITIVE_INFINITY;
        if (ao !== bo) return ao - bo;
        return String(a.data.title || "").localeCompare(String(b.data.title || ""));
      });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
