// Vercel serverless function entry point
// This simply re-exports the pre-built handler from dist/

const handler = require('../dist/src/main.js');
module.exports = handler.default || handler;
