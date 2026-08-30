#!/usr/bin/env node
// @ts-check

/** @param {string[]} args */
function parseTitle(args) {
  if (args.length !== 2 || args[0] !== "--title" || !args[1]) {
    throw new Error("usage: --title <pull-request-title>");
  }
  return args[1].trim();
}

const CONVENTIONAL_COMMIT_SUBJECT =
  /^[a-z][a-z0-9-]*(?:\([^()\r\n]+\))?!?:\s+\S.*$/u;

/** @param {string} subject @param {string} label */
function validateSubject(subject, label) {
  if (!CONVENTIONAL_COMMIT_SUBJECT.test(subject)) {
    throw new Error(
      `${label} is not a Conventional Commit subject: ${subject}`,
    );
  }
}

/** @param {string} title */
function validateTitle(title) {
  validateSubject(title, "pull request title");
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

module.exports = {
  CONVENTIONAL_COMMIT_SUBJECT,
  parseTitle,
  validateSubject,
  validateTitle,
};
