const github = require('@actions/github');

// Create a new instance of the GitHub client
const github = new GitHub(process.env.TOKEN);
const octokit = github.getOctokit(process.env.TOKEN)
const context = github.context

// Get the pull request information from the context object
const pullRequest = context.payload.pull_request;

// Create a comment on the pull request
octokit.issues.createComment({
  owner: pullRequest.user.login,
  repo: pullRequest.head.repo.name,
  issue_number: pullRequest.number,
  body: 'hiii',
//   body: JSON.stringify(pullRequest, null, 2),
});
