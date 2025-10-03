module.exports.debugError = (where, err) => {
  console.error(`❌ ERROR in ${where}:`, {
    message: err.message,
    stack: err.stack,
    raw: err, // sometimes DynamoDB errors have extra fields
  });
};
