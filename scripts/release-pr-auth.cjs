#!/usr/bin/env node
// @ts-check

const RELEASE_PR_TITLE_PATTERN = /^chore(?:\([^()\r\n]+\))?: release\b/u;
const RELEASE_PR_LABELS = new Set([
  "autorelease: pending",
  "autorelease: tagged",
]);
const RELEASE_MIGRATION_LABEL = "release-migration";

/** @param {string} title @param {string} authorType @param {string[]} labels */
function isTrustedReleasePleasePullRequest(title, authorType, labels) {
  return (
    authorType === "Bot" &&
    RELEASE_PR_TITLE_PATTERN.test(title) &&
    labels.some((label) => RELEASE_PR_LABELS.has(label))
  );
}

/** @param {string[]} labels */
function isTrustedReleaseMigration(labels) {
  // This label is applied by a maintainer only for the one-time migration PR.
  return labels.includes(RELEASE_MIGRATION_LABEL);
}

module.exports = {
  isTrustedReleaseMigration,
  isTrustedReleasePleasePullRequest,
  RELEASE_MIGRATION_LABEL,
  RELEASE_PR_LABELS,
  RELEASE_PR_TITLE_PATTERN,
};
