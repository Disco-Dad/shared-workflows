# AGENTS.md

> Guidance for AI coding agents (Claude Code, Codex, Gemini CLI) working in this repository.

## What this repo is

Reusable GitHub Actions workflows (`on: workflow_call`) for Disco-Dad projects. Public,
because private reusable workflows cannot be called across owners. It must never contain
secrets, tokens or account IDs.

| Workflow | Used by |
|---|---|
| `security.yml` | every repo: Gitleaks over full history + actionlint |
| `python-check.yml` | one job per Python app: `just install <app>` then `just check <app>` |
| `node-check.yml` | one job per TypeScript/Astro app: same commands |
| `fly-deploy.yml` | py-service apps: Fly deploy + `/health` commit check |
| `cloudflare-deploy.yml` | astro-site apps: build artifact → Workers static assets |
| `ci.yml` | this repo's own CI; ends in `ci-ok` |

`skills/new-project/` is the owner's user-level skill that creates repos from
`Disco-Dad/project-template` (installed with the skills CLI; see README.md).

`tests/fixture/` is a minimal stand-in for a generated repo that `ci.yml` runs the check
workflows against.

## Rules

- Pin every third-party action by full commit SHA with the version as a comment. Look up
  current versions and SHAs; never trust versions from memory.
- Tool binaries (Gitleaks, actionlint) are downloaded with a pinned SHA-256 check.
- `persist-credentials: false` on every checkout; `permissions: contents: read` unless a
  job needs more.
- Never interpolate `${{ }}` expressions straight into `run:`; pass them through `env:`.
- Run `actionlint` locally before pushing.
- Callers pin this repo by commit SHA of a tagged release on `main`. A breaking change to
  a workflow's inputs needs a new major tag.

## Git

Never commit to `main`; open a PR and stop. Merging is the owner's decision. Conventional
Commits; add `Assisted-by: <harness> (<model>)` to every commit you author.
