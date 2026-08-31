// @ts-check

/**
 * @param {unknown} error
 * @returns {string}
 */
function formatError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

module.exports = { formatError };
