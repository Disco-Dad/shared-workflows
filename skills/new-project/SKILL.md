---
name: new-project
description: Create a new GitHub repository from Disco-Dad/project-template, with its apps generated, protected main and passing checks. Use when the owner asks to start, create or set up a new project or repo.
---

# New project

A new project is a private repo made from `Disco-Dad/project-template` with the template's
scaffold script, which writes the root files and one folder per app under `apps/`. This
skill gathers the answers, runs the scaffold, writes the prose the scaffold leaves to you,
and protects `main`. Adding apps later is the generated repo's own `add-app` skill.

Commands below use `NAME` for the repo name and `PURPOSE` for its purpose; substitute them.

## Steps

1. **Gather the answers.** Ask the owner for anything their request leaves open:
   - **Name**: lowercase letters, digits and single hyphens (`price-watch`). It must not
     already exist: `gh repo view Disco-Dad/NAME` fails.
   - **Purpose**: one or two sentences: what the project does and for whom.
   - **Apps**: one or more `KIT:APP` pairs. Kits: `py-tool` (Python CLI), `py-service`
     (FastAPI on Fly.io), `astro-site` (static site on Cloudflare), `ts-package` (TypeScript
     library with optional CLI). App names follow the repo-name rules and are unique.
   - **Persistent state**: data any service must keep across redeploys, or none.

   Done when the owner has confirmed a summary of all four, which is also their go-ahead to
   create the repo.

2. **Check the machine.** `gh auth status` shows Disco-Dad, and `just`, `uv`, `pnpm`, `fnm`,
   `pre-commit` are on PATH (missing ones: `brew install` them). Done when every check
   passes.

3. **Create and clone the repo** in the folder that holds the owner's repos (the parent of
   the current repo, or `~/Documents/GitHub`):

   ```sh
   gh repo create Disco-Dad/NAME --template Disco-Dad/project-template --private --clone
   cd NAME
   ```

   GitHub copies the template in the background, so the clone can come back empty: pull
   until `.template/scaffold.py` exists (`git pull`, a few seconds apart). Then confirm the
   template version is a release, because `add-app` later fetches exactly that tag:

   ```sh
   version="$(cat .template/VERSION)"
   gh api "repos/Disco-Dad/project-template/git/ref/tags/v$version" --silent
   ```

   If the tag is missing, stop and tell the owner: `main` of the template has unreleased
   changes. Done when the clone has `.template/scaffold.py` and the tag exists.

4. **Run the scaffold**, one `--app` per app (it writes lockfiles, so it needs network):

   ```sh
   uv run --no-project --python 3.14 .template/scaffold.py init --target . \
     --name NAME --owner Disco-Dad --purpose "PURPOSE" --app KIT:APP --app KIT:APP
   ```

   Done when it exits 0 and `.template/` is gone.

5. **Write the prose.** In `AGENTS.md` section 1, replace the `<!-- fill: -->` comment: add
   to **Core Purpose** only what an agent needs beyond the purpose sentence (users, the main
   flow, constraints), and set **Persistent state** from step 1. Expand the purpose paragraph
   in `README.md` the same way. Leave everything the scaffold generated as it is. Done when
   `grep -rn 'fill:' AGENTS.md README.md` finds nothing.

6. **Install and check.**

   ```sh
   just setup && just check
   ```

   Done when `just check` passes. A failure here is a template bug: report it to the owner
   with the output instead of editing generated files to make it pass.

7. **Push the generated project to `main`.** This is the one commit that skips the review
   flow, because `main` is not protected yet. The hooks `just setup` installed run, except
   the one that blocks commits on `main`:

   ```sh
   git add -A
   SKIP=no-commit-to-branch git commit -m "feat: generate project from project-template v$version" \
     -m "Assisted-by: <harness> (<model>)"
   git push origin main
   ```

   Fill in the trailer with your own harness and model, as the generated `AGENTS.md` asks of
   every commit. Done when the push succeeded.

8. **Configure the repo.** Squash-only merges with the PR title as the commit message,
   branches deleted on merge, the five triage labels, and the `main` ruleset from
   [ruleset-main.json](ruleset-main.json) (PR and `ci-ok` required, no force-push or
   deletion, no bypass). Squash commits keep the commit messages as their body, so the
   `Assisted-by:` trailers survive the merge:

   ```sh
   gh api -X PATCH repos/Disco-Dad/NAME -F allow_squash_merge=true -F allow_merge_commit=false \
     -F allow_rebase_merge=false -F delete_branch_on_merge=true \
     -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=COMMIT_MESSAGES --silent
   for label in needs-triage needs-info ready-for-agent ready-for-human wontfix; do
     gh label create "$label" --repo Disco-Dad/NAME --force
   done
   ruleset=~/.agents/skills/new-project/ruleset-main.json   # where the skills CLI installs it
   test -f "$ruleset" && gh api -X POST repos/Disco-Dad/NAME/rulesets --input "$ruleset" --silent
   ```

   If the file is not there, use `ruleset-main.json` next to this `SKILL.md`. Done when
   `gh api repos/Disco-Dad/NAME/rulesets --jq '.[].name'` prints `protect-main`.

9. **Prove `main` is protected.** A direct push must now be rejected:

   ```sh
   SKIP=no-commit-to-branch git commit --allow-empty -m "test: direct push to main"
   git push origin main   # must fail with "repository rule violations"
   git reset --hard origin/main
   ```

   If the push succeeded, tell the owner at once: the ruleset is not enforced, and the empty
   test commit is now on `main` (the reset does not remove it). Done when the
   push was rejected and `git status` shows `main` level with `origin/main`.

10. **Wait for CI on `main`.** `gh run watch "$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status`.
    Done when the run is green.

11. **Hand over.** Tell the owner the repo URL, the apps, and any setup only they can do:
    deploy steps in each `apps/APP/README.md` (tokens, GitHub environments), as a
    checklist. New work goes on a branch with a PR from here on.
