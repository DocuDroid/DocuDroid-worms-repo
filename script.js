const github = require('@actions/github')
const fetch = require('node-fetch')

const octokit = github.getOctokit(process.env.TOKEN)
const context = github.context

const pullRequest = context.payload.pull_request;

// pullRequest.diff_url
console.log(JSON.stringify(github.context.payload, undefined, 2))

fetch(pullRequest.diff_url, { method: 'get' })
  .then(res => res.json)
  .then(data => console.log(data))

octokit.rest.issues.createComment({
  owner: pullRequest.user.login,
  repo: pullRequest.head.repo.name,
  issue_number: pullRequest.number,
  body: 'hiii',
//   body: JSON.stringify(pullRequest, null, 2),
});
