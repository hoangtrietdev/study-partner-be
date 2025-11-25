// Vercel serverless function entry point
module.exports = async (req, res) => {
  // Import the compiled main.js which exports the serverless handler
  const handler = require('../dist/src/main').default;
  return handler(req, res);
};
