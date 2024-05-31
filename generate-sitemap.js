require("dotenv").config();
const fs = require('fs');

// Read the sitemap template file
const template = fs.readFileSync('./sitemap-template.xml', 'utf-8');

// Replace __BASE_URL__ with the actual base URL
const base_url = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
const sitemap = template.replace(/__REACT_APP_BASE_URL__/g, base_url).replace(/LAST_MODIFIED/g, new Date().toISOString().slice(0, 19).concat("+00:00"));

// Write the modified sitemap XML to a new file
fs.writeFileSync('./public/sitemap.xml', sitemap);

const robotsTemplate = fs.readFileSync("./robots-template.txt", "utf-8");
const robotsTxt = robotsTemplate.replace(/__REACT_APP_BASE_URL__/g, base_url);

fs.writeFileSync("./public/robots.txt", robotsTxt);