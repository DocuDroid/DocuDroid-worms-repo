const github = require('@actions/github')
const axios = require('axios')dddd
ddd
const octokit = github.getOctokit(process.env.TOKEN)
const context = github.context

const pullRequest = context.payload.pull_request; test

axios.get(pullRequest.diff_url)
  .then(res => {
    console.log(JSON.stringify(Diff.parsePatch(res.data), null, 2))
  })

octokit.rest.issues.createComment({ test test
  owner: pullRequest.user.login,
  repo: pullRequest.head.repo.name,
  issue_number: pullRequest.number,
  body: 'hiii',test test test
//   body: JSON.stringify(pullRequest, null, 2), test test
});
