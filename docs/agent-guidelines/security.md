# Security and Credentials Guidelines

- Read names-only examples such as `.env.example` or `.dev.vars.example`. Never open `.env`, `.dev.vars`, or files containing real secret values.
- Never expose a real secret in commands, files, commits, logs, CI, GitHub Actions, or responses. Reference credentials as `${VAR}` and preserve that mask everywhere.
- Configured MCP servers, SDKs, CLIs, and APIs are authorized for their intended projects. Test the credential's actual scope before treating it as insufficient; do not ask for it again.
- Make direct API calls with `curl` and `${VAR}`. Do not bypass masking with `cat`, `echo`, Python, or equivalent commands.
- Keep manifests, fixtures, documentation, and generated output free of credentials. Validate every local path remains inside the repository before reading or writing it.
- Use the least-privileged available tool. Do not escalate to Chrome or desktop control when Browser or Playwright is sufficient.
- Organization-level GitHub Projects mutations require an approved GitHub App or a token with Projects scope; the repository-scoped default Actions token is not sufficient. Keep `contents` and pull-request permissions read-only unless a release publication explicitly requires write access.
- GitHub Actions security gates must use least privilege: dependency review adds
  only `pull-requests: read`, CodeQL adds only `security-events: write`, and
  release publication uses contents write only after release environment
  approval.
