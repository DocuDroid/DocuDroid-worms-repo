const { context, GitHub } = require('@actions/github');

// Create a new instance of the GitHub client
const github = new GitHub(process.env.GITHUB_TOKEN);

// Get the pull request information from the context object
const pullRequest = context.payload.pull_request;

// Create a comment on the pull request
const comment = await github.issues.createComment({
  owner: pullRequest.user.login,
  repo: pullRequest.head.repo.name,
  issue_number: pullRequest.number,
  body: 'This is a comment from the GitHub Actions workflow.'
});
