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
