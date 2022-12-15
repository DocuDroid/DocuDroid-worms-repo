const github = require('@actions/github');

const octokit = github.getOctokit(process.env.TOKEN)
const context = github.context

const pullRequest = context.payload.pull_request;

octokit.issues.createComment({
  owner: pullRequest.user.login,
  repo: pullRequest.head.repo.name,
  issue_number: pullRequest.number,
  body: 'hiii',
//   body: JSON.stringify(pullRequest, null, 2),
});
