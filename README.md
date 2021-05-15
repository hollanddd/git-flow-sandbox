GitHub as the release manager with [GitHub Actions](https://docs.github.com/en/actions/learn-github-actions). GitHub
Actions are the building blocks that power your workflow. A workflow can contain
actions created by the community, or you can create your own actions directly
within your application's repository. 

## Workflow Triggers

[events that trigger workflows](https://docs.github.com/en/actions/reference/events-that-trigger-workflows)
[workflow syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

Single event example

```yaml
# Triggered when code is pushed to any branch in a repository
on: push
```

List of events example

```yaml
# Triggers the workflow on push or pull request events
on: [push, pull_request]
```
Example ignoring paths

```yaml
on:
  push:
    paths-ignore:
      - 'docs/**'
```

You can exclude tags and branches using the `!` character. The order that you
define patterns matters.

```yaml
on:
  push:
    branches:    
      - 'releases/**'
      - '!releases/**-alpha'
```

# Flow

The goal is to emulate git flow in a way that moves the ceremony of managing
releases to the GitHub repository.

A comparison of `git-flow` commands to plain `git` and the actions that
orchestrate the flow. This table is a modification of this
[gitflow-breakdown](https://gist.github.com/JamesMGreene/cdd0ac49f90c987e45ac).

GitHub Actions aren't available until after the "Initialize" and "Connect to
remote repository" and they are omitted here.

## Features

### Create a feature branch

No changes.

gitflow | git
--------|-----
`git flow feature start MYFEATURE` | `git checkout -b feature/MYFEATURE develop`

### Share a feature branch

When the feature branch is published a pull request is generated by the workflow
and kept in sync automatically.

gitflow | git | action
--------|-----|--------
`git flow feature publish MYFEATURE` | `git checkout feature/MYFEATURE` | &nbsp;
&nbsp; | `git push origin feature/MYFEATURE` | Merge features into develop.


### Get latest for a feature branch

No changes. Work on features normally. Subsequent publishes to the feature
branch will be kept in sync with the previously created pull request.

gitflow | git
--------|-----
`git flow feature pull origin MYFEATURE` | `git checkout feature/MYFEATURE`
&nbsp; | `git pull --rebase origin feature/MYFEATURE`


### Finalize a feature branch

A pull request to merge the feature into the develop branch is automatically
created when the feature branch is created and this step is not longer needed.

gitflow | git | action
--------|-----|--------
`git flow feature finish MYFEATURE` | `git checkout develop` | Replaced
&nbsp; | `git merge --no-ff feature/MYFEATURE` | Replaced
&nbsp; | `git branch -d feature/MYFEATURE` | Replaced


### Push the merged feature branch

This step is replaced by GitHub auto merge. When checks have passed and the
minimum number of reviews has been satisfied the branch is auto merged into
develop.

The workflow requires us to pull for changes instead of push because GitHub
actions is our release manager. The origin feature branch has automatically been
deleted but can be restored. 

gitflow | git | action
--------|-----|--------
_N/A_ | `git push origin develop` | `git pull --rebase origin develop`
&nbsp; | `git push origin :feature/MYFEATURE` _(if pushed)_ | _N/A_

Note: I prefer to remove my local branch after a release.

## Releases

### Create a release branch

There are no changes. 

Note: Finalizing a release locally will cause conflicts with GitHub actions
because we are not the release manager anymore. `git flow release start` may be
used to start a releases.

gitflow | git
--------|-----
`git flow release start 1.2.0` | `git checkout -b release/1.2.0 develop`


### Share a release branch

There are no changes. When a new release branch is created the package is
updated with the release version and a pull request is submitted to develop and
trunk. Changes to each PR are kept in sync.

Note: Finalizing a release locally will cause conflicts with GitHub actions
because we are not the release manager anymore. `git flow release publish` may
be used to start a releases.

gitflow | git
--------|-----
`git flow release publish 1.2.0` | `git checkout release/1.2.0` | &nbsp;
&nbsp; | `git push origin release/1.2.0` | Tag and release


### Get latest for a release branch

There are no changes. 

gitflow | git
--------|-----
_N/A_ | `git checkout release/1.2.0`
&nbsp; | `git pull --rebase origin release/1.2.0`


### Finalize a release branch

This action is replaced by auto merge and no longer necessary. Review the
pr that merges release into develop and merge.

gitflow | git | action
--------|-----|--------
`git flow release finish 1.2.0` | `git checkout master` | Tag and release
&nbsp; | `git merge --no-ff release/1.2.0` | Tag and release
&nbsp; | `git tag -a 1.2.0` | Tag and release
&nbsp; | `git checkout develop` | Tag and release
&nbsp; | `git merge --no-ff release/1.2.0` | Tag and release
&nbsp; | `git branch -d release/1.2.0` | Tag and release

Note: Also delete any local feature branches

### Push the merged feature branch

This is replaced and we are required to pull changes from GitHub.

gitflow | git | action
--------|-----|--------
_N/A_ | `git push origin master` | `git pull --rebase origin master`
&nbsp; | `git push origin develop` | `git pull --rebase origin develop`
&nbsp; | `git push origin --tags` | `git pull origin --tags`
&nbsp; | `git push origin :release/1.2.0` _(if pushed)_ | &nbsp;


## Hotfixes

This works in the same way that releases work.

### Create a hotfix branch

gitflow | git | action
--------|-----|--------
`git flow hotfix start 1.2.1 [commit]` | `git checkout -b hotfix/1.2.1 [commit]`
| Tag and release


### Finalize a hotfix branch

This action is replaced by auto merge and no longer necessary. Review the
pr that merges the hotfix into develop and merge.

gitflow | git | action
--------|-----|--------
`git flow hotfix finish 1.2.1` | `git checkout master` | Tag and release
&nbsp; | `git merge --no-ff hotfix/1.2.1` | Tag and release
&nbsp; | `git tag -a 1.2.1` | Tag and release
&nbsp; | `git checkout develop` | Tag and release
&nbsp; | `git merge --no-ff hotfix/1.2.1` | Tag and release
&nbsp; | `git branch -d hotfix/1.2.1` | Tag and release


### Push the merged hotfix branch

This is replaced and we are required to pull changes from GitHub.

gitflow | git | action
--------|-----|--------
_N/A_ | `git push origin master` | `git pull --rebase origin master`
&nbsp; | `git push origin develop` | `git pull --rebase origin develop`
&nbsp; | `git push origin --tags` | `git pull origin --tags`
&nbsp; | `git push origin :hotfix/1.2.1` _(if pushed)_ | &nbsp;


## Debug

This workflow uses the [github-script](https://github.com/actions/github-script)
to execute JavaScript. Be sure to disable this flow when you are done developing
your workflow.

Note: In general, disabling a workflow while developing them reduces noise.

```yaml
name: Debug 
on:
  push:
jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - name: Action Script
        uses: actions/github-script@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            console.log(context);
```

## CI

Continuous Integration (CI) is different for every project. My only tips are to
use `Makefile` and multiple `actions/setup-environment` statements to make a
reusable workflow. Also consider creating a `make ci` command to reduce the
verbosity of this file. And finally, target appropriate branches to reduce the
number of workflow invocations if needed. 

```yaml
name: CI

on: [push, pull_request]

jobs:
  CI:
    runs-on: ubuntu-latest

    steps:
      - name: Check out
        uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - uses: actions/setup-go@v2
      - run: make install
      - run: make lint
      - run: make build
      - run: make test
```

## Features

Merge feature branches into the develop branch.


```yaml
name: Merge features into develop
on:
  push:
    branches:
      - 'feature/**'

jobs:
  merge:
    if: ${{ contains(github.ref, 'feature') }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Extract feature ref
        id: ref_extract
        run: echo "::set-output name=BRANCH::${GITHUB_REF:11}"

      - name: Merge features into develop
        uses: repo-sync/pull-request@v2
        with:
          destination_branch: develop
          github_token: ${{ secrets.GITHUB_TOKEN }}
          pr_title: "Merge ${{ steps.ref_extract.output.BRANCH }} into develop"
          pr_body: This PR was created by a workflow action
          pr_label: git-flow
```

Used to strip the feature from the ref:
`run: echo "::set-output name=BRANCH::${GITHUB_REF:11}"`

## Tagging & Releasing

### Tagging

Tagging is necessary for some packaging. Some actions will try to guess the tag
for you base on the commits between two tags. I found this to be unreliable and
opted to strip the tag out of the GitHub ref. `refs/heads/release/<tag>`

The choice on where to create tags is up to the team. In this example I choose
to keep tagging and preparing a release in the flow. An alternative is to break
this flow into more parts such that creating the release branch will create and
push tags and another action that listens for pushed tags would prepare the
release.

### Releases

Generate a log of changes to include in the release and push to GitHub packages

### The flow

```yaml
name: Tag Release
on:
  create:
    branches:
      - release/*
jobs:
  tag:
    runs-on: ubuntu-latest
    steps:
      - name: Extract tag from ref
        id: ref_version
        uses: actions/github-script@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            // version from refs/heads/release/x.x.x
            return { current: context.ref.substr(19, context.ref.length) }
      - uses: actions/checkout@v2
      - name: Build changelog
        id: build_changelog
        uses: ardalanamini/auto-changelog@v1.1.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          exclude: 'perf,other,breaking'

      - name: Create release
        id: create_release
        uses: zendesk/action-create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.ref_version.outputs.result.current }}
          body: ${{ steps.build_changelog.outputs.changelog }}
          tag_schema: semantic

      - name: Setup node
        uses: actions/setup-node@v2
        with:
          registry-url: 'https://npm.pkg.github.com'
          scope: '@octocat'

      - name: Bump version
        run: 'yarn version --new-version ${{ steps.ref_version.outputs.result.current }} --no-git-tag-version'

      - name: setup git config
        run: |
          # setup the username and email. I tend to use 'GitHub Actions Bot' with no email by default
          git config user.name "GitHub Actions Bot"
          git config user.email "<>"

      - name: Commit new version
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'bump version to ${{ steps.version.outputs.result.current }}'
          commit_options: '--no-verify --signoff'
          file_pattern: package.json
          status_options: '--untracked-files=no'

      - name: Merge releases into main
        uses: repo-sync/pull-request@v2
        with:
          destination_branch: main
          github_token: ${{ secrets.GITHUB_TOKEN }}
          pr_title: 'Merge release ${{ steps.version.outputs.result.current }} into main'
          pr_body: This PR was created by a workflow
          pr_label: git-flow

      - name: Merge releases into develop
        uses: repo-sync/pull-request@v2
        with:
          destination_branch: develop
          github_token: ${{ secrets.GITHUB_TOKEN }}
          pr_title: 'Merge release ${{ steps.version.outputs.result.current }} into develop'
          pr_body: This PR was created by a workflow action
          pr_label: git-flow
```

## Auto merge

If you enable auto-merge for a pull request, the pull request will merge
automatically when all required reviews are met and status checks have passed.
Auto-merge prevents you from waiting around for requirements to be met, so you
can move on to other tasks.

[set up](https://docs.github.com/en/github/administering-a-repository/managing-auto-merge-for-pull-requests-in-your-repository)

Notes:

Be sure to enforce a minimum number of reviewers (if you are on a team) and
successful checks to prevent reckless auto merging.


Use [auto updates](https://github.com/tibdex/auto-update) to keep pull requests
with auto-merge enabled up to date with their base branch.

## Publish

Publishing is specific to your application. I've included an example of
publishing an Node package to GitHub packages.

```yaml
name: Publish
on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Check out
        uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          registry-url: 'https://npm.pkg.github.com'
          scope: '@octocat'
      - name: Install
        run: npm install
      - name: Build
        run: npm run build
      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

This sandbox is for experimenting with `git` and GitHub actions. Please raise
any comments, questions, and concerns as an issue or pull request.
