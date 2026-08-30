// @ts-check

const DIRECT_PUSH_PATH_PATTERNS = [
  /^docs(?:\/|$)/u,
  /^AGENTS\.md$/u,
  /^README\.md$/u,
];

/** @param {string} filePath */
function isDirectPushPath(filePath) {
  return DIRECT_PUSH_PATH_PATTERNS.some((pattern) => pattern.test(filePath));
}

/** @param {string[]} paths */
function classifyDirectPushPaths(paths) {
  const uniquePaths = [...new Set(paths)];
  const disallowedPaths = uniquePaths.filter(
    (filePath) => !isDirectPushPath(filePath),
  );
  return {
    allowed: disallowedPaths.length === 0,
    disallowedPaths,
  };
}

module.exports = {
  classifyDirectPushPaths,
  isDirectPushPath,
};
