const app = require("./app");
const serverless = require("serverless-http");
module.exports.handler = serverless(app);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
