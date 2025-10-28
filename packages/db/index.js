const path = require("path");
const clientPath = path.join(__dirname, "node_modules", ".prisma", "client");
module.exports = require(clientPath);
