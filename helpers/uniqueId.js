function uniqueId() {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36);
  return dateString + randomness;
}

module.exports = uniqueId;
