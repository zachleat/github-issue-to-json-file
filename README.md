# `github-issue-to-json-file`

## Step 1: Create a [GitHub Issue Form template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms) for your repository.

* Sample [`.github/ISSUE_TEMPLATE/built-with-eleventy.yml` on the `11ty-community` Repo](https://github.com/11ty/11ty-community/blob/main/.github/ISSUE_TEMPLATE/built-with-eleventy.yml)
* [Live Demo](https://github.com/11ty/11ty-community/issues/new?assignees=&labels=built-with-eleventy&template=built-with-eleventy.yml&title=%5BBuilt+with+Eleventy%5D+I+built+something%21)

1. Use `labels: built-with-eleventy` with a label name of your choosing. This will be used later.
2. You can control how these fields are parsed and normalized in the `body->attributes.description` field. Right now we provide:
    * `[parser:url]` to normalize URL inputs (adds the protocol, follow redirects to find final URL). Uses [`normalize-url`](https://www.npmjs.com/package/normalize-url) and [`follow-url-redirects`](https://www.npmjs.com/package/follow-url-redirects).
    * `[parser:usernames]` runs on a String of whitespace separated usernames (removing commas, `@` characters from the beginning) and returns an Array.
3. Other:
    * A single checkbox is converted to a Boolean value.

## Step 2: Add the GitHub Actions Workflow file

* Sample [`.github/workflows/issue-to-data-file.yml` on the `11ty-community` Repo](https://github.com/11ty/11ty-community/blob/main/.github/workflows/issue-to-data-file.yml)

Check out the comments below to see the customization options:

* Runs on: Issue opened, Issue edited, Issue reopened
* Control the output folder for the JSON files
* Control which GitHub Issue Form template you want to generate data from
* Use a value from the input to generate a hash for the data’s file name.

```yml
name: Convert Issues to JSON Data

on:
  issues:
    # https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#issues
    types:
      - opened
      - edited
      - reopened
      - labeled

jobs:
  update_library:
    runs-on: ubuntu-latest
    name: Convert New built-with-eleventy Issue to Sites Data
    # only continue if issue has "built-with-eleventy" label
    # require an `approved` label for moderation
    if: contains( github.event.issue.labels.*.name, 'built-with-eleventy') && contains( github.event.issue.labels.*.name, 'approved')
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: GitHub Issue to JSON
        uses: zachleat/github-issue-to-json-file@v3.0.14
        with:
          # This controls where the JSON files are generated
          folder: "built-with-eleventy/"
          # This tells the action which GitHub Issue Form template file to use
          issue-template: "built-with-eleventy.yml"
          # This controls which property we use to key the file name hash off of (values should be unique in your data set)
          hash-property-name: "url"
      - name: Commit files
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add *
          git commit -m "Adding data for #${{ env.IssueNumber }}"
          git push
      - name: Close issue
        uses: peter-evans/close-issue@v1
        with:
          issue-number: "${{ env.IssueNumber }}"
          comment: "Thank you! Your data file has been added!"
```

## Step 3: There is no step 3

Modified graciously from @katydecorah’s https://github.com/katydecorah/wordle-to-yaml-action

## Roadmap:

* Add `allow-overwrites` input, e.g.

```
  allow-overwrites:
    description: Whether or not a file can overwrite an existing file
    default: true
```