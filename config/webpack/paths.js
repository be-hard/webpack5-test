const path = require("path");
const root = path.resolve(__dirname, "../../");
console.log(__dirname, root, "dirname, root");

module.exports = {
  root,
  src: path.resolve(root, "src"),
  dist: path.resolve(root, "dist"),
  public: path.resolve(root, "public"),
  config: path.resolve(root, "config"),
};
