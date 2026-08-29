#!/usr/bin/env node
// @ts-check

/** @param {string[]} args */
function parseTitle(args) {
  if (args.length !== 2 || args[0] !== "--title" || !args[1]) {
    throw new Error("usage: --title <pull-request-title>");
  }
  return args[1].trim();
}

/** @param {string} title */
function validateTitle(title) {
  const conventionalCommit = /^[a-z][a-z0-9-]*(?:\([^()\r\n]+\))?!?:\s+\S.*$/u;
  if (!conventionalCommit.test(title)) {
    throw new Error(
      `pull request title is not a Conventional Commit subject: ${title}`,
    );
  }
}

function main() {
  const title = parseTitle(process.argv.slice(2));
  validateTitle(title);
  console.log(`Accepted Conventional Commit title: ${title}`);
}

try {
  if (require.main === module) {
    main();
  }
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}

module.exports = { parseTitle, validateTitle };
