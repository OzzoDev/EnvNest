/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://envnest.com",
  generateRobotsTxt: false,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/api/*"],
};
