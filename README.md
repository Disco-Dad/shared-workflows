# shared-workflows

Reusable GitHub Actions workflows for Disco-Dad projects: security scanning, Python and
Node checks, Fly and Cloudflare deploys.

Callers pin a workflow by commit SHA with the version as a comment, and Dependabot proposes
updates:

```yaml
uses: Disco-Dad/shared-workflows/.github/workflows/security.yml@<sha> # v1.0.0
```

This repo is public because private reusable workflows cannot be called across owners. It
contains no secrets.

## Skills

`skills/new-project/` is the owner's user-level `/new-project` skill: it creates a repo from
`Disco-Dad/project-template`, generates its apps and protects `main`. Install or update it
for Claude Code, Codex and Gemini CLI with the [skills](https://github.com/vercel-labs/skills)
CLI:

```sh
npx skills add Disco-Dad/shared-workflows --skill new-project -g -a claude-code codex gemini-cli
npx skills update
```
