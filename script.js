const github = require('@actions/github')
const axios = require('axios')
const diff = require('diff')

const octokit = github.getOctokit(process.env.TOKEN)
const context = github.context

const pullRequest = context.payload.pull_request;

axios.get(pullRequest.diff_url)
  .then(res => {
    console.log(JSON.stringify(diff.parsePatch(res.data), null, 2))
  })

octokit.rest.issues.createComment({
  owner: pullRequest.user.login,
  repo: pullRequest.head.repo.name,
  issue_number: pullRequest.number,
  body: 'hiii',
//   body: JSON.stringify(pullRequest, null, 2),
});
