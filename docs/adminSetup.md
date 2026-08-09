# Getting Sanaullah admin access on the Volt-Flow repo

**Why this is needed:** branch protection rules (e.g. requiring a PR before
merging into `main`, and requiring the `Quality` and `Security` CI checks to
pass) can only be configured by someone with **Admin** permission on the
repository. Everyone currently listed as a collaborator on
`Volt-Flow/Volt-Flow` has **Write** access, which is enough to push code and
open PRs, but not enough to change repo settings like branch protection.

This doc has two parts:

1. What the **current admin/owner** needs to do to promote Sanaullah.
2. What **Sanaullah** does once he has admin access.

---

## Part 1 — Promoting Sanaullah (done by whoever owns the `Volt-Flow` org today)

`Volt-Flow` is a GitHub **Organization** (not a personal account), so there
are two ways to grant admin rights. Either is enough to unlock branch
protection — you don't need to do both.

### Option A — Repo-level Admin (simplest, scoped to just this repo)

1. Go to `https://github.com/Volt-Flow/Volt-Flow`
2. **Settings** → **Collaborators and teams**
3. Find `sanaullahkhan81` (or Sanaullah's GitHub username) in the list
4. Change their role from **Write** to **Admin**
5. Save

### Option B — Organization Owner (broader — admin on every repo in the org)

1. Go to `https://github.com/orgs/Volt-Flow/people`
2. Find Sanaullah in the member list
3. Change their role from **Member** to **Owner**

Use Option B only if Sanaullah should have this level of access across all
current and future Volt-Flow repos, not just this one.

---

## Part 2 — Setting up branch protection (done by Sanaullah, after Part 1)

Once promoted, confirm access first:

```
gh auth login          # if not already logged in as sanaullah on this machine
gh api repos/Volt-Flow/Volt-Flow --jq '.permissions'
```

You should see `"admin": true`. Then:

1. Go to `https://github.com/Volt-Flow/Volt-Flow/settings/branches`
2. Click **Add branch protection rule**
3. **Branch name pattern:** `main`
4. Check **Require a pull request before merging**
5. Check **Require status checks to pass before merging**, then search for
   and select both:
   - `Quality (lint, format, build)`
   - `Security (dependency audit)`
   (these are the two jobs defined in `.github/workflows/ci.yml`)
6. Check **Require branches to be up to date before merging** (recommended —
   catches conflicts before they land on `main`)
7. Click **Create** (or **Save changes**)

After this, nobody — including admins, unless "Do not allow bypassing the
above settings" is left unchecked — will be able to push directly to `main`
the way the `4a56efc` commit did; every change will need a PR that passes
both CI checks first.
